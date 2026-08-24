import { createVerify } from 'crypto';
import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  currencyCodeToIso4217,
  getMonobankToken,
  toMinorUnits,
} from './monobank.config';
import { MONOBANK_ERRORS } from './monobank.errors';

const MONO_API_BASE = 'https://api.monobank.ua';
const MONO_INVOICE_CREATE_URL = `${MONO_API_BASE}/api/merchant/invoice/create`;
const MONO_INVOICE_STATUS_URL = `${MONO_API_BASE}/api/merchant/invoice/status`;
const MONO_PUBKEY_URL = `${MONO_API_BASE}/api/merchant/pubkey`;

export type MonobankBasketItem = {
  name: string;
  qty: number;
  /** Unit price in minor units. */
  sum: number;
  /** Line total in minor units. */
  total: number;
  code: string;
  unit?: string;
};

export type CreateMonobankInvoiceInput = {
  amountMajor: number;
  currency: string;
  reference: string;
  destination: string;
  redirectUrl: string;
  webHookUrl?: string;
  basket: MonobankBasketItem[];
  validitySeconds?: number;
};

export type CreateMonobankInvoiceResult = {
  invoiceId: string;
  pageUrl: string;
};

export type MonobankInvoiceStatus = {
  invoiceId: string;
  status: string;
  reference?: string;
  modifiedDate?: string;
  failureReason?: string;
};

export type CreateMonobankInvoiceFetchSuccessResult = {
  invoiceId: string;
  pageUrl: string;
};

export type CreateMonobankInvoiceFetchFailResult = {
  errCode: string;
  errText: string;
};

@Injectable()
export class MonobankService {
  private cachedPubKeyPem: string | null = null;
  private cachedPubKeyAt = 0;
  private createInvoicePayload(amount, ccy, input) {
    return {
      amount,
      ccy,
      merchantPaymInfo: {
        reference: input.reference,
        destination: input.destination,
        basketOrder: input.basket,
      },
      redirectUrl: input.redirectUrl,
      ...(input.webHookUrl ? { webHookUrl: input.webHookUrl } : {}),
      validity: input.validitySeconds ?? 3600,
    };
  }
  async createInvoice(
    input: CreateMonobankInvoiceInput,
  ): Promise<CreateMonobankInvoiceResult> {
    const token = this.requireToken();

    let ccy: number;
    try {
      ccy = currencyCodeToIso4217(input.currency);
      //todo add enum to the DB level and remove try-catch here
    } catch {
      throw new BadGatewayException(MONOBANK_ERRORS.UNSUPPORTED_CURRENCY);
    }

    const amount = toMinorUnits(input.amountMajor);
    //todo: moove this check to the order level
    if (amount <= 0) {
      throw new BadGatewayException(MONOBANK_ERRORS.INVALID_AMOUNT);
    }

    const body = this.createInvoicePayload(amount, ccy, input);

    let response: Response;
    try {
      response = await fetch(MONO_INVOICE_CREATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Token': token,
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new BadGatewayException(MONOBANK_ERRORS.REQUEST_FAILED);
      //todo: add orderPaymentHistory table with the records which are consist of the Date OrderId Status ErrorMsg
    }
    const data = (await response.json()) as
      | CreateMonobankInvoiceFetchSuccessResult
      | CreateMonobankInvoiceFetchFailResult;

    if (
      data?.errCode ||
      (data?.errText && !data?.invoiceId && !data?.pageUrl)
    ) {
      throw new BadGatewayException({
        ...MONOBANK_ERRORS.CREATE_FAILED,
        message: data?.errText || MONOBANK_ERRORS.CREATE_FAILED.message,
      });
    }
    return {
      invoiceId: data.invoiceId,
      pageUrl: data.pageUrl,
    };
  }
  //
  //   // try {
  //   //   const payload =  await response.
  //   // } catch {}
  //   //
  //   // const payload =  as
  //   //   | CreateMonobankInvoiceFetchSuccessResult
  //   //   | CreateMonobankInvoiceFetchFailResult;
  //   if (null === response) {
  //     throw new BadGatewayException(MONOBANK_ERRORS.NOT_CONFIGURED.message);
  //   }
  //   if (
  //     response.ok &&
  //     respons.hasOwnProperty('invoiceId') &&
  //     respons.hasOwnProperty('pageUrl') &&
  //     response.invoiceId &&
  //     response.pageUrl
  //   ) {
  //   } else {
  //     throw new BadGatewayException({
  //       ...MONOBANK_ERRORS.CREATE_FAILED,
  //       message: response?.errText || MONOBANK_ERRORS.CREATE_FAILED.message,
  //     });
  //   }
  // }

  async getInvoiceStatus(invoiceId: string): Promise<MonobankInvoiceStatus> {
    const token = this.requireToken();

    let response: Response;
    try {
      response = await fetch(
        `${MONO_INVOICE_STATUS_URL}?invoiceId=${encodeURIComponent(invoiceId)}`,
        {
          headers: { 'X-Token': token },
        },
      );
    } catch {
      throw new BadGatewayException(MONOBANK_ERRORS.REQUEST_FAILED);
    }

    const payload = (await response
      .json()
      .catch(() => null)) as MonobankInvoiceStatus | null;

    if (!response.ok || !payload?.invoiceId || !payload?.status) {
      throw new BadGatewayException(MONOBANK_ERRORS.STATUS_FAILED);
    }

    return payload;
  }

  /**
   * Verify Monobank acquiring webhook ECDSA signature (X-Sign).
   * @see https://api.monobank.ua/docs/acquiring.html
   */
  async assertValidWebhookSignature(
    rawBody: Buffer,
    xSignBase64: string | undefined,
  ): Promise<void> {
    if (!xSignBase64) {
      throw new UnauthorizedException(MONOBANK_ERRORS.INVALID_SIGNATURE);
    }

    const publicKeyPem = await this.getMerchantPublicKeyPem();
    const signatureBuf = Buffer.from(xSignBase64, 'base64');
    const verify = createVerify('SHA256');
    verify.update(rawBody);
    verify.end();

    const ok = verify.verify(publicKeyPem, signatureBuf);
    if (!ok) {
      throw new UnauthorizedException(MONOBANK_ERRORS.INVALID_SIGNATURE);
    }
  }

  private requireToken(): string {
    try {
      return getMonobankToken();
    } catch {
      throw new ServiceUnavailableException(MONOBANK_ERRORS.NOT_CONFIGURED);
    }
  }

  private async getMerchantPublicKeyPem(): Promise<string> {
    const now = Date.now();
    if (this.cachedPubKeyPem && now - this.cachedPubKeyAt < 60 * 60 * 1000) {
      return this.cachedPubKeyPem;
    }

    const token = this.requireToken();
    let response: Response;
    try {
      response = await fetch(MONO_PUBKEY_URL, {
        headers: { 'X-Token': token },
      });
    } catch {
      throw new BadGatewayException(MONOBANK_ERRORS.REQUEST_FAILED);
    }

    const payload = (await response.json().catch(() => null)) as {
      key?: string;
    } | null;

    if (!response.ok || !payload?.key) {
      throw new BadGatewayException(MONOBANK_ERRORS.PUBKEY_FAILED);
    }

    // API returns base64-encoded PEM.
    const pem = Buffer.from(payload.key, 'base64').toString('utf8');
    this.cachedPubKeyPem = pem;
    this.cachedPubKeyAt = now;
    return pem;
  }
}

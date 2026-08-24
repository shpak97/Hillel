import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { validateResponseDto } from 'src/common/utils/validate-response.util';
import { GuestMenuResponseDto } from './dto/guest-menu-response.dto';
import {
  CreateGuestOrderDto,
  GuestOrderResponseDto,
  GuestOrderStatusResponseDto,
} from './dto/guest-order.dto';
import { GuestQrResponseDto } from './dto/guest-qr-response.dto';
import { GuestRestaurantResponseDto } from './dto/guest-restaurant-response.dto';
import { GuestTableResponseDto } from './dto/guest-table-response.dto';
import { GuestService } from './guest.service';

@Controller('guest')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Get('r/:slug')
  async getRestaurant(@Param('slug') slug: string) {
    const result = await this.guestService.getRestaurantBySlug(slug);
    return validateResponseDto(GuestRestaurantResponseDto, result);
  }

  @Get('r/:slug/q/:qrUuid')
  async getQr(@Param('slug') slug: string, @Param('qrUuid') qrUuid: string) {
    const result = await this.guestService.getQrBySlugAndUuid(slug, qrUuid);
    return validateResponseDto(GuestQrResponseDto, result);
  }

  @Get('r/:slug/m/:menuUuid')
  async getMenu(
    @Param('slug') slug: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    const result = await this.guestService.getMenuBySlugAndUuid(slug, menuUuid);
    return validateResponseDto(GuestMenuResponseDto, result);
  }

  @Get('r/:slug/t/:tableUuid')
  async getTable(
    @Param('slug') slug: string,
    @Param('tableUuid') tableUuid: string,
  ) {
    const result = await this.guestService.getTableBySlugAndUuid(
      slug,
      tableUuid,
    );
    return validateResponseDto(GuestTableResponseDto, result);
  }

  @Post('r/:slug/orders')
  async createOrder(
    @Param('slug') slug: string,
    @Body() dto: CreateGuestOrderDto,
  ) {
    const result = await this.guestService.createOrderCheckout(slug, dto);
    return validateResponseDto(GuestOrderResponseDto, result);
  }

  @Get('r/:slug/orders/:orderUuid')
  async getOrder(
    @Param('slug') slug: string,
    @Param('orderUuid') orderUuid: string,
  ) {
    const result = await this.guestService.getOrderStatus(slug, orderUuid);
    return validateResponseDto(GuestOrderStatusResponseDto, result);
  }

  @Post('payments/monobank/webhook')
  @HttpCode(200)
  async monobankWebhook(
    @Req() req: { rawBody?: Buffer },
    @Headers('x-sign') xSign: string | undefined,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { ok: true };
    }

    return this.guestService.handleMonobankWebhook(rawBody, xSign);
  }
}

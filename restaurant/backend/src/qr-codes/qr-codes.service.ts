import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
} from 'src/acl/acl.constants';
import { buildGuestQrUrl } from 'src/common/guest/guest-url.builder';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { MenusData } from 'src/menus/menus.data';
import type { QrFormat } from 'src/qr/qr.constants';
import {
  buildQrEndpointResult,
  type QrEndpointResult,
} from 'src/qr/qr-endpoint.util';
import { QrService } from 'src/qr/qr.service';
import type { QrJsonPayload } from 'src/qr/qr.service';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import {
  CreateQrCodeDto,
  QrCodeMenuInputDto,
  UpdateQrCodeDto,
} from './dto/qr-code.dto';
import { QrCodesData, type QrCodeWithMenus } from './qr-codes.data';
import { QR_CODES_ERRORS } from './qr-codes.errors';

export type QrCodeMenuResponse = {
  menuId: string;
  menuName: string;
  selectTable: boolean;
  sortOrder: number;
};

export type QrCodeResponse = {
  uuid: string;
  restaurantId: string;
  name: string;
  isActive: boolean;
  url: string;
  menus: QrCodeMenuResponse[];
};

export type QrCodeImagePayload = QrJsonPayload;

@Injectable()
export class QrCodesService {
  constructor(
    private readonly qrCodesData: QrCodesData,
    private readonly menusData: MenusData,
    private readonly restaurantsService: RestaurantsService,
    private readonly qrService: QrService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
  ): Promise<QrCodeResponse[]> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
    const items = await this.qrCodesData.findManyByRestaurant(restaurantId);
    return items.map((item) => this.toResponse(item, restaurant.slug));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<QrCodeResponse> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
    const qrCode = await this.getAccessibleQrCode(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(qrCode, restaurant.slug);
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateQrCodeDto,
  ): Promise<QrCodeResponse> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );
    await this.assertMenusValid(restaurantId, dto.menus);

    try {
      const created = await this.qrCodesData.createWithMenus(
        restaurantId,
        dto.name,
        dto.menus,
      );
      return this.toResponse(created, restaurant.slug);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(QR_CODES_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    uuid: string,
    dto: UpdateQrCodeDto,
  ): Promise<QrCodeResponse> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );
    await this.getAccessibleQrCode(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    if (dto.menus !== undefined) {
      await this.assertMenusValid(restaurantId, dto.menus);
    }

    try {
      const updated = await this.qrCodesData.updateWithMenus(
        uuid,
        {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.isActive !== undefined
            ? activeStateFromFlag(dto.isActive)
            : {}),
        },
        dto.menus,
      );
      return this.toResponse(updated, restaurant.slug);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(QR_CODES_ERRORS.UPDATE_FAILED);
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    uuid: string,
  ): Promise<void> {
    await this.getAccessibleQrCode(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.qrCodesData.update(uuid, { deletedAt: new Date() });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(QR_CODES_ERRORS.DELETE_FAILED);
    }
  }

  async getQr(
    userId: number,
    restaurantId: string,
    uuid: string,
    format: QrFormat,
  ): Promise<QrEndpointResult<QrCodeImagePayload>> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
    await this.getAccessibleQrCode(
      userId,
      restaurantId,
      uuid,
      ACL_PERMISSION_WRITE,
    );

    const url = buildGuestQrUrl({
      restaurantSlug: restaurant.slug,
      qrUuid: uuid,
    });

    return buildQrEndpointResult(
      this.qrService,
      url,
      format,
      `qr-code-${uuid}-qr`,
      (payload) => payload,
      {
        style: restaurant.qrStyle,
        logo: restaurant.qrLogo,
      },
    );
  }

  private async assertMenusValid(
    restaurantId: string,
    menus: QrCodeMenuInputDto[],
  ): Promise<void> {
    const seen = new Set<string>();

    for (const item of menus) {
      if (seen.has(item.menuId)) {
        throw new BadRequestException(QR_CODES_ERRORS.DUPLICATE_MENU);
      }
      seen.add(item.menuId);

      const menu = await this.menusData.findByUuid(item.menuId);
      if (!menu || menu.deletedAt || menu.restaurantId !== restaurantId) {
        throw new BadRequestException(
          QR_CODES_ERRORS.menuNotFoundInRestaurant(item.menuId),
        );
      }

      if (menu.deactivatedAt) {
        throw new BadRequestException(
          QR_CODES_ERRORS.menuInactive(item.menuId),
        );
      }
    }
  }

  private async getAccessibleQrCode(
    userId: number,
    restaurantId: string,
    uuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<QrCodeWithMenus> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      permission,
    );

    const qrCode = await this.qrCodesData.findByUuid(uuid);
    if (!qrCode || qrCode.deletedAt || qrCode.restaurantId !== restaurantId) {
      throw new NotFoundException(QR_CODES_ERRORS.NOT_FOUND);
    }

    return qrCode;
  }

  private toResponse(
    qrCode: QrCodeWithMenus,
    restaurantSlug: string,
  ): QrCodeResponse {
    return {
      uuid: qrCode.uuid,
      restaurantId: qrCode.restaurantId,
      name: qrCode.name,
      isActive: isEntityActive(qrCode.deactivatedAt, qrCode.deletedAt),
      url: buildGuestQrUrl({
        restaurantSlug,
        qrUuid: qrCode.uuid,
      }),
      menus: qrCode.menus.map((link) => ({
        menuId: link.menuId,
        menuName: link.menu.name,
        selectTable: link.selectTable,
        sortOrder: link.sortOrder,
      })),
    };
  }
}

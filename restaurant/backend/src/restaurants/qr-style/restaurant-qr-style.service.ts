import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
} from 'src/acl/acl.constants';
import { deleteUploadedImageIfExists } from 'src/uploads/delete-uploaded-image';
import { ImageEntityFolder } from 'src/uploads/image-upload';
import {
  DEFAULT_QR_STYLE,
  mergeQrStyle,
  type QrStyleOptions,
} from 'src/qr/qr-style.defaults';
import { RestaurantsData } from '../restaurants.data';
import { RestaurantsService } from '../restaurants.service';
import { RESTAURANTS_ERRORS } from '../restaurants.errors';
import type { UpdateRestaurantQrStyleDto } from './dto/qr-style.dto';

export type RestaurantQrStyleResponse = {
  style: QrStyleOptions;
  logo: string | null;
};

@Injectable()
export class RestaurantQrStyleService {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly restaurantsData: RestaurantsData,
  ) {}

  async getStyle(
    userId: number,
    restaurantId: string,
  ): Promise<RestaurantQrStyleResponse> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );

    return this.toResponse(restaurant.qrStyle, restaurant.qrLogo);
  }

  async updateStyle(
    userId: number,
    restaurantId: string,
    dto: UpdateRestaurantQrStyleDto,
    logoPatch?: string | null,
  ): Promise<RestaurantQrStyleResponse> {
    const restaurant = await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_WRITE,
    );

    const previousLogo = restaurant.qrLogo;
    const nextLogo =
      logoPatch !== undefined ? logoPatch : (previousLogo ?? null);

    try {
      // Persist merged/clamped style so generation and editor see the same values
      // (e.g. logo size capped, solid color dropped when gradient is set).
      const styleToStore = mergeQrStyle(
        dto.style as QrStyleOptions,
      ) as PrismaJson.RestaurantQrStyle;

      const updated = await this.restaurantsData.update(restaurantId, {
        qrStyle: styleToStore,
        qrLogo: nextLogo,
      });

      if (previousLogo && previousLogo !== nextLogo) {
        await deleteUploadedImageIfExists(
          previousLogo,
          ImageEntityFolder.QR_LOGO,
        );
      }

      return this.toResponse(updated.qrStyle, updated.qrLogo);
    } catch {
      if (logoPatch) {
        await deleteUploadedImageIfExists(logoPatch, ImageEntityFolder.QR_LOGO);
      }
      throw new InternalServerErrorException(RESTAURANTS_ERRORS.UPDATE_FAILED);
    }
  }

  /** Public for QrService (step 3) — no ACL, caller must already know restaurant. */
  resolveStyle(
    qrStyle: PrismaJson.RestaurantQrStyle | null | undefined,
    qrLogo: string | null | undefined,
  ): RestaurantQrStyleResponse {
    return this.toResponse(qrStyle, qrLogo);
  }

  private toResponse(
    qrStyle: PrismaJson.RestaurantQrStyle | null | undefined,
    qrLogo: string | null | undefined,
  ): RestaurantQrStyleResponse {
    return {
      style: mergeQrStyle((qrStyle ?? DEFAULT_QR_STYLE) as QrStyleOptions),
      logo: qrLogo ?? null,
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { OptionalFileInterceptor } from 'src/common/interceptors/optional-file.interceptor';
import { parseOptionalBoolean } from 'src/common/utils/form-value.util';
import {
  isMultipartRequest,
  resolvePhotoPatch,
  validateDto,
} from 'src/common/utils/patch-body.util';
import { validateResponseDto } from 'src/common/utils/validate-response.util';
import {
  getQrLogoPublicPath,
  qrLogoMulterOptions,
} from 'src/uploads/qr-logo.multer';
import { RestaurantQrStyleResponseDto } from './dto/qr-style-response.dto';
import {
  RestaurantQrStyleDto,
  UpdateRestaurantQrStyleDto,
} from './dto/qr-style.dto';
import { RestaurantQrStyleService } from './restaurant-qr-style.service';

@Controller('restaurants/:uuid/qr-style')
@UseGuards(AuthGuard)
export class RestaurantQrStyleController {
  constructor(
    private readonly restaurantQrStyleService: RestaurantQrStyleService,
  ) {}

  @Get()
  async getStyle(@CurrentUserId() userId: number, @Param('uuid') uuid: string) {
    const result = await this.restaurantQrStyleService.getStyle(userId, uuid);
    return validateResponseDto(RestaurantQrStyleResponseDto, result);
  }

  @Put()
  @UseInterceptors(OptionalFileInterceptor('logo', qrLogoMulterOptions))
  async updateStyle(
    @CurrentUserId() userId: number,
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const dto = validateDto(
      UpdateRestaurantQrStyleDto,
      this.parseUpdateBody(req, body),
    );

    const logoPatch = resolvePhotoPatch({
      removePhoto: dto.removeLogo,
      file,
      getPath: getQrLogoPublicPath,
    });

    const result = await this.restaurantQrStyleService.updateStyle(
      userId,
      uuid,
      dto,
      logoPatch,
    );
    return validateResponseDto(RestaurantQrStyleResponseDto, result);
  }

  private parseUpdateBody(
    req: Request,
    body: Record<string, unknown>,
  ): UpdateRestaurantQrStyleDto {
    if (!isMultipartRequest(req)) {
      return body as unknown as UpdateRestaurantQrStyleDto;
    }

    const styleRaw = body.style;
    let style: unknown = styleRaw;

    if (typeof styleRaw === 'string') {
      try {
        style = JSON.parse(styleRaw) as unknown;
      } catch {
        style = {};
      }
    }

    if (style === undefined || style === null || style === '') {
      style = this.extractStyleFromFlatBody(body);
    }

    return {
      style: style as RestaurantQrStyleDto,
      removeLogo: parseOptionalBoolean(body.removeLogo),
    };
  }

  private extractStyleFromFlatBody(
    body: Record<string, unknown>,
  ): RestaurantQrStyleDto {
    const {
      removeLogo: _removeLogo,
      logo: _logo,
      style: _style,
      ...rest
    } = body;
    return rest;
  }
}

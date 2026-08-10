import { Controller, Get, Param } from '@nestjs/common';
import { validateResponseDto } from 'src/common/utils/validate-response.util';
import { GuestMenuResponseDto } from './dto/guest-menu-response.dto';
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
}

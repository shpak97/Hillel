import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { validateResponseDtoList } from 'src/common/utils/validate-response.util';
import { SectionMenuItemResponseDto } from 'src/menu-items/dto/menu-item-response.dto';
import { ReplaceMenuSectionItemsDto } from './dto/menu-section-items.dto';
import { MenuSectionItemsService } from './menu-section-items.service';

@Controller(
  'restaurants/:restaurantUuid/menus/:menuUuid/sections/:sectionUuid/items',
)
@UseGuards(AuthGuard)
export class MenuSectionItemsController {
  constructor(private readonly menuSectionItemsService: MenuSectionItemsService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Param('sectionUuid') sectionUuid: string,
  ) {
    const result = await this.menuSectionItemsService.findAll(
      userId,
      restaurantUuid,
      menuUuid,
      sectionUuid,
    );
    return validateResponseDtoList(SectionMenuItemResponseDto, result);
  }

  @Put()
  async replaceItems(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Param('sectionUuid') sectionUuid: string,
    @Body() dto: ReplaceMenuSectionItemsDto,
  ) {
    const result = await this.menuSectionItemsService.replaceItems(
      userId,
      restaurantUuid,
      menuUuid,
      sectionUuid,
      dto,
    );
    return validateResponseDtoList(SectionMenuItemResponseDto, result);
  }
}

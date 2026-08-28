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
import {
  MenuItemsService,
  MenuItemResponse,
} from 'src/menu-items/menu-items.service';
import { MenuItemsData } from 'src/menu-items/menu-items.data';
import { ReplaceMenuSectionItemsDto } from './dto/menu-section-items.dto';
import { MenuSectionItemsData } from './menu-section-items.data';
import { MENU_SECTIONS_ERRORS } from './menu-sections.errors';
import { MenuSectionsData } from './menu-sections.data';
import { MenusService } from '../menus.service';

export type SectionMenuItemResponse = MenuItemResponse & {
  sortOrder: number;
};

@Injectable()
export class MenuSectionItemsService {
  constructor(
    private readonly menuSectionItemsData: MenuSectionItemsData,
    private readonly menuSectionsData: MenuSectionsData,
    private readonly menuItemsData: MenuItemsData,
    private readonly menuItemsService: MenuItemsService,
    private readonly menusService: MenusService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
  ): Promise<SectionMenuItemResponse[]> {
    await this.assertSectionAccess(
      userId,
      restaurantId,
      menuId,
      sectionUuid,
      ACL_PERMISSION_READ,
    );

    const links =
      await this.menuSectionItemsData.findManyBySection(sectionUuid);

    return links
      .filter((link) => !link.menuItem.deletedAt)
      .map((link) => ({
        ...this.menuItemsService.toResponse(
          link.menuItem,
          link.menuItem.products,
        ),
        sortOrder: link.sortOrder,
      }));
  }

  async replaceItems(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
    dto: ReplaceMenuSectionItemsDto,
  ): Promise<SectionMenuItemResponse[]> {
    await this.assertSectionAccess(
      userId,
      restaurantId,
      menuId,
      sectionUuid,
      ACL_PERMISSION_WRITE,
    );

    const uniqueIds = new Set<string>();
    for (const itemId of dto.itemIds) {
      if (uniqueIds.has(itemId)) {
        throw new BadRequestException(MENU_SECTIONS_ERRORS.DUPLICATE_ITEM);
      }
      uniqueIds.add(itemId);

      const item = await this.menuItemsData.findByUuid(itemId);
      if (!item || item.deletedAt || item.restaurantId !== restaurantId) {
        throw new BadRequestException(
          MENU_SECTIONS_ERRORS.itemNotFoundInRestaurant(itemId),
        );
      }
    }

    try {
      await this.menuSectionItemsData.replaceSectionItems(
        sectionUuid,
        dto.itemIds,
      );
      return this.findAll(userId, restaurantId, menuId, sectionUuid);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        MENU_SECTIONS_ERRORS.ITEMS_UPDATE_FAILED,
      );
    }
  }

  private async assertSectionAccess(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<void> {
    await this.menusService.assertMenuAccess(
      userId,
      restaurantId,
      menuId,
      permission,
    );

    const section = await this.menuSectionsData.findByUuid(sectionUuid);
    if (!section || section.deletedAt || section.menuId !== menuId) {
      throw new NotFoundException(MENU_SECTIONS_ERRORS.NOT_FOUND);
    }
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import type { Restaurant } from '@prisma/client';
import { buildGuestMenuUrl } from 'src/common/guest/guest-url.builder';
import { isEntityActive } from 'src/common/utils/entity-active.util';
import { MenuHoursService } from 'src/menus/hours/menu-hours.service';
import { MenusData } from 'src/menus/menus.data';
import { MenuSectionItemsData } from 'src/menus/sections/menu-section-items.data';
import { MenuSectionsData } from 'src/menus/sections/menu-sections.data';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { QrCodesData } from 'src/qr-codes/qr-codes.data';
import { RestaurantsData } from 'src/restaurants/restaurants.data';
import { TablesData } from 'src/tables/tables.data';
import { GUEST_ERRORS } from './guest.errors';

export type GuestRestaurantResponse = {
  slug: string;
  title: string;
};

export type GuestQrResponse = {
  restaurant: GuestRestaurantResponse;
  qrCode: {
    uuid: string;
    name: string;
  };
  menus: {
    menuId: string;
    menuName: string;
    selectTable: boolean;
    sortOrder: number;
    url: string;
  }[];
};

export type GuestMenuResponse = {
  restaurant: GuestRestaurantResponse & { currency: string };
  menu: {
    uuid: string;
    name: string;
    description: string | null;
    photo: string | null;
  };
  sections: {
    uuid: string;
    name: string;
    sortOrder: number;
    items: {
      uuid: string;
      name: string;
      description: string | null;
      photo: string | null;
      totalPrice: number;
      sortOrder: number;
    }[];
  }[];
  hours: {
    isOpenNow: boolean;
  };
};

export type GuestTableResponse = {
  restaurant: GuestRestaurantResponse;
  table: {
    uuid: string;
    label: string;
  };
  menus: {
    menuId: string;
    menuName: string;
    sortOrder: number;
    url: string;
  }[];
};

@Injectable()
export class GuestService {
  constructor(
    private readonly restaurantsData: RestaurantsData,
    private readonly qrCodesData: QrCodesData,
    private readonly menusData: MenusData,
    private readonly menuSectionsData: MenuSectionsData,
    private readonly menuSectionItemsData: MenuSectionItemsData,
    private readonly menuItemsService: MenuItemsService,
    private readonly menuHoursService: MenuHoursService,
    private readonly tablesData: TablesData,
  ) {}

  async getRestaurantBySlug(
    slug: string,
  ): Promise<GuestRestaurantResponse & { currency: string }> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);
    return {
      ...this.toRestaurantResponse(restaurant),
      currency: restaurant.currency,
    };
  }

  async getQrBySlugAndUuid(
    slug: string,
    qrUuid: string,
  ): Promise<GuestQrResponse> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);

    const qrCode = await this.qrCodesData.findByUuid(qrUuid);
    if (
      !qrCode ||
      qrCode.deletedAt !== null ||
      qrCode.deactivatedAt !== null ||
      qrCode.restaurantId !== restaurant.uuid
    ) {
      throw new NotFoundException(GUEST_ERRORS.QR_CODE_NOT_FOUND);
    }

    const menus = qrCode.menus
      .filter(
        (link) =>
          link.menu.deletedAt === null && link.menu.deactivatedAt === null,
      )
      .map((link) => ({
        menuId: link.menuId,
        menuName: link.menu.name,
        selectTable: link.selectTable,
        sortOrder: link.sortOrder,
        url: buildGuestMenuUrl({
          restaurantSlug: restaurant.slug,
          menuUuid: link.menuId,
          selectTable: link.selectTable,
        }),
      }));

    return {
      restaurant: this.toRestaurantResponse(restaurant),
      qrCode: {
        uuid: qrCode.uuid,
        name: qrCode.name,
      },
      menus,
    };
  }

  async getMenuBySlugAndUuid(
    slug: string,
    menuUuid: string,
  ): Promise<GuestMenuResponse> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);

    const menu = await this.menusData.findByUuid(menuUuid);
    if (
      !menu ||
      menu.restaurantId !== restaurant.uuid ||
      !isEntityActive(menu.deactivatedAt, menu.deletedAt)
    ) {
      throw new NotFoundException(GUEST_ERRORS.MENU_NOT_FOUND);
    }

    const sections = (
      await this.menuSectionsData.findManyByMenu(menuUuid)
    ).filter((section) =>
      isEntityActive(section.deactivatedAt, section.deletedAt),
    );

    const sectionResponses = await Promise.all(
      sections.map(async (section) => {
        const links = await this.menuSectionItemsData.findManyBySection(
          section.uuid,
        );

        const items = links
          .filter((link) =>
            isEntityActive(
              link.menuItem.deactivatedAt,
              link.menuItem.deletedAt,
            ),
          )
          .map((link) => {
            const item = this.menuItemsService.toResponse(
              link.menuItem,
              link.menuItem.products,
            );
            return {
              uuid: item.uuid,
              name: item.name,
              description: item.description,
              photo: item.photo,
              totalPrice: item.totalPrice,
              sortOrder: link.sortOrder,
            };
          });

        return {
          uuid: section.uuid,
          name: section.name,
          sortOrder: section.sortOrder,
          items,
        };
      }),
    );

    const resolvedToday =
      await this.menuHoursService.getResolvedToday(menuUuid);

    return {
      restaurant: {
        ...this.toRestaurantResponse(restaurant),
        currency: restaurant.currency,
      },
      menu: {
        uuid: menu.uuid,
        name: menu.name,
        description: menu.description,
        photo: menu.photo,
      },
      sections: sectionResponses,
      hours: {
        isOpenNow: resolvedToday.isOpenNow,
      },
    };
  }

  async getTableBySlugAndUuid(
    slug: string,
    tableUuid: string,
  ): Promise<GuestTableResponse> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);

    const table = await this.tablesData.findByUuid(tableUuid);
    if (
      !table ||
      table.restaurantId !== restaurant.uuid ||
      !isEntityActive(table.deactivatedAt, table.deletedAt)
    ) {
      throw new NotFoundException(GUEST_ERRORS.TABLE_NOT_FOUND);
    }

    const links = await this.tablesData.findMenuLinks(tableUuid);

    const menus = links
      .filter(
        (link) =>
          link.menu.deletedAt === null && link.menu.deactivatedAt === null,
      )
      .map((link) => ({
        menuId: link.menuId,
        menuName: link.menu.name,
        sortOrder: link.sortOrder,
        url: buildGuestMenuUrl({
          restaurantSlug: restaurant.slug,
          menuUuid: link.menuId,
          selectTable: false,
        }),
      }));

    return {
      restaurant: this.toRestaurantResponse(restaurant),
      table: {
        uuid: table.uuid,
        label: table.label,
      },
      menus,
    };
  }

  private async findActiveRestaurantOrThrow(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantsData.findBySlug(slug);
    if (
      !restaurant ||
      restaurant.deletedAt !== null ||
      restaurant.deactivatedAt !== null
    ) {
      throw new NotFoundException(GUEST_ERRORS.RESTAURANT_NOT_FOUND);
    }

    return restaurant;
  }

  private toRestaurantResponse(
    restaurant: Restaurant,
  ): GuestRestaurantResponse {
    return {
      slug: restaurant.slug,
      title: restaurant.title,
    };
  }
}

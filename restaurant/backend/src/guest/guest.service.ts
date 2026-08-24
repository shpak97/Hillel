import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, type Restaurant } from '@prisma/client';
import { getFrontendPublicUrl } from 'src/common/config/frontend-public.url';
import { buildGuestMenuUrl } from 'src/common/guest/guest-url.builder';
import { isEntityActive } from 'src/common/utils/entity-active.util';
import { toMoneyNumber } from 'src/common/utils/money.util';
import { MenuHoursService } from 'src/menus/hours/menu-hours.service';
import { MenusData } from 'src/menus/menus.data';
import { MenuSectionItemsData } from 'src/menus/sections/menu-section-items.data';
import { MenuSectionsData } from 'src/menus/sections/menu-sections.data';
import { MenuItemsData } from 'src/menu-items/menu-items.data';
import { MenuItemsService } from 'src/menu-items/menu-items.service';
import { OrdersData } from 'src/orders/orders.data';
import { getBackendPublicUrl } from 'src/payments/monobank/monobank.config';
import { MonobankService } from 'src/payments/monobank/monobank.service';
import { QrCodesData } from 'src/qr-codes/qr-codes.data';
import { RestaurantsData } from 'src/restaurants/restaurants.data';
import { TablesData } from 'src/tables/tables.data';
import type { CreateGuestOrderDto } from './dto/guest-order.dto';
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

export type GuestOrderCheckoutResponse = {
  orderUuid: string;
  status: string;
  currency: string;
  totalAmount: number;
  pageUrl: string;
};

@Injectable()
export class GuestService {
  constructor(
    private readonly restaurantsData: RestaurantsData,
    private readonly qrCodesData: QrCodesData,
    private readonly menusData: MenusData,
    private readonly menuSectionsData: MenuSectionsData,
    private readonly menuSectionItemsData: MenuSectionItemsData,
    private readonly menuItemsData: MenuItemsData,
    private readonly menuItemsService: MenuItemsService,
    private readonly menuHoursService: MenuHoursService,
    private readonly tablesData: TablesData,
    private readonly ordersData: OrdersData,
    private readonly monobankService: MonobankService,
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

  async createOrderCheckout(
    slug: string,
    dto: CreateGuestOrderDto,
  ): Promise<GuestOrderCheckoutResponse> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);

    if (!dto.items?.length) {
      throw new BadRequestException(GUEST_ERRORS.ORDER_EMPTY);
    }

    let tableId: string | null = null;
    if (dto.tableUuid) {
      const table = await this.tablesData.findByUuid(dto.tableUuid);
      if (
        !table ||
        table.restaurantId !== restaurant.uuid ||
        !isEntityActive(table.deactivatedAt, table.deletedAt)
      ) {
        throw new NotFoundException(GUEST_ERRORS.TABLE_NOT_FOUND);
      }
      tableId = table.uuid;
    }

    const quantityById = new Map<string, number>();
    for (const line of dto.items) {
      quantityById.set(
        line.menuItemId,
        (quantityById.get(line.menuItemId) ?? 0) + line.quantity,
      );
    }

    const menuItems = await this.menuItemsData.findManyByUuidsWithProducts([
      ...quantityById.keys(),
    ]);

    if (menuItems.length !== quantityById.size) {
      throw new BadRequestException(GUEST_ERRORS.ORDER_ITEMS_INVALID);
    }

    const orderLines: {
      menuItemId: string;
      name: string;
      photo: string | null;
      unitPrice: number;
      quantity: number;
    }[] = [];

    for (const menuItem of menuItems) {
      if (
        menuItem.restaurantId !== restaurant.uuid ||
        !isEntityActive(menuItem.deactivatedAt, menuItem.deletedAt)
      ) {
        throw new BadRequestException(GUEST_ERRORS.ORDER_ITEMS_INVALID);
      }

      const response = this.menuItemsService.toResponse(
        menuItem,
        menuItem.products,
      );
      const quantity = quantityById.get(menuItem.uuid) ?? 0;
      if (quantity <= 0 || response.totalPrice <= 0) {
        throw new BadRequestException(GUEST_ERRORS.ORDER_ITEMS_INVALID);
      }

      orderLines.push({
        menuItemId: menuItem.uuid,
        name: response.name,
        photo: response.photo,
        unitPrice: response.totalPrice,
        quantity,
      });
    }

    const totalAmount = toMoneyNumber(
      orderLines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      ),
    );

    let order;
    try {
      order = await this.ordersData.createWithItems({
        restaurantId: restaurant.uuid,
        tableId,
        currency: restaurant.currency,
        totalAmount,
        items: orderLines,
      });
    } catch {
      throw new InternalServerErrorException(GUEST_ERRORS.ORDER_CREATE_FAILED);
    }

    const frontendBase = getFrontendPublicUrl();
    const redirectUrl = `${frontendBase}/r/${restaurant.slug}/orders/${order.uuid}/result`;
    const webHookUrl = `${getBackendPublicUrl()}/guest/payments/monobank/webhook`;

    try {
      const invoice = await this.monobankService.createInvoice({
        amountMajor: totalAmount,
        currency: restaurant.currency,
        reference: order.uuid,
        destination: `Замовлення ${restaurant.title}`,
        redirectUrl,
        webHookUrl,
        basket: orderLines.map((line) => {
          const unitMinor = Math.round(line.unitPrice * 100);
          return {
            name: line.name,
            qty: line.quantity,
            sum: unitMinor,
            total: unitMinor * line.quantity,
            code: line.menuItemId.replace(/-/g, '').slice(0, 32),
            unit: 'шт.',
          };
        }),
      });

      await this.ordersData.update(order.uuid, {
        monoInvoiceId: invoice.invoiceId,
        monoPageUrl: invoice.pageUrl,
      });

      return {
        orderUuid: order.uuid,
        status: OrderStatus.PENDING,
        currency: restaurant.currency,
        totalAmount,
        pageUrl: invoice.pageUrl,
      };
    } catch (error) {
      await this.ordersData.update(order.uuid, {
        status: OrderStatus.FAILED,
      });
      throw error;
    }
  }

  async getOrderStatus(
    slug: string,
    orderUuid: string,
  ): Promise<{
    orderUuid: string;
    status: string;
    currency: string;
    totalAmount: number;
    paidAt: string | null;
  }> {
    const restaurant = await this.findActiveRestaurantOrThrow(slug);
    let order = await this.ordersData.findByUuid(orderUuid);

    if (!order || order.restaurantId !== restaurant.uuid) {
      throw new NotFoundException(GUEST_ERRORS.ORDER_NOT_FOUND);
    }

    if (order.status === OrderStatus.PENDING && order.monoInvoiceId) {
      try {
        const invoice = await this.monobankService.getInvoiceStatus(
          order.monoInvoiceId,
        );
        await this.applyMonoInvoiceStatus(order.uuid, invoice.status);
        order = (await this.ordersData.findByUuid(orderUuid)) ?? order;
      } catch {
        // Keep local status if Mono status check fails (e.g. rate limit).
      }
    }

    return {
      orderUuid: order.uuid,
      status: order.status,
      currency: order.currency,
      totalAmount: toMoneyNumber(order.totalAmount),
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    };
  }

  async handleMonobankWebhook(
    rawBody: Buffer,
    xSign: string | undefined,
  ): Promise<{ ok: true }> {
    await this.monobankService.assertValidWebhookSignature(rawBody, xSign);

    const payload = JSON.parse(rawBody.toString('utf8')) as {
      invoiceId?: string;
      status?: string;
      reference?: string;
    };

    if (!payload.invoiceId || !payload.status) {
      return { ok: true };
    }

    const order =
      (await this.ordersData.findByMonoInvoiceId(payload.invoiceId)) ??
      (payload.reference
        ? await this.ordersData.findByUuid(payload.reference)
        : null);

    if (!order) {
      return { ok: true };
    }

    await this.applyMonoInvoiceStatus(order.uuid, payload.status);
    return { ok: true };
  }

  private async applyMonoInvoiceStatus(
    orderUuid: string,
    monoStatus: string,
  ): Promise<void> {
    const order = await this.ordersData.findByUuid(orderUuid);
    if (!order || order.status === OrderStatus.PAID) {
      return;
    }

    const normalized = monoStatus.toLowerCase();

    if (normalized === 'success') {
      await this.ordersData.update(orderUuid, {
        status: OrderStatus.PAID,
        paidAt: new Date(),
      });
      return;
    }

    if (
      (normalized === 'failure' || normalized === 'expired') &&
      order.status === OrderStatus.PENDING
    ) {
      await this.ordersData.update(orderUuid, {
        status: OrderStatus.FAILED,
      });
    }
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

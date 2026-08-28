import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { ACL_PERMISSION_READ } from 'src/acl/acl.constants';
import { toMoneyNumber } from 'src/common/utils/money.util';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import {
  OrdersData,
  type OrderWithItemsAndTable,
} from './orders.data';
import { ORDERS_ERRORS } from './orders.errors';

export type AdminOrderItemResponse = {
  id: number;
  menuItemId: string | null;
  name: string;
  photo: string | null;
  unitPrice: number;
  quantity: number;
};

export type AdminOrderResponse = {
  uuid: string;
  restaurantId: string;
  status: string;
  currency: string;
  totalAmount: number;
  monoInvoiceId: string | null;
  monoPageUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  table: { uuid: string; label: string } | null;
  items: AdminOrderItemResponse[];
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersData: OrdersData,
    private readonly restaurantsService: RestaurantsService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
    statuses?: OrderStatus[],
  ): Promise<AdminOrderResponse[]> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );

    if (statuses?.length) {
      const allowed = new Set(Object.values(OrderStatus));
      for (const status of statuses) {
        if (!allowed.has(status)) {
          throw new BadRequestException(ORDERS_ERRORS.INVALID_STATUS);
        }
      }
    }

    const orders = await this.ordersData.findManyByRestaurant({
      restaurantId,
      statuses,
    });

    return orders.map((order) => this.toResponse(order));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    orderUuid: string,
  ): Promise<AdminOrderResponse> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );

    const order = await this.ordersData.findByUuidWithTable(orderUuid);
    if (!order || order.restaurantId !== restaurantId) {
      throw new NotFoundException(ORDERS_ERRORS.NOT_FOUND);
    }

    return this.toResponse(order);
  }

  private toResponse(order: OrderWithItemsAndTable): AdminOrderResponse {
    return {
      uuid: order.uuid,
      restaurantId: order.restaurantId,
      status: order.status,
      currency: order.currency,
      totalAmount: toMoneyNumber(order.totalAmount),
      monoInvoiceId: order.monoInvoiceId,
      monoPageUrl: order.monoPageUrl,
      paidAt: order.paidAt ? order.paidAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      table: order.table
        ? { uuid: order.table.uuid, label: order.table.label }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        photo: item.photo,
        unitPrice: toMoneyNumber(item.unitPrice),
        quantity: item.quantity,
      })),
    };
  }
}

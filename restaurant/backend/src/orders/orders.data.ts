import { Injectable } from '@nestjs/common';
import { Order, OrderItem, OrderStatus, Prisma, Table } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export type OrderWithItems = Order & { items: OrderItem[] };

export type OrderWithItemsAndTable = OrderWithItems & {
  table: Pick<Table, 'uuid' | 'label'> | null;
};

@Injectable()
export class OrdersData {
  constructor(private readonly prisma: PrismaService) {}

  createWithItems(input: {
    restaurantId: string;
    tableId?: string | null;
    currency: string;
    totalAmount: number;
    items: {
      menuItemId: string;
      name: string;
      photo: string | null;
      unitPrice: number;
      quantity: number;
    }[];
  }): Promise<OrderWithItems> {
    return this.prisma.order.create({
      data: {
        restaurantId: input.restaurantId,
        tableId: input.tableId ?? null,
        currency: input.currency,
        totalAmount: input.totalAmount,
        status: OrderStatus.PENDING,
        items: {
          create: input.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            photo: item.photo,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  update(uuid: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({ where: { uuid }, data });
  }

  findByUuid(uuid: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { uuid },
      include: { items: true },
    });
  }

  findByUuidWithTable(
    uuid: string,
  ): Promise<OrderWithItemsAndTable | null> {
    return this.prisma.order.findUnique({
      where: { uuid },
      include: {
        items: { orderBy: { id: 'asc' } },
        table: { select: { uuid: true, label: true } },
      },
    });
  }

  findByMonoInvoiceId(invoiceId: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({
      where: { monoInvoiceId: invoiceId },
      include: { items: true },
    });
  }

  findManyByRestaurant(input: {
    restaurantId: string;
    statuses?: OrderStatus[];
  }): Promise<OrderWithItemsAndTable[]> {
    return this.prisma.order.findMany({
      where: {
        restaurantId: input.restaurantId,
        ...(input.statuses?.length
          ? { status: { in: input.statuses } }
          : {}),
      },
      include: {
        items: { orderBy: { id: 'asc' } },
        table: { select: { uuid: true, label: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

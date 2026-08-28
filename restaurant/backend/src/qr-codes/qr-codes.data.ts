import { Injectable } from '@nestjs/common';
import { Prisma, QrCode } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type QrCodeMenuLink = {
  menuId: string;
  selectTable: boolean;
  sortOrder: number;
  menu: {
    uuid: string;
    name: string;
    deactivatedAt: Date | null;
    deletedAt: Date | null;
  };
};

export type QrCodeWithMenus = QrCode & {
  menus: QrCodeMenuLink[];
};

@Injectable()
export class QrCodesData {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRestaurant(restaurantId: string): Promise<QrCodeWithMenus[]> {
    return this.prisma.qrCode.findMany({
      where: { restaurantId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        menus: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menu: {
              select: {
                uuid: true,
                name: true,
                deactivatedAt: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });
  }

  findByUuid(uuid: string): Promise<QrCodeWithMenus | null> {
    return this.prisma.qrCode.findUnique({
      where: { uuid },
      include: {
        menus: {
          orderBy: { sortOrder: 'asc' },
          include: {
            menu: {
              select: {
                uuid: true,
                name: true,
                deactivatedAt: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });
  }

  async createWithMenus(
    restaurantId: string,
    name: string,
    menus: { menuId: string; selectTable: boolean }[],
  ): Promise<QrCodeWithMenus> {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.qrCode.create({
        data: {
          name,
          restaurant: { connect: { uuid: restaurantId } },
        },
      });

      await tx.qrCodeMenu.createMany({
        data: menus.map((item, index) => ({
          qrCodeId: created.uuid,
          menuId: item.menuId,
          selectTable: item.selectTable,
          sortOrder: index,
        })),
      });

      const withMenus = await tx.qrCode.findUnique({
        where: { uuid: created.uuid },
        include: {
          menus: {
            orderBy: { sortOrder: 'asc' },
            include: {
              menu: {
                select: {
                  uuid: true,
                  name: true,
                  deactivatedAt: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      });

      return withMenus as QrCodeWithMenus;
    });
  }

  async updateWithMenus(
    uuid: string,
    data: Prisma.QrCodeUpdateInput,
    menus?: { menuId: string; selectTable: boolean }[],
  ): Promise<QrCodeWithMenus> {
    return this.prisma.$transaction(async (tx) => {
      await tx.qrCode.update({ where: { uuid }, data });

      if (menus !== undefined) {
        await tx.qrCodeMenu.deleteMany({ where: { qrCodeId: uuid } });
        await tx.qrCodeMenu.createMany({
          data: menus.map((item, index) => ({
            qrCodeId: uuid,
            menuId: item.menuId,
            selectTable: item.selectTable,
            sortOrder: index,
          })),
        });
      }

      const withMenus = await tx.qrCode.findUnique({
        where: { uuid },
        include: {
          menus: {
            orderBy: { sortOrder: 'asc' },
            include: {
              menu: {
                select: {
                  uuid: true,
                  name: true,
                  deactivatedAt: true,
                  deletedAt: true,
                },
              },
            },
          },
        },
      });

      return withMenus as QrCodeWithMenus;
    });
  }

  update(uuid: string, data: Prisma.QrCodeUpdateInput): Promise<QrCode> {
    return this.prisma.qrCode.update({ where: { uuid }, data });
  }
}

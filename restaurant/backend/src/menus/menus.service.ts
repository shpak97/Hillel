import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Menu } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_MENU,
} from 'src/acl/acl.constants';
import { AclService } from 'src/acl/acl.service';
import { assertTableMenuLinkAccess } from 'src/common/access/table-menu-link.access';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenusData } from './menus.data';
import { MENUS_ERRORS } from './menus.errors';

export type MenuResponse = {
  uuid: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photo: string | null;
  isActive: boolean;
  tableUuids: string[];
};

@Injectable()
export class MenusService {
  constructor(
    private readonly menusData: MenusData,
    private readonly restaurantsService: RestaurantsService,
    private readonly aclService: AclService,
  ) {}

  async findAll(userId: number, restaurantId: string): Promise<MenuResponse[]> {
    await this.assertRestaurantReadable(userId, restaurantId);

    const hasAllReadAccess = await this.aclService.hasPermission({
      userId,
      restaurantId,
      permission: ACL_PERMISSION_READ,
      resource: ACL_RESOURCE_MENU,
    });
    const menus = await this.menusData.findManyByRestaurant(restaurantId);

    const filtered = hasAllReadAccess
      ? menus
      : await this.filterReadableMenus(userId, restaurantId, menus);

    return Promise.all(filtered.map((menu) => this.toResponse(menu)));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    menuUuid: string,
  ): Promise<MenuResponse> {
    const menu = await this.getAccessibleMenu(
      userId,
      restaurantId,
      menuUuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(menu);
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateMenuDto,
    photo?: string,
  ): Promise<MenuResponse> {
    await this.assertMenuWriteAccess(userId, restaurantId);

    try {
      const menu = await this.menusData.create({
        name: dto.name,
        description: dto.description,
        photo,
        restaurant: { connect: { uuid: restaurantId } },
      });
      return this.toResponse(menu);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENUS_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    menuUuid: string,
    dto: UpdateMenuDto,
    newPhoto?: string,
  ): Promise<MenuResponse> {
    await this.getAccessibleMenu(
      userId,
      restaurantId,
      menuUuid,
      ACL_PERMISSION_WRITE,
    );

    const photo =
      newPhoto !== undefined
        ? newPhoto
        : dto.photo !== undefined
          ? dto.photo
          : undefined;

    try {
      const menu = await this.menusData.update(menuUuid, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(photo !== undefined ? { photo } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
      });
      return this.toResponse(menu);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENUS_ERRORS.UPDATE_FAILED);
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    menuUuid: string,
  ): Promise<void> {
    await this.getAccessibleMenu(
      userId,
      restaurantId,
      menuUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.menusData.update(menuUuid, {
        deletedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(MENUS_ERRORS.DELETE_FAILED);
    }
  }

  async updateTables(
    userId: number,
    restaurantId: string,
    menuUuid: string,
    tableUuids: string[],
  ): Promise<MenuResponse> {
    await this.getAccessibleMenu(
      userId,
      restaurantId,
      menuUuid,
      ACL_PERMISSION_WRITE,
    );

    for (const tableUuid of tableUuids) {
      await assertTableMenuLinkAccess(this.aclService, {
        userId,
        restaurantId,
        tableUuid,
        menuUuid,
      });
    }

    await this.menusData.replaceTableLinks(menuUuid, tableUuids);
    const menu = await this.menusData.findByUuid(menuUuid);

    if (!menu) {
      throw new NotFoundException(MENUS_ERRORS.NOT_FOUND);
    }

    return this.toResponse(menu);
  }

  async assertMenuAccess(
    userId: number,
    restaurantId: string,
    menuUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Menu> {
    return this.getAccessibleMenu(userId, restaurantId, menuUuid, permission);
  }

  private async assertRestaurantReadable(
    userId: number,
    restaurantId: string,
  ): Promise<void> {
    await this.restaurantsService.assertAccess(
      userId,
      restaurantId,
      ACL_PERMISSION_READ,
    );
  }

  private async assertMenuWriteAccess(
    userId: number,
    restaurantId: string,
  ): Promise<void> {
    await this.assertRestaurantReadable(userId, restaurantId);

    await this.aclService.assertHasPermission({
      userId,
      restaurantId,
      permission: ACL_PERMISSION_WRITE,
      resource: ACL_RESOURCE_MENU,
    });
  }

  private async filterReadableMenus(
    userId: number,
    restaurantId: string,
    menus: Menu[],
  ): Promise<Menu[]> {
    const results = await Promise.all(
      menus.map(async (menu) => {
        const allowed = await this.aclService.hasPermission({
          userId,
          restaurantId,
          permission: ACL_PERMISSION_READ,
          resource: ACL_RESOURCE_MENU,
          resourceId: menu.uuid,
        });
        return allowed ? menu : null;
      }),
    );

    return results.filter((menu): menu is Menu => menu !== null);
  }

  private async getAccessibleMenu(
    userId: number,
    restaurantId: string,
    menuUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Menu> {
    await this.assertRestaurantReadable(userId, restaurantId);

    const menu = await this.menusData.findByUuid(menuUuid);

    if (!menu || menu.deletedAt || menu.restaurantId !== restaurantId) {
      throw new NotFoundException(MENUS_ERRORS.NOT_FOUND);
    }

    await this.aclService.assertHasPermission({
      userId,
      restaurantId,
      permission,
      resource: ACL_RESOURCE_MENU,
      resourceId: menuUuid,
    });

    return menu;
  }

  private async toResponse(menu: Menu): Promise<MenuResponse> {
    const links = await this.menusData.findTableLinks(menu.uuid);

    return {
      uuid: menu.uuid,
      restaurantId: menu.restaurantId,
      name: menu.name,
      description: menu.description,
      photo: menu.photo,
      isActive: isEntityActive(menu.deactivatedAt, menu.deletedAt),
      tableUuids: links.map((link) => link.tableId),
    };
  }
}

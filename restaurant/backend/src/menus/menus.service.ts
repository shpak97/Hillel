import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Menu } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_ID_ALL,
  ACL_RESOURCE_MENU,
  ACL_RESOURCE_RESTAURANT,
} from 'src/acl/acl.constants';
import { AclService } from 'src/acl/acl.service';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenusData } from './menus.data';

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

    const canReadAll = await this.canReadAllMenus(userId, restaurantId);
    const menus = await this.menusData.findManyByRestaurant(restaurantId);

    const filtered = canReadAll
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
    await this.assertCanCreateMenu(userId, restaurantId);

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
      throw new InternalServerErrorException('Не вдалося створити меню.');
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
      throw new InternalServerErrorException('Не вдалося оновити меню.');
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
      throw new InternalServerErrorException('Не вдалося видалити меню.');
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
      await this.aclService.assertCanLinkTableAndMenu(
        userId,
        restaurantId,
        tableUuid,
        menuUuid,
      );
    }

    await this.menusData.replaceTableLinks(menuUuid, tableUuids);
    const menu = await this.menusData.findByUuid(menuUuid);

    if (!menu) {
      throw new NotFoundException('Меню не знайдено.');
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

  private async assertCanCreateMenu(
    userId: number,
    restaurantId: string,
  ): Promise<void> {
    await this.assertRestaurantReadable(userId, restaurantId);

    const canCreate =
      (await this.aclService.can(
        userId,
        restaurantId,
        ACL_PERMISSION_WRITE,
        ACL_RESOURCE_RESTAURANT,
      )) ||
      (await this.aclService.can(
        userId,
        restaurantId,
        ACL_PERMISSION_WRITE,
        ACL_RESOURCE_MENU,
        ACL_RESOURCE_ID_ALL,
      ));

    if (!canCreate) {
      throw new ForbiddenException('Немає доступу для створення меню.');
    }
  }

  private async canReadAllMenus(
    userId: number,
    restaurantId: string,
  ): Promise<boolean> {
    return (
      (await this.aclService.can(
        userId,
        restaurantId,
        ACL_PERMISSION_READ,
        ACL_RESOURCE_RESTAURANT,
      )) ||
      (await this.aclService.can(
        userId,
        restaurantId,
        ACL_PERMISSION_READ,
        ACL_RESOURCE_MENU,
        ACL_RESOURCE_ID_ALL,
      ))
    );
  }

  private async filterReadableMenus(
    userId: number,
    restaurantId: string,
    menus: Menu[],
  ): Promise<Menu[]> {
    const results = await Promise.all(
      menus.map(async (menu) => {
        const allowed = await this.aclService.can(
          userId,
          restaurantId,
          ACL_PERMISSION_READ,
          ACL_RESOURCE_MENU,
          menu.uuid,
        );
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
      throw new NotFoundException('Меню не знайдено.');
    }

    const canAccessAll = await this.canReadAllMenus(userId, restaurantId);

    if (canAccessAll) {
      if (permission === ACL_PERMISSION_WRITE) {
        const canWrite =
          (await this.aclService.can(
            userId,
            restaurantId,
            ACL_PERMISSION_WRITE,
            ACL_RESOURCE_RESTAURANT,
          )) ||
          (await this.aclService.can(
            userId,
            restaurantId,
            ACL_PERMISSION_WRITE,
            ACL_RESOURCE_MENU,
            ACL_RESOURCE_ID_ALL,
          )) ||
          (await this.aclService.can(
            userId,
            restaurantId,
            ACL_PERMISSION_WRITE,
            ACL_RESOURCE_MENU,
            menuUuid,
          ));

        if (!canWrite) {
          throw new ForbiddenException('Немає доступу до цього меню.');
        }
      }

      return menu;
    }

    const allowed = await this.aclService.can(
      userId,
      restaurantId,
      permission,
      ACL_RESOURCE_MENU,
      menuUuid,
    );

    if (!allowed) {
      throw new ForbiddenException('Немає доступу до цього меню.');
    }

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

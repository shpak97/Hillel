import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Table } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
  ACL_RESOURCE_TABLE,
} from 'src/acl/acl.constants';
import { AclService } from 'src/acl/acl.service';
import { assertTableMenuLinkAccess } from 'src/common/access/table-menu-link.access';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import { TablesData } from './tables.data';
import { TABLES_ERRORS } from './tables.errors';

export type TableResponse = {
  uuid: string;
  restaurantId: string;
  label: string;
  zone: string;
  seats: number;
  isActive: boolean;
  menuUuids: string[];
};

@Injectable()
export class TablesService {
  constructor(
    private readonly tablesData: TablesData,
    private readonly restaurantsService: RestaurantsService,
    private readonly aclService: AclService,
  ) {}

  async findAll(userId: number, restaurantId: string): Promise<TableResponse[]> {
    await this.assertRestaurantReadable(userId, restaurantId);

    const hasAllReadAccess = await this.aclService.hasPermission({
      userId,
      restaurantId,
      permission: ACL_PERMISSION_READ,
      resource: ACL_RESOURCE_TABLE,
    });
    const tables = await this.tablesData.findManyByRestaurant(restaurantId);

    const filtered = hasAllReadAccess
      ? tables
      : await this.filterReadableTables(userId, restaurantId, tables);

    return Promise.all(filtered.map((table) => this.toResponse(table)));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    tableUuid: string,
  ): Promise<TableResponse> {
    const table = await this.getAccessibleTable(
      userId,
      restaurantId,
      tableUuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(table);
  }

  async create(
    userId: number,
    restaurantId: string,
    dto: CreateTableDto,
  ): Promise<TableResponse> {
    await this.assertTableWriteAccess(userId, restaurantId);

    try {
      const table = await this.tablesData.create({
        label: dto.label,
        zone: dto.zone,
        seats: dto.seats,
        restaurant: { connect: { uuid: restaurantId } },
      });
      return this.toResponse(table);
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(TABLES_ERRORS.LABEL_ALREADY_EXISTS);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(TABLES_ERRORS.CREATE_FAILED);
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    tableUuid: string,
    dto: UpdateTableDto,
  ): Promise<TableResponse> {
    await this.getAccessibleTable(
      userId,
      restaurantId,
      tableUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      const table = await this.tablesData.update(tableUuid, {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.zone !== undefined ? { zone: dto.zone } : {}),
        ...(dto.seats !== undefined ? { seats: dto.seats } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
      });
      return this.toResponse(table);
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(TABLES_ERRORS.LABEL_ALREADY_EXISTS);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(TABLES_ERRORS.UPDATE_FAILED);
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    tableUuid: string,
  ): Promise<void> {
    await this.getAccessibleTable(
      userId,
      restaurantId,
      tableUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.tablesData.update(tableUuid, {
        deletedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(TABLES_ERRORS.DELETE_FAILED);
    }
  }

  async updateMenus(
    userId: number,
    restaurantId: string,
    tableUuid: string,
    menuUuids: string[],
  ): Promise<TableResponse> {
    await this.getAccessibleTable(
      userId,
      restaurantId,
      tableUuid,
      ACL_PERMISSION_WRITE,
    );

    for (const menuUuid of menuUuids) {
      await assertTableMenuLinkAccess(this.aclService, {
        userId,
        restaurantId,
        tableUuid,
        menuUuid,
      });
    }

    await this.tablesData.replaceMenuLinks(tableUuid, menuUuids);
    const table = await this.tablesData.findByUuid(tableUuid);

    if (!table) {
      throw new NotFoundException(TABLES_ERRORS.NOT_FOUND);
    }

    return this.toResponse(table);
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

  private async assertTableWriteAccess(
    userId: number,
    restaurantId: string,
  ): Promise<void> {
    await this.assertRestaurantReadable(userId, restaurantId);

    await this.aclService.assertHasPermission({
      userId,
      restaurantId,
      permission: ACL_PERMISSION_WRITE,
      resource: ACL_RESOURCE_TABLE,
    });
  }

  private async filterReadableTables(
    userId: number,
    restaurantId: string,
    tables: Table[],
  ): Promise<Table[]> {
    const results = await Promise.all(
      tables.map(async (table) => {
        const allowed = await this.aclService.hasPermission({
          userId,
          restaurantId,
          permission: ACL_PERMISSION_READ,
          resource: ACL_RESOURCE_TABLE,
          resourceId: table.uuid,
        });
        return allowed ? table : null;
      }),
    );

    return results.filter((table): table is Table => table !== null);
  }

  private async getAccessibleTable(
    userId: number,
    restaurantId: string,
    tableUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<Table> {
    await this.assertRestaurantReadable(userId, restaurantId);

    const table = await this.tablesData.findByUuid(tableUuid);

    if (!table || table.deletedAt || table.restaurantId !== restaurantId) {
      throw new NotFoundException(TABLES_ERRORS.NOT_FOUND);
    }

    await this.aclService.assertHasPermission({
      userId,
      restaurantId,
      permission,
      resource: ACL_RESOURCE_TABLE,
      resourceId: tableUuid,
    });

    return table;
  }

  private async toResponse(table: Table): Promise<TableResponse> {
    const links = await this.tablesData.findMenuLinks(table.uuid);

    return {
      uuid: table.uuid,
      restaurantId: table.restaurantId,
      label: table.label,
      zone: table.zone,
      seats: table.seats,
      isActive: isEntityActive(table.deactivatedAt, table.deletedAt),
      menuUuids: links.map((link) => link.menuId),
    };
  }
}

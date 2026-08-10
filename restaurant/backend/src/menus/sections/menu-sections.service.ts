import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MenuSection } from '@prisma/client';
import {
  ACL_PERMISSION_READ,
  ACL_PERMISSION_WRITE,
} from 'src/acl/acl.constants';
import {
  activeStateFromFlag,
  isEntityActive,
} from 'src/common/utils/entity-active.util';
import {
  CreateMenuSectionDto,
  UpdateMenuSectionDto,
} from './dto/menu-section.dto';
import { MenuSectionsData } from './menu-sections.data';
import { MENU_SECTIONS_ERRORS } from './menu-sections.errors';
import { MenusService } from '../menus.service';

export type MenuSectionResponse = {
  uuid: string;
  menuId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

@Injectable()
export class MenuSectionsService {
  constructor(
    private readonly menuSectionsData: MenuSectionsData,
    private readonly menusService: MenusService,
  ) {}

  async findAll(
    userId: number,
    restaurantId: string,
    menuId: string,
  ): Promise<MenuSectionResponse[]> {
    await this.menusService.assertMenuAccess(
      userId,
      restaurantId,
      menuId,
      ACL_PERMISSION_READ,
    );

    const sections = await this.menuSectionsData.findManyByMenu(menuId);
    return sections.map((section) => this.toResponse(section));
  }

  async findOne(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
  ): Promise<MenuSectionResponse> {
    const section = await this.getAccessibleSection(
      userId,
      restaurantId,
      menuId,
      sectionUuid,
      ACL_PERMISSION_READ,
    );
    return this.toResponse(section);
  }

  async create(
    userId: number,
    restaurantId: string,
    menuId: string,
    dto: CreateMenuSectionDto,
  ): Promise<MenuSectionResponse> {
    await this.menusService.assertMenuAccess(
      userId,
      restaurantId,
      menuId,
      ACL_PERMISSION_WRITE,
    );

    try {
      const sortOrder = await this.menuSectionsData.getNextSortOrder(menuId);
      const section = await this.menuSectionsData.create({
        name: dto.name,
        sortOrder,
        menu: { connect: { uuid: menuId } },
      });
      return this.toResponse(section);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        MENU_SECTIONS_ERRORS.CREATE_FAILED,
      );
    }
  }

  async update(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
    dto: UpdateMenuSectionDto,
  ): Promise<MenuSectionResponse> {
    await this.getAccessibleSection(
      userId,
      restaurantId,
      menuId,
      sectionUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      const section = await this.menuSectionsData.update(sectionUuid, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.isActive !== undefined
          ? activeStateFromFlag(dto.isActive)
          : {}),
      });
      return this.toResponse(section);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        MENU_SECTIONS_ERRORS.UPDATE_FAILED,
      );
    }
  }

  async remove(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
  ): Promise<void> {
    await this.getAccessibleSection(
      userId,
      restaurantId,
      menuId,
      sectionUuid,
      ACL_PERMISSION_WRITE,
    );

    try {
      await this.menuSectionsData.update(sectionUuid, {
        deletedAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        MENU_SECTIONS_ERRORS.DELETE_FAILED,
      );
    }
  }

  private async getAccessibleSection(
    userId: number,
    restaurantId: string,
    menuId: string,
    sectionUuid: string,
    permission: typeof ACL_PERMISSION_READ | typeof ACL_PERMISSION_WRITE,
  ): Promise<MenuSection> {
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

    return section;
  }

  private toResponse(section: MenuSection): MenuSectionResponse {
    return {
      uuid: section.uuid,
      menuId: section.menuId,
      name: section.name,
      sortOrder: section.sortOrder,
      isActive: isEntityActive(section.deactivatedAt, section.deletedAt),
    };
  }
}

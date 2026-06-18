import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CurrentUser,
  getCurrentUserId,
} from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  getMenuPhotoPublicPath,
  menuPhotoMulterOptions,
} from 'src/uploads/menu-photos.multer';
import {
  CreateMenuDto,
  UpdateMenuDto,
  UpdateMenuTablesDto,
} from './dto/menu.dto';
import { UpdateMenuHoursDto } from './hours/dto/update-menu-hours.dto';
import { MenuHoursService } from './hours/menu-hours.service';
import { MenusService } from './menus.service';

@Controller('restaurants/:restaurantUuid/menus')
@UseGuards(AuthGuard)
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly menuHoursService: MenuHoursService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    return this.menusService.findAll(getCurrentUserId(user), restaurantUuid);
  }

  @Get(':menuUuid/hours')
  getHours(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    return this.menuHoursService.getHours(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
    );
  }

  @Put(':menuUuid/hours')
  updateHours(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() dto: UpdateMenuHoursDto,
  ) {
    return this.menuHoursService.updateHours(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
      dto,
    );
  }

  @Get(':menuUuid')
  findOne(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    return this.menusService.findOne(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', menuPhotoMulterOptions))
  create(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateMenuDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photo = file ? getMenuPhotoPublicPath(file.filename) : undefined;

    return this.menusService.create(
      getCurrentUserId(user),
      restaurantUuid,
      dto,
      photo,
    );
  }

  @Patch(':menuUuid')
  @UseInterceptors(FileInterceptor('photo', menuPhotoMulterOptions))
  update(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() body: Record<string, string>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const newPhoto = file ? getMenuPhotoPublicPath(file.filename) : undefined;
    const dto: UpdateMenuDto = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.isActive !== undefined
        ? { isActive: body.isActive === 'true' }
        : {}),
      ...(body.removePhoto === 'true' ? { photo: null } : {}),
    };

    return this.menusService.update(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
      dto,
      newPhoto,
    );
  }

  @Put(':menuUuid/tables')
  updateTables(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() dto: UpdateMenuTablesDto,
  ) {
    return this.menusService.updateTables(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
      dto.tableUuids,
    );
  }

  @Delete(':menuUuid')
  remove(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    return this.menusService.remove(
      getCurrentUserId(user),
      restaurantUuid,
      menuUuid,
    );
  }
}

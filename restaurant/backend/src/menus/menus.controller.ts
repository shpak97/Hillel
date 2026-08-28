import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { HoursResponseDto } from 'src/common/dto/hours-response.dto';
import {
  isMultipartRequest,
  parseUpdateMenuDto,
  resolvePhotoPatch,
  stripRemovePhoto,
  validateDto,
} from 'src/common/utils/patch-body.util';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import { MenuQrQueryDto } from 'src/qr/dto/qr-query.dto';
import { MenuQrResponseDto } from 'src/qr/dto/qr-response.dto';
import { toQrHttpResult } from 'src/qr/qr-endpoint.util';
import {
  getMenuPhotoPublicPath,
  menuPhotoMulterOptions,
} from 'src/uploads/menu-photos.multer';
import {
  CreateMenuDto,
  UpdateMenuDto,
  UpdateMenuTablesDto,
} from './dto/menu.dto';
import { MenuResponseDto } from './dto/menu-response.dto';
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
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.menusService.findAll(userId, restaurantUuid);
    return validateResponseDtoList(MenuResponseDto, result);
  }

  @Get(':menuUuid/hours')
  async getHours(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    const result = await this.menuHoursService.getHours(
      userId,
      restaurantUuid,
      menuUuid,
    );
    return validateResponseDto(HoursResponseDto, result);
  }

  @Put(':menuUuid/hours')
  async updateHours(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() dto: UpdateMenuHoursDto,
  ) {
    const result = await this.menuHoursService.updateHours(
      userId,
      restaurantUuid,
      menuUuid,
      dto,
    );
    return validateResponseDto(HoursResponseDto, result);
  }

  @Get(':menuUuid/qr')
  async getQr(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Query() query: MenuQrQueryDto,
  ): Promise<MenuQrResponseDto | StreamableFile> {
    const result = await this.menusService.getQr(
      userId,
      restaurantUuid,
      menuUuid,
      {
        selectTable: query.selectTable,
        format: query.format,
      },
    );

    return toQrHttpResult(result, (payload) =>
      validateResponseDto(MenuQrResponseDto, payload),
    );
  }

  @Get(':menuUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    const result = await this.menusService.findOne(
      userId,
      restaurantUuid,
      menuUuid,
    );
    return validateResponseDto(MenuResponseDto, result);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', menuPhotoMulterOptions))
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateMenuDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photo = file ? getMenuPhotoPublicPath(file.filename) : undefined;

    const result = await this.menusService.create(
      userId,
      restaurantUuid,
      dto,
      photo,
    );
    return validateResponseDto(MenuResponseDto, result);
  }

  @Patch(':menuUuid')
  @UseInterceptors(FileInterceptor('photo', menuPhotoMulterOptions))
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isMultipart = isMultipartRequest(req);
    const dto = stripRemovePhoto(
      validateDto(
        UpdateMenuDto,
        isMultipart ? parseUpdateMenuDto(body as Record<string, string>) : body,
      ),
    );
    const removePhoto = isMultipart
      ? (body.removePhoto as boolean | string | undefined)
      : (body as UpdateMenuDto).removePhoto;
    const photoPatch = resolvePhotoPatch({
      removePhoto,
      file,
      getPath: getMenuPhotoPublicPath,
    });

    const result = await this.menusService.update(
      userId,
      restaurantUuid,
      menuUuid,
      {
        ...dto,
        ...(photoPatch === null ? { photo: null } : {}),
      },
      photoPatch === null ? undefined : photoPatch,
    );
    return validateResponseDto(MenuResponseDto, result);
  }

  @Put(':menuUuid/tables')
  async updateTables(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() dto: UpdateMenuTablesDto,
  ) {
    const result = await this.menusService.updateTables(
      userId,
      restaurantUuid,
      menuUuid,
      dto.tableUuids,
    );
    return validateResponseDto(MenuResponseDto, result);
  }

  @Delete(':menuUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ): Promise<void> {
    await this.menusService.remove(userId, restaurantUuid, menuUuid);
  }
}

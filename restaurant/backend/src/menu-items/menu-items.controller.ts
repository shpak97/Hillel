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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  isMultipartRequest,
  parseUpdateMenuItemDto,
  resolvePhotoPatch,
  stripRemovePhoto,
  validateDto,
} from 'src/common/utils/patch-body.util';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  getMenuItemPhotoPublicPath,
  menuItemPhotoMulterOptions,
} from 'src/uploads/menu-item-photos.multer';
import {
  CreateMenuItemDto,
  ReplaceMenuItemProductsDto,
  UpdateMenuItemDto,
} from './dto/menu-item.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { MenuItemsService } from './menu-items.service';

@Controller('restaurants/:restaurantUuid/menu-items')
@UseGuards(AuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.menuItemsService.findAll(userId, restaurantUuid);
    return validateResponseDtoList(MenuItemResponseDto, result);
  }

  @Get(':itemUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('itemUuid') itemUuid: string,
  ) {
    const result = await this.menuItemsService.findOne(
      userId,
      restaurantUuid,
      itemUuid,
    );
    return validateResponseDto(MenuItemResponseDto, result);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', menuItemPhotoMulterOptions))
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photo = file ? getMenuItemPhotoPublicPath(file.filename) : undefined;
    const result = await this.menuItemsService.create(
      userId,
      restaurantUuid,
      dto,
      photo,
    );
    return validateResponseDto(MenuItemResponseDto, result);
  }

  @Patch(':itemUuid')
  @UseInterceptors(FileInterceptor('photo', menuItemPhotoMulterOptions))
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('itemUuid') itemUuid: string,
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isMultipart = isMultipartRequest(req);
    const dto = stripRemovePhoto(
      validateDto(
        UpdateMenuItemDto,
        isMultipart
          ? parseUpdateMenuItemDto(body as Record<string, string>)
          : body,
      ),
    );
    const removePhoto = isMultipart
      ? (body.removePhoto as boolean | string | undefined)
      : (body as UpdateMenuItemDto).removePhoto;
    const photoPatch = resolvePhotoPatch({
      removePhoto,
      file,
      getPath: getMenuItemPhotoPublicPath,
    });

    const result = await this.menuItemsService.update(
      userId,
      restaurantUuid,
      itemUuid,
      dto,
      photoPatch,
    );
    return validateResponseDto(MenuItemResponseDto, result);
  }

  @Put(':itemUuid/products')
  async replaceProducts(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('itemUuid') itemUuid: string,
    @Body() dto: ReplaceMenuItemProductsDto,
  ) {
    const result = await this.menuItemsService.replaceProducts(
      userId,
      restaurantUuid,
      itemUuid,
      dto,
    );
    return validateResponseDto(MenuItemResponseDto, result);
  }

  @Delete(':itemUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('itemUuid') itemUuid: string,
  ): Promise<void> {
    await this.menuItemsService.remove(userId, restaurantUuid, itemUuid);
  }
}

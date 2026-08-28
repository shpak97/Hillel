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
  parseUpdateProductDto,
  resolvePhotoPatch,
  stripRemovePhoto,
  validateDto,
} from 'src/common/utils/patch-body.util';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  getProductPhotoPublicPath,
  productPhotoMulterOptions,
} from 'src/uploads/product-photos.multer';
import {
  CreateProductDto,
  ReplaceProductRecipeDto,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsService } from './products.service';

@Controller('restaurants/:restaurantUuid/products')
@UseGuards(AuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.productsService.findAll(userId, restaurantUuid);
    return validateResponseDtoList(ProductResponseDto, result);
  }

  @Get(':productUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('productUuid') productUuid: string,
  ) {
    const result = await this.productsService.findOne(
      userId,
      restaurantUuid,
      productUuid,
    );
    return validateResponseDto(ProductResponseDto, result);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', productPhotoMulterOptions))
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photo = file ? getProductPhotoPublicPath(file.filename) : undefined;
    const result = await this.productsService.create(
      userId,
      restaurantUuid,
      dto,
      photo,
    );
    return validateResponseDto(ProductResponseDto, result);
  }

  @Patch(':productUuid')
  @UseInterceptors(FileInterceptor('photo', productPhotoMulterOptions))
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('productUuid') productUuid: string,
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const isMultipart = isMultipartRequest(req);
    const dto = stripRemovePhoto(
      validateDto(
        UpdateProductDto,
        isMultipart
          ? parseUpdateProductDto(body as Record<string, string>)
          : body,
      ),
    );
    const removePhoto = isMultipart
      ? (body.removePhoto as boolean | string | undefined)
      : (body as UpdateProductDto).removePhoto;
    const photoPatch = resolvePhotoPatch({
      removePhoto,
      file,
      getPath: getProductPhotoPublicPath,
    });

    const result = await this.productsService.update(
      userId,
      restaurantUuid,
      productUuid,
      dto,
      photoPatch,
    );
    return validateResponseDto(ProductResponseDto, result);
  }

  @Put(':productUuid/recipe')
  async replaceRecipe(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('productUuid') productUuid: string,
    @Body() dto: ReplaceProductRecipeDto,
  ) {
    const result = await this.productsService.replaceRecipe(
      userId,
      restaurantUuid,
      productUuid,
      dto,
    );
    return validateResponseDto(ProductResponseDto, result);
  }

  @Delete(':productUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('productUuid') productUuid: string,
  ): Promise<void> {
    await this.productsService.remove(userId, restaurantUuid, productUuid);
  }
}

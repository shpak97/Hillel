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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { HoursResponseDto } from 'src/common/dto/hours-response.dto';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  getRestaurantPhotoPublicPath,
  restaurantPhotosMulterOptions,
} from 'src/uploads/restaurant-photos.multer';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantResponseDto } from './dto/restaurant-response.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UpdateRestaurantHoursDto } from './hours/dto/update-restaurant-hours.dto';
import { RestaurantHoursService } from './hours/restaurant-hours.service';
import { RestaurantsService } from './restaurants.service';

function parseExistingPhotos(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === 'string',
        );
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

@Controller('restaurants')
@UseGuards(AuthGuard)
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly restaurantHoursService: RestaurantHoursService,
  ) {}

  @Get()
  async findAll(@CurrentUserId() userId: number) {
    const result = await this.restaurantsService.findAll(userId);
    return validateResponseDtoList(RestaurantResponseDto, result);
  }

  @Get(':uuid/hours')
  async getHours(@CurrentUserId() userId: number, @Param('uuid') uuid: string) {
    const result = await this.restaurantHoursService.getHours(userId, uuid);
    return validateResponseDto(HoursResponseDto, result);
  }

  @Put(':uuid/hours')
  async updateHours(
    @CurrentUserId() userId: number,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRestaurantHoursDto,
  ) {
    const result = await this.restaurantHoursService.updateHours(
      userId,
      uuid,
      dto,
    );
    return validateResponseDto(HoursResponseDto, result);
  }

  @Get(':uuid')
  async findOne(@CurrentUserId() userId: number, @Param('uuid') uuid: string) {
    const result = await this.restaurantsService.findOne(userId, uuid);
    return validateResponseDto(RestaurantResponseDto, result);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('photos', 20, restaurantPhotosMulterOptions),
  )
  async create(
    @CurrentUserId() userId: number,
    @Body() dto: CreateRestaurantDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const photos = files.map((file) =>
      getRestaurantPhotoPublicPath(file.filename),
    );

    const result = await this.restaurantsService.create(userId, dto, photos);
    return validateResponseDto(RestaurantResponseDto, result);
  }

  @Patch(':uuid')
  @UseInterceptors(
    FilesInterceptor('photos', 20, restaurantPhotosMulterOptions),
  )
  async update(
    @CurrentUserId() userId: number,
    @Param('uuid') uuid: string,
    @Body() body: UpdateRestaurantDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const newPhotos = files.map((file) =>
      getRestaurantPhotoPublicPath(file.filename),
    );
    const existingPhotos = parseExistingPhotos(body.existingPhotos);
    const dto: UpdateRestaurantDto = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(body.currency !== undefined ? { currency: body.currency } : {}),
      ...(existingPhotos !== undefined ? { photos: existingPhotos } : {}),
    };

    const result = await this.restaurantsService.update(
      userId,
      uuid,
      dto,
      newPhotos,
    );
    return validateResponseDto(RestaurantResponseDto, result);
  }

  @Patch(':uuid/deactivate')
  async deactivate(
    @CurrentUserId() userId: number,
    @Param('uuid') uuid: string,
  ) {
    const result = await this.restaurantsService.deactivate(userId, uuid);
    return validateResponseDto(RestaurantResponseDto, result);
  }

  @Patch(':uuid/activate')
  async activate(@CurrentUserId() userId: number, @Param('uuid') uuid: string) {
    const result = await this.restaurantsService.activate(userId, uuid);
    return validateResponseDto(RestaurantResponseDto, result);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('uuid') uuid: string,
  ): Promise<void> {
    await this.restaurantsService.remove(userId, uuid);
  }
}

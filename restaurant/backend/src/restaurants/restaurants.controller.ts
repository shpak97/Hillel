import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  CurrentUser,
  getCurrentUserId,
} from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  getRestaurantPhotoPublicPath,
  restaurantPhotosMulterOptions,
} from 'src/uploads/restaurant-photos.multer';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
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
        return parsed.filter((item): item is string => typeof item === 'string');
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
  findAll(@CurrentUser() user: { uid: string | number }) {
    return this.restaurantsService.findAll(getCurrentUserId(user));
  }

  @Get(':uuid/hours')
  getHours(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
  ) {
    return this.restaurantHoursService.getHours(getCurrentUserId(user), uuid);
  }

  @Put(':uuid/hours')
  updateHours(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
    @Body() dto: UpdateRestaurantHoursDto,
  ) {
    return this.restaurantHoursService.updateHours(
      getCurrentUserId(user),
      uuid,
      dto,
    );
  }

  @Get(':uuid')
  findOne(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
  ) {
    return this.restaurantsService.findOne(getCurrentUserId(user), uuid);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('photos', 20, restaurantPhotosMulterOptions),
  )
  create(
    @CurrentUser() user: { uid: string | number },
    @Body() dto: CreateRestaurantDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    const photos = files.map((file) =>
      getRestaurantPhotoPublicPath(file.filename),
    );

    return this.restaurantsService.create(
      getCurrentUserId(user),
      dto,
      photos,
    );
  }

  @Patch(':uuid')
  @UseInterceptors(
    FilesInterceptor('photos', 20, restaurantPhotosMulterOptions),
  )
  update(
    @CurrentUser() user: { uid: string | number },
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
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(existingPhotos !== undefined ? { photos: existingPhotos } : {}),
    };

    return this.restaurantsService.update(
      getCurrentUserId(user),
      uuid,
      dto,
      newPhotos,
    );
  }

  @Patch(':uuid/deactivate')
  deactivate(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
  ) {
    return this.restaurantsService.deactivate(getCurrentUserId(user), uuid);
  }

  @Patch(':uuid/activate')
  activate(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
  ) {
    return this.restaurantsService.activate(getCurrentUserId(user), uuid);
  }

  @Delete(':uuid')
  remove(
    @CurrentUser() user: { uid: string | number },
    @Param('uuid') uuid: string,
  ) {
    return this.restaurantsService.remove(getCurrentUserId(user), uuid);
  }
}

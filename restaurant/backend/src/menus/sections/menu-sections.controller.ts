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
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  CreateMenuSectionDto,
  UpdateMenuSectionDto,
} from './dto/menu-section.dto';
import { MenuSectionResponseDto } from './dto/menu-section-response.dto';
import { MenuSectionsService } from './menu-sections.service';

@Controller('restaurants/:restaurantUuid/menus/:menuUuid/sections')
@UseGuards(AuthGuard)
export class MenuSectionsController {
  constructor(private readonly menuSectionsService: MenuSectionsService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
  ) {
    const result = await this.menuSectionsService.findAll(
      userId,
      restaurantUuid,
      menuUuid,
    );
    return validateResponseDtoList(MenuSectionResponseDto, result);
  }

  @Get(':sectionUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Param('sectionUuid') sectionUuid: string,
  ) {
    const result = await this.menuSectionsService.findOne(
      userId,
      restaurantUuid,
      menuUuid,
      sectionUuid,
    );
    return validateResponseDto(MenuSectionResponseDto, result);
  }

  @Post()
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Body() dto: CreateMenuSectionDto,
  ) {
    const result = await this.menuSectionsService.create(
      userId,
      restaurantUuid,
      menuUuid,
      dto,
    );
    return validateResponseDto(MenuSectionResponseDto, result);
  }

  @Patch(':sectionUuid')
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Param('sectionUuid') sectionUuid: string,
    @Body() dto: UpdateMenuSectionDto,
  ) {
    const result = await this.menuSectionsService.update(
      userId,
      restaurantUuid,
      menuUuid,
      sectionUuid,
      dto,
    );
    return validateResponseDto(MenuSectionResponseDto, result);
  }

  @Delete(':sectionUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('menuUuid') menuUuid: string,
    @Param('sectionUuid') sectionUuid: string,
  ): Promise<void> {
    await this.menuSectionsService.remove(
      userId,
      restaurantUuid,
      menuUuid,
      sectionUuid,
    );
  }
}

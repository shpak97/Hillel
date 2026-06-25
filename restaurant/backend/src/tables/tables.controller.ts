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
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import {
  CreateTableDto,
  UpdateTableDto,
  UpdateTableMenusDto,
} from './dto/table.dto';
import { TableResponseDto } from './dto/table-response.dto';
import { TablesService } from './tables.service';

@Controller('restaurants/:restaurantUuid/tables')
@UseGuards(AuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    const result = await this.tablesService.findAll(userId, restaurantUuid);
    return validateResponseDtoList(TableResponseDto, result);
  }

  @Get(':tableUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
  ) {
    const result = await this.tablesService.findOne(
      userId,
      restaurantUuid,
      tableUuid,
    );
    return validateResponseDto(TableResponseDto, result);
  }

  @Post()
  async create(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateTableDto,
  ) {
    const result = await this.tablesService.create(
      userId,
      restaurantUuid,
      dto,
    );
    return validateResponseDto(TableResponseDto, result);
  }

  @Patch(':tableUuid')
  async update(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
    @Body() dto: UpdateTableDto,
  ) {
    const result = await this.tablesService.update(
      userId,
      restaurantUuid,
      tableUuid,
      dto,
    );
    return validateResponseDto(TableResponseDto, result);
  }

  @Put(':tableUuid/menus')
  async updateMenus(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
    @Body() dto: UpdateTableMenusDto,
  ) {
    const result = await this.tablesService.updateMenus(
      userId,
      restaurantUuid,
      tableUuid,
      dto.menuUuids,
    );
    return validateResponseDto(TableResponseDto, result);
  }

  @Delete(':tableUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
  ): Promise<void> {
    await this.tablesService.remove(userId, restaurantUuid, tableUuid);
  }
}

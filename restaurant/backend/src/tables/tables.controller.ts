import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  getCurrentUserId,
} from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateTableDto,
  UpdateTableDto,
  UpdateTableMenusDto,
} from './dto/table.dto';
import { TablesService } from './tables.service';

@Controller('restaurants/:restaurantUuid/tables')
@UseGuards(AuthGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
  ) {
    return this.tablesService.findAll(getCurrentUserId(user), restaurantUuid);
  }

  @Get(':tableUuid')
  findOne(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
  ) {
    return this.tablesService.findOne(
      getCurrentUserId(user),
      restaurantUuid,
      tableUuid,
    );
  }

  @Post()
  create(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Body() dto: CreateTableDto,
  ) {
    return this.tablesService.create(
      getCurrentUserId(user),
      restaurantUuid,
      dto,
    );
  }

  @Patch(':tableUuid')
  update(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tablesService.update(
      getCurrentUserId(user),
      restaurantUuid,
      tableUuid,
      dto,
    );
  }

  @Put(':tableUuid/menus')
  updateMenus(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
    @Body() dto: UpdateTableMenusDto,
  ) {
    return this.tablesService.updateMenus(
      getCurrentUserId(user),
      restaurantUuid,
      tableUuid,
      dto.menuUuids,
    );
  }

  @Delete(':tableUuid')
  remove(
    @CurrentUser() user: { uid: string | number },
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('tableUuid') tableUuid: string,
  ) {
    return this.tablesService.remove(
      getCurrentUserId(user),
      restaurantUuid,
      tableUuid,
    );
  }
}

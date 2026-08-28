import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  validateResponseDto,
  validateResponseDtoList,
} from 'src/common/utils/validate-response.util';
import { AdminOrderResponseDto } from './dto/admin-order-response.dto';
import { ListOrdersQueryDto } from './dto/list-orders-query.dto';
import { OrdersService } from './orders.service';

@Controller('restaurants/:restaurantUuid/orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Query() query: ListOrdersQueryDto,
  ) {
    const result = await this.ordersService.findAll(
      userId,
      restaurantUuid,
      query.status,
    );
    return validateResponseDtoList(AdminOrderResponseDto, result);
  }

  @Get(':orderUuid')
  async findOne(
    @CurrentUserId() userId: number,
    @Param('restaurantUuid') restaurantUuid: string,
    @Param('orderUuid') orderUuid: string,
  ) {
    const result = await this.ordersService.findOne(
      userId,
      restaurantUuid,
      orderUuid,
    );
    return validateResponseDto(AdminOrderResponseDto, result);
  }
}

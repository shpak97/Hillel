import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
// import { OrdersService } from './orders.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Get('')
  getAll(@Body() query: unknown) {
    console.log(query);
  }
  @Get(':id')
  getById(@Body() id: number) {
    console.log(id);
  }

  @Post(':id')
  create(@Body() data: unknown) {
    console.log(data);
  }
}

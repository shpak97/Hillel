import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { OrdersController } from './orders.controller';
import { OrdersData } from './orders.data';
import { OrdersService } from './orders.service';

@Module({
  imports: [AuthModule, forwardRef(() => RestaurantsModule)],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersData, PrismaService],
  exports: [OrdersData, OrdersService],
})
export class OrdersModule {}

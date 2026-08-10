import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsData } from './menu-items.data';
import { MenuItemsService } from './menu-items.service';

@Module({
  imports: [AuthModule, ProductsModule, forwardRef(() => RestaurantsModule)],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsData, PrismaService],
  exports: [MenuItemsService, MenuItemsData],
})
export class MenuItemsModule {}

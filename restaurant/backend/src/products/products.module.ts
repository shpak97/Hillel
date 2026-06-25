import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { IngredientsModule } from 'src/ingredients/ingredients.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { ProductsController } from './products.controller';
import { ProductsData } from './products.data';
import { ProductsService } from './products.service';

@Module({
  imports: [
    AuthModule,
    IngredientsModule,
    forwardRef(() => RestaurantsModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsData, PrismaService],
  exports: [ProductsService, ProductsData],
})
export class ProductsModule {}

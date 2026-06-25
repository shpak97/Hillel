import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientsData } from './ingredients.data';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [AuthModule, forwardRef(() => RestaurantsModule)],
  controllers: [IngredientsController],
  providers: [IngredientsService, IngredientsData, PrismaService],
  exports: [IngredientsService, IngredientsData],
})
export class IngredientsModule {}

import { Module } from '@nestjs/common';
import { AclModule } from 'src/acl/acl.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../prisma.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantHoursData } from './hours/restaurant-hours.data';
import { RestaurantHoursService } from './hours/restaurant-hours.service';
import { RestaurantsData } from './restaurants.data';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [AuthModule, AclModule],
  controllers: [RestaurantsController],
  providers: [
    RestaurantsService,
    RestaurantsData,
    RestaurantHoursService,
    RestaurantHoursData,
    PrismaService,
  ],
  exports: [RestaurantsService, RestaurantsData],
})
export class RestaurantsModule {}

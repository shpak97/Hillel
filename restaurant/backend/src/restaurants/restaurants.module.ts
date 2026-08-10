import { Module } from '@nestjs/common';
import { AclModule } from 'src/acl/acl.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from '../prisma.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantHoursData } from './hours/restaurant-hours.data';
import { RestaurantHoursService } from './hours/restaurant-hours.service';
import { RestaurantQrStyleController } from './qr-style/restaurant-qr-style.controller';
import { RestaurantQrStyleService } from './qr-style/restaurant-qr-style.service';
import { RestaurantsData } from './restaurants.data';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [AuthModule, AclModule],
  controllers: [RestaurantsController, RestaurantQrStyleController],
  providers: [
    RestaurantsService,
    RestaurantsData,
    RestaurantHoursService,
    RestaurantHoursData,
    RestaurantQrStyleService,
    PrismaService,
  ],
  exports: [RestaurantsService, RestaurantsData, RestaurantQrStyleService],
})
export class RestaurantsModule {}

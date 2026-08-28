import { Module } from '@nestjs/common';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { MenusModule } from 'src/menus/menus.module';
import { OrdersModule } from 'src/orders/orders.module';
import { MonobankModule } from 'src/payments/monobank/monobank.module';
import { QrCodesModule } from 'src/qr-codes/qr-codes.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { TablesModule } from 'src/tables/tables.module';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

@Module({
  imports: [
    RestaurantsModule,
    QrCodesModule,
    MenusModule,
    MenuItemsModule,
    TablesModule,
    OrdersModule,
    MonobankModule,
  ],
  controllers: [GuestController],
  providers: [GuestService],
})
export class GuestModule {}

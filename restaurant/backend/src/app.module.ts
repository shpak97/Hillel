import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TablesModule } from './tables/tables.module';
import { MenusModule } from './menus/menus.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { ProductsModule } from './products/products.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { GuestModule } from './guest/guest.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    RestaurantsModule,
    TablesModule,
    MenusModule,
    IngredientsModule,
    ProductsModule,
    MenuItemsModule,
    QrCodesModule,
    GuestModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

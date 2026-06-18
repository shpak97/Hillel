import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TablesModule } from './tables/tables.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [UsersModule, AuthModule, RestaurantsModule, TablesModule, MenusModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

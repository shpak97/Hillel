import { Module, forwardRef } from '@nestjs/common';
import { AclModule } from 'src/acl/acl.module';
import { AuthModule } from 'src/auth/auth.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { MenuHoursData } from './hours/menu-hours.data';
import { MenuHoursService } from './hours/menu-hours.service';
import { MenusController } from './menus.controller';
import { MenusData } from './menus.data';
import { MenusService } from './menus.service';

@Module({
  imports: [AuthModule, AclModule, forwardRef(() => RestaurantsModule)],
  controllers: [MenusController],
  providers: [
    MenusService,
    MenusData,
    MenuHoursService,
    MenuHoursData,
    PrismaService,
  ],
  exports: [MenusService, MenusData],
})
export class MenusModule {}

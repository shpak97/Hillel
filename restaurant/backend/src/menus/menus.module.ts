import { Module, forwardRef } from '@nestjs/common';
import { AclModule } from 'src/acl/acl.module';
import { AuthModule } from 'src/auth/auth.module';
import { MenuItemsModule } from 'src/menu-items/menu-items.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { MenuHoursData } from './hours/menu-hours.data';
import { MenuHoursService } from './hours/menu-hours.service';
import { MenusController } from './menus.controller';
import { MenusData } from './menus.data';
import { MenusService } from './menus.service';
import { MenuSectionItemsController } from './sections/menu-section-items.controller';
import { MenuSectionItemsData } from './sections/menu-section-items.data';
import { MenuSectionItemsService } from './sections/menu-section-items.service';
import { MenuSectionsController } from './sections/menu-sections.controller';
import { MenuSectionsData } from './sections/menu-sections.data';
import { MenuSectionsService } from './sections/menu-sections.service';

@Module({
  imports: [
    AuthModule,
    AclModule,
    MenuItemsModule,
    forwardRef(() => RestaurantsModule),
  ],
  controllers: [
    MenusController,
    MenuSectionsController,
    MenuSectionItemsController,
  ],
  providers: [
    MenusService,
    MenusData,
    MenuHoursService,
    MenuHoursData,
    MenuSectionsService,
    MenuSectionsData,
    MenuSectionItemsService,
    MenuSectionItemsData,
    PrismaService,
  ],
  exports: [MenusService, MenusData],
})
export class MenusModule {}

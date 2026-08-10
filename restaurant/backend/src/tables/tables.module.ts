import { Module, forwardRef } from '@nestjs/common';
import { AclModule } from 'src/acl/acl.module';
import { AuthModule } from 'src/auth/auth.module';
import { QrModule } from 'src/qr/qr.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { TablesController } from './tables.controller';
import { TablesData } from './tables.data';
import { TablesService } from './tables.service';

@Module({
  imports: [
    AuthModule,
    AclModule,
    QrModule,
    forwardRef(() => RestaurantsModule),
  ],
  controllers: [TablesController],
  providers: [TablesService, TablesData, PrismaService],
  exports: [TablesService, TablesData],
})
export class TablesModule {}

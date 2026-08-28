import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { MenusModule } from 'src/menus/menus.module';
import { QrModule } from 'src/qr/qr.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { PrismaService } from '../prisma.service';
import { QrCodesController } from './qr-codes.controller';
import { QrCodesData } from './qr-codes.data';
import { QrCodesService } from './qr-codes.service';

@Module({
  imports: [
    AuthModule,
    MenusModule,
    QrModule,
    forwardRef(() => RestaurantsModule),
  ],
  controllers: [QrCodesController],
  providers: [QrCodesService, QrCodesData, PrismaService],
  exports: [QrCodesService, QrCodesData],
})
export class QrCodesModule {}

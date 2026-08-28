import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersData } from './users.data';

@Module({
  providers: [UsersData, PrismaService],
  exports: [UsersData],
})
export class UsersModule {}

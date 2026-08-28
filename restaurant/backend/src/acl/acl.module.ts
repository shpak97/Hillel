import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AclData } from './acl.data';
import { AclService } from './acl.service';

@Module({
  providers: [AclData, AclService, PrismaService],
  exports: [AclData, AclService],
})
export class AclModule {}

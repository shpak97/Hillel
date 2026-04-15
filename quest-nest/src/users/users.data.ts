import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';
//user.data.service.ts

@Injectable()
export class UsersData {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  findMany(params: {
    skip?: number;
    take?: number;
    where: Prisma.UserWhereInput;
  }) {
    const { skip, take, where } = params;

    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy: { id: 'asc' },
      // add orderBy as a default value for the query if orderBy is not provided
    });
  }

  findUnique(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where });
  }

  update(where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where,
      data,
    });
  }

  remove(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.deleteMany({ where });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      phone: createUserDto.phone,
      fullname: createUserDto.fullname,
      meta: createUserDto.meta as Prisma.InputJsonValue | undefined,
    };

    return this.prisma.user.create({
      data,
    });
  }

  findAll(query: QueryUsersDto) {
    const skip = query.skip ?? undefined;
    const take = query.take ?? undefined;

    return this.prisma.user.findMany({
      skip,
      take,
      where: {
        email: query.email
          ? {
              contains: query.email,
              mode: 'insensitive',
            }
          : undefined,
        fullname: query.fullname
          ? {
              contains: query.fullname,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      phone: updateUserDto.phone,
      fullname: updateUserDto.fullname,
      meta: updateUserDto.meta as Prisma.InputJsonValue | undefined,
    };

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}

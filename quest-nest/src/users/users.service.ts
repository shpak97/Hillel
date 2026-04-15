import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';
import { Prisma } from '@prisma/client';
import { IQueryUsers, QueryUsersDto } from './dto/query-users.dto';
import { IUpdateUser } from './dto/update-user.dto';
import { UsersData } from './users.data';

@Injectable()
export class UsersService {
  constructor(private readonly usersData: UsersData) {}

  findAll(query: QueryUsersDto) {
    const { skip, take, filters } = this.parseListQuery(query);
    const where = this.buildUserWhere(filters);

    return this.usersData.findMany({
      skip,
      take,
      where,
    });
  }

  private buildUserWhere(
    filters: Record<string, string>,
  ): Prisma.UserWhereInput {
    const where: Record<string, { contains: string }> = {};

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      where[key] = { contains: value };
    }

    return where as Prisma.UserWhereInput;
  }

  private parseListQuery(query: IQueryUsers): {
    skip: number;
    take: number;
    filters: Record<string, string>;
  } {
    const { skip, take, ...rest } = query;

    const first = (v: unknown): string | undefined => {
      if (typeof v === 'string') return v;
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
      return undefined;
    };

    const filters: Record<string, string> = {};
    for (const [key, raw] of Object.entries(rest)) {
      const s = first(raw);
      if (s == null || s === '') continue;
      filters[key] = s.toLowerCase();
    }

    return {
      skip: skip ?? 0,
      take: take ?? 10,
      filters,
    };
  }

  async findOne(id: number) {
    const user = await this.usersData.findUnique({ id });
    if (!user)
      throw new NotFoundException(
        `[USER_NOT_FOUND]: User not found during findOne`,
      );
    return user;
  }

  async update(id: number, updateUserDto: IUpdateUser) {
    const data: Prisma.UserUpdateInput = {
      phone: updateUserDto.phone,
      fullname: updateUserDto.fullname,
    };

    try {
      return await this.usersData.update({ id }, data);
    } catch (e: unknown) {
      if (isPrismaErrorCode(e, 'P2025')) {
        throw new BadRequestException(`User id is not valid`);
      }
      throw e;
    }
  }

  async remove(id: number) {
    const { count } = await this.usersData.remove({ id });
    if (count === 0) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }
}

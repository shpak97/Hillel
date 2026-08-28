import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Prisma, User } from '@prisma/client';
import { UsersData } from 'src/users/users.data';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OrdersService {
  constructor(
    private readonly usersData: UsersData,
    private readonly jwtService: JwtService,
  ) {}
}

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

@Injectable()
export class AuthService {
  constructor(private readonly usersData: UsersData) {}

  async login(loginRequestDto: LoginRequestDto): Promise<User | undefined> {
    const user = await this.usersData.findUnique({
      email: loginRequestDto.email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordHash = this.getHashedPasswordFromMeta(user.meta);
    if (!passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.comparePassword(
      loginRequestDto.password,
      passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async register(registerRequestDto: RegisterRequestDto): Promise<void> {
    await this.createUser(registerRequestDto);
  }
  private async createUser(registerRequestDto: RegisterRequestDto) {
    const data: Prisma.UserCreateInput = {
      email: registerRequestDto.email,
      phone: registerRequestDto.phone,
      fullname: registerRequestDto.fullname,
      meta: {
        password: await this.hashPassword(registerRequestDto.password),
      },
    };
    return await this.usersData.create(data);
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async comparePassword(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  private getHashedPasswordFromMeta(
    meta: Prisma.JsonValue | null,
  ): string | null {
    if (typeof meta !== 'object' || meta === null || Array.isArray(meta)) {
      return null;
    }

    const password = (meta as { password?: unknown }).password;
    return typeof password === 'string' ? password : null;
  }
}
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
export class AuthService {
  constructor(
    private readonly usersData: UsersData,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    loginRequestDto: LoginRequestDto,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersData.findUnique({
      email: loginRequestDto.email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password: passwordHash } = user.meta as PrismaJson.UserMeta;

    const isValidPassword = await this.comparePassword(
      loginRequestDto.password,
      passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.jwtService.signAsync({
      uid: user.id,
      type: 'access_token',
    });
    if (!accessToken) {
      throw new UnauthorizedException('Failed to generate access token');
    }
    await this.usersData.update(
      { id: user.id },
      { meta: { ...user.meta, accessToken } as PrismaJson.UserMeta },
    );
    return { accessToken };
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
}

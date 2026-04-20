import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Prisma } from '@prisma/client';
import { UsersData } from 'src/users/users.data';
import bcrypt from 'bcrypt';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { TOKEN_TYPE } from 'src/types/token';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { isPrismaErrorCode } from 'src/common/utils/prisma-error.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersData: UsersData,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,
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
    const accessToken = await this.generateToken({
      uid: user.id,
      type: TOKEN_TYPE.ACCESS_TOKEN,
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
    try {
      await this.createUser(registerRequestDto);
    } catch (error: unknown) {
      if (isPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(
          'Користувач із такою поштою вже зареєстрований.',
        );
      }
      throw error;
    }
    await this.emailVerificationService.sendVerificationEmail(
      registerRequestDto.email,
      { ignoreCooldown: true },
    );
  }
  private async createUser(registerRequestDto: RegisterRequestDto) {
    const data: Prisma.UserCreateInput = {
      email: registerRequestDto.email,
      phone: registerRequestDto.phone,
      fullname: registerRequestDto.fullname,
      meta: {
        password: await this.hashPassword(registerRequestDto.password),
        accessToken: '',
        emailVerified: false,
      } as PrismaJson.UserMeta,
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
  private async generateToken<T extends object>(
    tokenData: T,
    options?: JwtSignOptions,
  ): Promise<string> {
    return await this.jwtService.signAsync(tokenData, options);
  }
}

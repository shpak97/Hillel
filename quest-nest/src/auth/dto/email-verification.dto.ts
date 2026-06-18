import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailVerificationEmailDto {
  @IsEmail()
  email!: string;
}

export class VerifyEmailQueryDto {
  @IsNotEmpty()
  @IsString()
  token!: string;
}

import { IsEmail, IsJWT, IsNotEmpty } from 'class-validator';

export class EmailVerificationEmailDto {
  @IsEmail()
  email!: string;
}

export class VerifyEmailQueryDto {
  @IsNotEmpty()
  @IsJWT()
  token!: string;
}

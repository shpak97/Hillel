import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class AccessTokenResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}

export class MessageResponseDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshAccessTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

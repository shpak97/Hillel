import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshAccessTokenRequestDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken!: string;
}

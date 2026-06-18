import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsJWT,
} from 'class-validator';

export interface IPasswordResetRequestDto {
  password: string;
  token: string;
}
export class PasswordResetRequestDto implements IPasswordResetRequestDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password!: string;
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  token!: string;
}

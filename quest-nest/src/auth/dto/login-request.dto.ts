import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password!: string;
}

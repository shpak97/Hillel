import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password!: string;
}

import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
export class RegisterRequestDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  fullname?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  // TODO: add password validation
  password!: string;
}

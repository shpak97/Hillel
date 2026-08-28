import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from 'src/common/validation/password.constant';
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
  @Matches(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE })
  password!: string;
}

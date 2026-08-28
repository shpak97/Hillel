import { IsEmail, IsString, Matches } from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from 'src/common/validation/password.constant';

export class RegisterRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE })
  password!: string;
}

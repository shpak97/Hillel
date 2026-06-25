import { IsJWT, IsNotEmpty, IsString, Matches } from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_VALIDATION_MESSAGE,
} from 'src/common/validation/password.constant';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsJWT()
  token!: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_VALIDATION_MESSAGE })
  password!: string;
}

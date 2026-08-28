import { IsEmail } from 'class-validator';
export interface IPasswordResetEmailRequestDto {
  email: string;
}
export class PasswordResetEmailRequestDto implements IPasswordResetEmailRequestDto {
  @IsEmail()
  email!: string;
}

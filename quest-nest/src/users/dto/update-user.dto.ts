import {
  IsOptional,
  IsString,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export interface IUpdateUser {
  phone?: string;
  fullname?: string;
}

export class UpdateUserDto implements IUpdateUser {
  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  fullname?: string;
}

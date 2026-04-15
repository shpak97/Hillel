import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
} from 'class-validator';
export interface IQueryUsers {
  email?: string;
  phone?: string;
  fullname?: string;
  meta?: Record<string, unknown>;
  skip?: number;
  take?: number;
}

export class QueryUsersDto implements IQueryUsers {
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsString()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @IsOptional()
  fullname?: string;
  @IsOptional()
  meta?: Record<string, unknown>;
  @IsInt()
  @IsOptional()
  skip?: number;
  @IsInt()
  @IsOptional()
  take?: number;
}

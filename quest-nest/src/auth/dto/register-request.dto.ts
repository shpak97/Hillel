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
  password!: string;
}
// import { ValidateNested, IsString } from 'class-validator';
// import { Type } from 'class-transformer';

// class ProfileDto {
//   @IsString()
//   firstName: string;

//   @IsString()
//   lastName: string;
// }

// export class CreateUserDto {
//   @ValidateNested()
//   @Type(() => ProfileDto) // ОБЯЗАТЕЛЬНО
//   profile: ProfileDto;
// }

// export class CreateUserMetaDto {
//  password?: string;
// isVerified?: boolean;
// accessToken?: string;
// }
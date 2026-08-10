import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GuestQrRestaurantDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;
}

export class GuestQrCodeDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class GuestQrMenuDto {
  @IsString()
  @IsNotEmpty()
  menuId!: string;

  @IsString()
  @IsNotEmpty()
  menuName!: string;

  @IsBoolean()
  selectTable!: boolean;

  @IsInt()
  sortOrder!: number;

  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class GuestQrResponseDto {
  @ValidateNested()
  @Type(() => GuestQrRestaurantDto)
  restaurant!: GuestQrRestaurantDto;

  @ValidateNested()
  @Type(() => GuestQrCodeDto)
  qrCode!: GuestQrCodeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestQrMenuDto)
  menus!: GuestQrMenuDto[];
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { GuestQrRestaurantDto } from './guest-qr-response.dto';

export class GuestTableDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;
}

export class GuestTableMenuDto {
  @IsString()
  @IsNotEmpty()
  menuId!: string;

  @IsString()
  @IsNotEmpty()
  menuName!: string;

  @IsInt()
  sortOrder!: number;

  @IsString()
  @IsNotEmpty()
  url!: string;
}

export class GuestTableResponseDto {
  @ValidateNested()
  @Type(() => GuestQrRestaurantDto)
  restaurant!: GuestQrRestaurantDto;

  @ValidateNested()
  @Type(() => GuestTableDto)
  table!: GuestTableDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestTableMenuDto)
  menus!: GuestTableMenuDto[];
}

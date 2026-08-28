import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class QrCodeMenuResponseDto {
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
}

export class QrCodeResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QrCodeMenuResponseDto)
  menus!: QrCodeMenuResponseDto[];
}

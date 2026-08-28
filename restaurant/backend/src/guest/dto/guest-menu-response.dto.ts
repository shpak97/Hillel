import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GuestMenuRestaurantDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;
}

export class GuestMenuItemDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string | null;

  @IsOptional()
  @IsString()
  photo!: string | null;

  @IsNumber()
  totalPrice!: number;

  @IsInt()
  sortOrder!: number;
}

export class GuestMenuSectionDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  sortOrder!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestMenuItemDto)
  items!: GuestMenuItemDto[];
}

export class GuestMenuHoursDto {
  @IsBoolean()
  isOpenNow!: boolean;
}

export class GuestMenuDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string | null;

  @IsOptional()
  @IsString()
  photo!: string | null;
}

export class GuestMenuResponseDto {
  @ValidateNested()
  @Type(() => GuestMenuRestaurantDto)
  restaurant!: GuestMenuRestaurantDto;

  @ValidateNested()
  @Type(() => GuestMenuDto)
  menu!: GuestMenuDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestMenuSectionDto)
  sections!: GuestMenuSectionDto[];

  @ValidateNested()
  @Type(() => GuestMenuHoursDto)
  hours!: GuestMenuHoursDto;
}

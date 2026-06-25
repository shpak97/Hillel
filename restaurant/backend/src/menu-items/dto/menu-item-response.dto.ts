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

export class MenuItemProductResponseDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  productName!: string;

  @IsNumber()
  quantity!: number;

  @IsOptional()
  @IsNumber()
  priceOverride!: number | null;

  @IsNumber()
  unitPrice!: number;

  @IsNumber()
  linePrice!: number;

  @IsInt()
  sortOrder!: number;
}

export class MenuItemResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description!: string | null;

  @IsOptional()
  @IsString()
  photo!: string | null;

  @IsBoolean()
  isActive!: boolean;

  @IsNumber()
  calculatedPrice!: number;

  @IsOptional()
  @IsNumber()
  priceOverride!: number | null;

  @IsNumber()
  totalPrice!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemProductResponseDto)
  products!: MenuItemProductResponseDto[];
}

export class SectionMenuItemResponseDto extends MenuItemResponseDto {
  @IsInt()
  sortOrder!: number;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ProductRecipeItemResponseDto {
  @IsString()
  @IsNotEmpty()
  ingredientId!: string;

  @IsString()
  @IsNotEmpty()
  ingredientName!: string;

  @IsNumber()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}

export class ProductResponseDto {
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

  @IsString()
  @IsNotEmpty()
  baseUnit!: string;

  @IsNumber()
  basePrice!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeItemResponseDto)
  recipe!: ProductRecipeItemResponseDto[];
}

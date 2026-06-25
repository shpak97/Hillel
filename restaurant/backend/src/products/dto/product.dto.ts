import { MeasureUnit } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { parseMoneyInput } from 'src/common/utils/money.util';

function transformMoney({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') {
    return value;
  }

  return parseMoneyInput(value as string | number);
}

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(MeasureUnit)
  baseUnit!: MeasureUnit;

  @Transform(transformMoney)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  basePrice!: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(MeasureUnit)
  baseUnit?: MeasureUnit;

  @Transform(transformMoney)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  basePrice?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  removePhoto?: boolean;
}

export class ProductRecipeItemDto {
  @IsString()
  ingredientId!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;

  @IsEnum(MeasureUnit)
  unit!: MeasureUnit;
}

export class ReplaceProductRecipeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductRecipeItemDto)
  ingredients!: ProductRecipeItemDto[];
}

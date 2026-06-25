import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MeasureUnit } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsEnum(MeasureUnit)
  baseUnit!: MeasureUnit;
}

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(MeasureUnit)
  baseUnit?: MeasureUnit;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

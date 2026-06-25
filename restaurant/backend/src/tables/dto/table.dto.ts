import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTableDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  zone!: string;

  @IsInt()
  @Min(1)
  seats!: number;
}

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  zone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTableMenusDto {
  @IsArray()
  @IsString({ each: true })
  menuUuids!: string[];
}

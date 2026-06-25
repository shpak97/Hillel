import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class TableResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  zone!: string;

  @IsInt()
  seats!: number;

  @IsBoolean()
  isActive!: boolean;

  @IsArray()
  @IsString({ each: true })
  menuUuids!: string[];
}

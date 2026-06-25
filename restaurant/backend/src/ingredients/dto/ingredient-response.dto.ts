import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class IngredientResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  restaurantId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  baseUnit!: string;

  @IsBoolean()
  isActive!: boolean;
}

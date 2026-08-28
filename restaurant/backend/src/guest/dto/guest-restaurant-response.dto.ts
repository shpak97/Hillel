import { IsNotEmpty, IsString } from 'class-validator';

export class GuestRestaurantResponseDto {
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

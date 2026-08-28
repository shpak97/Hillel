import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RestaurantResponseDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  address!: string | null;

  @IsArray()
  @IsString({ each: true })
  photos!: string[];

  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsString()
  deactivatedAt!: string | null;

  @IsInt()
  ownerId!: number;

  @IsIn(['active', 'setup'])
  status!: 'active' | 'setup';
}

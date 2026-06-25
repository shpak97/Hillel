import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsValidTimezone } from 'src/common/validation/is-valid-timezone.decorator';
import { SUPPORTED_CURRENCIES } from 'src/common/validation/currency.constant';
import { SLUG_VALIDATION_MESSAGE } from 'src/common/validation/validation.messages';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: SLUG_VALIDATION_MESSAGE,
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsString()
  existingPhotos?: string;

  @IsOptional()
  @IsString()
  @IsValidTimezone()
  timezone?: string;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES)
  currency?: (typeof SUPPORTED_CURRENCIES)[number];
}

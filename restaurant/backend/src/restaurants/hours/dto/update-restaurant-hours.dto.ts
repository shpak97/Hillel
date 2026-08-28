import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { TIME_HH_MM_VALIDATION_MESSAGE } from 'src/common/validation/validation.messages';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TimeIntervalDto {
  @IsString()
  @Matches(TIME_PATTERN, { message: TIME_HH_MM_VALIDATION_MESSAGE })
  opensAt!: string;

  @IsString()
  @Matches(TIME_PATTERN, { message: TIME_HH_MM_VALIDATION_MESSAGE })
  closesAt!: string;
}

export class WeeklyDayHoursDto {
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => TimeIntervalDto)
  intervals!: TimeIntervalDto[];
}

export class HoursOverrideDto {
  @IsDateString()
  date!: string;

  @IsBoolean()
  isClosed!: boolean;

  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => TimeIntervalDto)
  intervals!: TimeIntervalDto[];
}

export class UpdateRestaurantHoursDto {
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => WeeklyDayHoursDto)
  weekly!: WeeklyDayHoursDto[];

  @IsArray()
  @ArrayMaxSize(365)
  @ValidateNested({ each: true })
  @Type(() => HoursOverrideDto)
  overrides!: HoursOverrideDto[];
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TimeIntervalResponseDto {
  @IsString()
  @IsNotEmpty()
  opensAt!: string;

  @IsString()
  @IsNotEmpty()
  closesAt!: string;
}

export class WeeklyDayHoursResponseDto {
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeIntervalResponseDto)
  intervals!: TimeIntervalResponseDto[];
}

export class HoursOverrideResponseDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsBoolean()
  isClosed!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeIntervalResponseDto)
  intervals!: TimeIntervalResponseDto[];
}

export class ResolvedDayHoursResponseDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsBoolean()
  isClosed!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeIntervalResponseDto)
  intervals!: TimeIntervalResponseDto[];

  @IsIn(['weekly', 'override'])
  source!: 'weekly' | 'override';

  @IsBoolean()
  isOpenNow!: boolean;
}

export class HoursResponseDto {
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyDayHoursResponseDto)
  weekly!: WeeklyDayHoursResponseDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoursOverrideResponseDto)
  overrides!: HoursOverrideResponseDto[];

  @ValidateNested()
  @Type(() => ResolvedDayHoursResponseDto)
  resolvedToday!: ResolvedDayHoursResponseDto;
}

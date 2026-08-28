import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const DOT_TYPES = [
  'dots',
  'rounded',
  'classy',
  'classy-rounded',
  'square',
  'extra-rounded',
] as const;

const CORNER_SQUARE_TYPES = [
  'dot',
  'square',
  'extra-rounded',
  ...DOT_TYPES,
] as const;

const CORNER_DOT_TYPES = ['dot', 'square', ...DOT_TYPES] as const;

export class QrGradientColorStopDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  offset!: number;

  @IsString()
  color!: string;
}

export class QrGradientDto {
  @IsIn(['linear', 'radial'])
  type!: 'linear' | 'radial';

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => QrGradientColorStopDto)
  colorStops!: QrGradientColorStopDto[];
}

export class QrDotsOptionsDto {
  @IsOptional()
  @IsIn(DOT_TYPES)
  type?: (typeof DOT_TYPES)[number];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrGradientDto)
  gradient?: QrGradientDto;

  @IsOptional()
  @IsBoolean()
  roundSize?: boolean;
}

export class QrCornersSquareOptionsDto {
  @IsOptional()
  @IsIn(CORNER_SQUARE_TYPES)
  type?: (typeof CORNER_SQUARE_TYPES)[number];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrGradientDto)
  gradient?: QrGradientDto;
}

export class QrCornersDotOptionsDto {
  @IsOptional()
  @IsIn(CORNER_DOT_TYPES)
  type?: (typeof CORNER_DOT_TYPES)[number];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrGradientDto)
  gradient?: QrGradientDto;
}

export class QrBackgroundOptionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  round?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrGradientDto)
  gradient?: QrGradientDto;
}

export class QrImageOptionsDto {
  @IsOptional()
  @IsBoolean()
  hideBackgroundDots?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(0.4)
  imageSize?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  margin?: number;
}

export class QrCodeOptionsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(40)
  typeNumber?: number;

  @IsOptional()
  @IsIn(['Numeric', 'Alphanumeric', 'Byte', 'Kanji'])
  mode?: 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';

  @IsOptional()
  @IsIn(['L', 'M', 'Q', 'H'])
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class RestaurantQrStyleDto {
  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(2048)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(64)
  @Max(2048)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(64)
  margin?: number;

  @IsOptional()
  @IsIn(['square', 'circle'])
  shape?: 'square' | 'circle';

  @IsOptional()
  @ValidateNested()
  @Type(() => QrCodeOptionsDto)
  qrOptions?: QrCodeOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrDotsOptionsDto)
  dotsOptions?: QrDotsOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrCornersSquareOptionsDto)
  cornersSquareOptions?: QrCornersSquareOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrCornersDotOptionsDto)
  cornersDotOptions?: QrCornersDotOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrBackgroundOptionsDto)
  backgroundOptions?: QrBackgroundOptionsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QrImageOptionsDto)
  imageOptions?: QrImageOptionsDto;
}

export class UpdateRestaurantQrStyleDto {
  @ValidateNested()
  @Type(() => RestaurantQrStyleDto)
  style!: RestaurantQrStyleDto;

  @IsOptional()
  @IsBoolean()
  removeLogo?: boolean;
}

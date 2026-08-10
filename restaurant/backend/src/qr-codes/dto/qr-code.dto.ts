import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class QrCodeMenuInputDto {
  @IsString()
  @MinLength(1)
  menuId!: string;

  @IsBoolean()
  selectTable!: boolean;
}

export class CreateQrCodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QrCodeMenuInputDto)
  menus!: QrCodeMenuInputDto[];
}

export class UpdateQrCodeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QrCodeMenuInputDto)
  menus?: QrCodeMenuInputDto[];
}

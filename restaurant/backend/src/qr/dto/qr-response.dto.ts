import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class QrResponseDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  pngDataUrl!: string;

  @IsString()
  @IsNotEmpty()
  svg!: string;
}

export class MenuQrResponseDto extends QrResponseDto {
  @IsBoolean()
  selectTable!: boolean;
}

export class TableQrResponseDto extends QrResponseDto {}

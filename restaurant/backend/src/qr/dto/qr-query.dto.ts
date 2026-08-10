import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { QR_FORMAT_JSON, QR_FORMATS, type QrFormat } from '../qr.constants';

function parseOptionalBoolean({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === '1' || value === 'true') {
    return true;
  }

  if (value === false || value === '0' || value === 'false') {
    return false;
  }

  return value;
}

export class QrFormatQueryDto {
  @IsOptional()
  @IsIn(QR_FORMATS)
  format: QrFormat = QR_FORMAT_JSON;
}

export class MenuQrQueryDto extends QrFormatQueryDto {
  @Transform(parseOptionalBoolean)
  @IsBoolean()
  selectTable!: boolean;
}

export class TableQrQueryDto extends QrFormatQueryDto {}

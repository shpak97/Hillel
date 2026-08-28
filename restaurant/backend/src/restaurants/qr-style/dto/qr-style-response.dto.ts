import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { RestaurantQrStyleDto } from './qr-style.dto';

export class RestaurantQrStyleResponseDto {
  @ValidateNested()
  @Type(() => RestaurantQrStyleDto)
  style!: RestaurantQrStyleDto;

  @IsOptional()
  @IsString()
  logo!: string | null;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateGuestOrderItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}

export class CreateGuestOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateGuestOrderItemDto)
  items!: CreateGuestOrderItemDto[];

  @IsOptional()
  @IsUUID()
  tableUuid?: string;
}

export class GuestOrderResponseDto {
  @IsUUID()
  orderUuid!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsNumber()
  totalAmount!: number;

  @IsString()
  @IsNotEmpty()
  pageUrl!: string;
}

export class GuestOrderStatusResponseDto {
  @IsUUID()
  orderUuid!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsNumber()
  totalAmount!: number;

  @IsOptional()
  @IsString()
  paidAt!: string | null;
}

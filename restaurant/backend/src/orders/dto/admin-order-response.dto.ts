import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class AdminOrderItemResponseDto {
  @IsInt()
  id!: number;

  @IsOptional()
  @IsUUID()
  menuItemId!: string | null;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  photo!: string | null;

  @IsNumber()
  unitPrice!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class AdminOrderTableResponseDto {
  @IsUUID()
  uuid!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;
}

export class AdminOrderResponseDto {
  @IsUUID()
  uuid!: string;

  @IsUUID()
  restaurantId!: string;

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
  monoInvoiceId!: string | null;

  @IsOptional()
  @IsString()
  monoPageUrl!: string | null;

  @IsOptional()
  @IsString()
  paidAt!: string | null;

  @IsString()
  @IsNotEmpty()
  createdAt!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminOrderTableResponseDto)
  table!: AdminOrderTableResponseDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminOrderItemResponseDto)
  items!: AdminOrderItemResponseDto[];
}

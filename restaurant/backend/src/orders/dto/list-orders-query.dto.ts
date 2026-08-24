import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';

function parseStatuses(value: unknown): OrderStatus[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const raw = Array.isArray(value) ? value.join(',') : String(value);
  const parts = raw
    .split(',')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  return parts as OrderStatus[];
}

export class ListOrdersQueryDto {
  /**
   * Comma-separated or repeated: PENDING,PAID,FAILED,CANCELLED
   */
  @IsOptional()
  @Transform(({ value }) => parseStatuses(value))
  @IsEnum(OrderStatus, { each: true })
  status?: OrderStatus[];
}

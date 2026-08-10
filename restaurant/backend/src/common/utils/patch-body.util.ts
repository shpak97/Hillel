import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { MeasureUnit } from '@prisma/client';
import { UpdateMenuItemDto } from 'src/menu-items/dto/menu-item.dto';
import { UpdateMenuDto } from 'src/menus/dto/menu.dto';
import { UpdateProductDto } from 'src/products/dto/product.dto';
import { parseMoneyInput } from 'src/common/utils/money.util';
import { parseOptionalBoolean } from './form-value.util';

export function isMultipartRequest(req: Pick<Request, 'headers'>): boolean {
  return (req.headers['content-type'] ?? '').includes('multipart/form-data');
}

function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .flatMap((error) => {
      const own = Object.values(error.constraints ?? {});
      if (own.length > 0) {
        return own;
      }
      if (error.children?.length) {
        const nested = formatValidationErrors(error.children);
        return nested ? [`${error.property}: ${nested}`] : [];
      }
      return [];
    })
    .filter(Boolean)
    .join('; ');
}

export function validateDto<T extends object>(
  cls: new () => T,
  body: unknown,
): T {
  const dto = plainToInstance(cls, body, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    throw new BadRequestException(formatValidationErrors(errors));
  }

  return dto;
}

export function resolvePhotoPatch(options: {
  removePhoto?: boolean | string;
  file?: Express.Multer.File;
  getPath: (filename: string) => string;
}): string | null | undefined {
  if (options.removePhoto === true || options.removePhoto === 'true') {
    return null;
  }

  if (options.file) {
    return options.getPath(options.file.filename);
  }

  return undefined;
}

export function parseUpdateProductDto(
  raw: Record<string, string>,
): UpdateProductDto {
  const isActive = parseOptionalBoolean(raw.isActive);

  return {
    ...(raw.name !== undefined ? { name: raw.name } : {}),
    ...(raw.description !== undefined ? { description: raw.description } : {}),
    ...(raw.baseUnit !== undefined
      ? { baseUnit: raw.baseUnit as MeasureUnit }
      : {}),
    ...(raw.basePrice !== undefined && raw.basePrice !== ''
      ? { basePrice: parseMoneyInput(raw.basePrice) }
      : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };
}

export function parseUpdateMenuItemDto(
  raw: Record<string, string>,
): UpdateMenuItemDto {
  const isActive = parseOptionalBoolean(raw.isActive);
  const priceOverride =
    raw.priceOverride !== undefined
      ? raw.priceOverride === ''
        ? null
        : parseMoneyInput(raw.priceOverride)
      : undefined;

  return {
    ...(raw.name !== undefined ? { name: raw.name } : {}),
    ...(raw.description !== undefined ? { description: raw.description } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    ...(priceOverride !== undefined ? { priceOverride } : {}),
  };
}

export function parseUpdateMenuDto(raw: Record<string, string>): UpdateMenuDto {
  const isActive = parseOptionalBoolean(raw.isActive);

  return {
    ...(raw.name !== undefined ? { name: raw.name } : {}),
    ...(raw.description !== undefined ? { description: raw.description } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };
}

export function stripRemovePhoto<T extends { removePhoto?: boolean }>(
  dto: T,
): Omit<T, 'removePhoto'> {
  const { removePhoto: _removePhoto, ...rest } = dto;
  return rest;
}

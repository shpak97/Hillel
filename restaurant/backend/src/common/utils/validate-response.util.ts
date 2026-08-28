import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';

function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .flatMap((error) => Object.values(error.constraints ?? {}))
    .join('; ');
}

export function validateResponseDto<T extends object>(
  cls: new () => T,
  data: unknown,
): T {
  const dto = plainToInstance(cls, data, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    throw new InternalServerErrorException(
      `Invalid response payload: ${formatValidationErrors(errors)}`,
    );
  }

  return dto;
}

export function validateResponseDtoList<T extends object>(
  cls: new () => T,
  data: unknown[],
): T[] {
  return data.map((item) => validateResponseDto(cls, item));
}

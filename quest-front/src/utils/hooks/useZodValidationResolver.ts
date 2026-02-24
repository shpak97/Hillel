import { useCallback } from 'react';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { z } from 'zod';

export function useZodValidationResolver<T extends z.ZodType<FieldValues>>(
  validationSchema: T
): Resolver<z.infer<T>> {
  return useCallback(
    async (data) => {
      const result = await (validationSchema as z.ZodType).safeParseAsync(data);

      if (result.success) {
        return { values: result.data as z.infer<T>, errors: {} };
      }

      const errors = result.error.issues.reduce<
        Record<string, { type: string; message: string }>
      >((acc, issue) => {
        const path = Array.isArray(issue.path)
          ? issue.path.join('.')
          : String(issue.path);
        acc[path] = {
          type: issue.code ?? 'validation',
          message: issue.message,
        };
        return acc;
      }, {});

      return { values: {} as z.infer<T>, errors } as ReturnType<Resolver<z.infer<T>>>;
    },
    [validationSchema]
  );
}

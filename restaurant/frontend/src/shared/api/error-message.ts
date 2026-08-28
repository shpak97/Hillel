export type ParsedApiError = {
  message: string;
  code?: string;
};

export function getErrorMessage(body: unknown, fallback: string): string {
  return parseApiError(body, fallback).message;
}

export function parseApiError(
  body: unknown,
  fallback: string,
): ParsedApiError {
  if (typeof body !== 'object' || body === null) {
    return { message: fallback };
  }

  const record = body as Record<string, unknown>;

  if (typeof record.code === 'string') {
    return {
      message: extractMessage(record.message, fallback),
      code: record.code,
    };
  }

  if (typeof record.message === 'object' && record.message !== null) {
    const nested = record.message as Record<string, unknown>;
    return {
      message: extractMessage(nested.message, fallback),
      code:
        typeof nested.code === 'string' ? nested.code : undefined,
    };
  }

  return {
    message: extractMessage(record.message, fallback),
  };
}

function extractMessage(value: unknown, fallback: string): string {
  if (Array.isArray(value)) {
    return value.map(String).join(', ');
  }

  if (typeof value === 'string') {
    return value;
  }

  return fallback;
}

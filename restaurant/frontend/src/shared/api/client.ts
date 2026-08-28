import { API_URL } from '@/shared/config/env';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiClientOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: unknown;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = undefined;
    }

    const message =
      typeof errorBody === 'object' &&
      errorBody !== null &&
      'message' in errorBody
        ? String((errorBody as { message: unknown }).message)
        : response.statusText || 'Request failed';

    throw new ApiError(response.status, message, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

import { API_URL } from '@/shared/config/env';
import { getAccessTokenFromCookies } from './auth-cookies';

type ServerFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export type ServerFetchResult<T> = {
  data: T | null;
  status: number;
  ok: boolean;
};

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<ServerFetchResult<T>> {
  const accessToken = await getAccessTokenFromCookies();

  if (!accessToken) {
    return { data: null, status: 401, ok: false };
  }

  const { headers, body, ...rest } = options;

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body,
      cache: 'no-store',
    });

    if (response.status === 204) {
      return { data: null, status: 204, ok: true };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : null;

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  } catch {
    return { data: null, status: 502, ok: false };
  }
}

import { API_URL } from '@/shared/config/env';

export async function refreshAccessTokenFromBackend(
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-access-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

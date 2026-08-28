import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshAccessTokenFromBackend } from '@/features/auth/api/refresh-access-token';
import { ApiError } from '@/shared/api/client';
import { parseApiError } from '@/shared/api/error-message';
import { AUTH_COOKIES, getAuthCookieOptions } from '@/shared/config/cookies';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIES.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { message: 'Refresh-токен відсутній', code: 'NO_REFRESH_TOKEN' },
      { status: 401 },
    );
  }

  try {
    const accessToken = await refreshAccessTokenFromBackend(refreshToken);

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Сесію завершено. Увійдіть знову.', code: 'REFRESH_FAILED' },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      AUTH_COOKIES.accessToken,
      accessToken,
      getAuthCookieOptions(60 * 60 * 24),
    );

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const parsed = parseApiError(error.body, 'Не вдалося оновити сесію');
      return NextResponse.json(parsed, { status: error.status });
    }

    return NextResponse.json(
      { message: 'Не вдалося оновити сесію' },
      { status: 500 },
    );
  }
}

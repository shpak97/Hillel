import { NextResponse } from 'next/server';
import { loginUser } from '@/features/auth/api/auth-api';
import { ApiError } from '@/shared/api/client';
import { parseApiError } from '@/shared/api/error-message';
import { AUTH_COOKIES, getAuthCookieOptions } from '@/shared/config/cookies';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tokens = await loginUser(body);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      AUTH_COOKIES.accessToken,
      tokens.accessToken,
      getAuthCookieOptions(60 * 60 * 24),
    );
    response.cookies.set(
      AUTH_COOKIES.refreshToken,
      tokens.refreshToken,
      getAuthCookieOptions(60 * 60 * 24 * 7),
    );

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const parsed = parseApiError(error.body, 'Не вдалося увійти');
      return NextResponse.json(parsed, { status: error.status });
    }

    return NextResponse.json(
      { message: 'Не вдалося увійти' },
      { status: 500 },
    );
  }
}

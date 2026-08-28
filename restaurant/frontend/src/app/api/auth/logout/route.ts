import { NextResponse } from 'next/server';
import { AUTH_COOKIES } from '@/shared/config/cookies';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIES.accessToken);
  response.cookies.delete(AUTH_COOKIES.refreshToken);
  return response;
}

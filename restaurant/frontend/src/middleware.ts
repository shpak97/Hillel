import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { refreshAccessTokenFromBackend } from '@/features/auth/api/refresh-access-token';
import { AUTH_COOKIES, getAuthCookieOptions } from '@/shared/config/cookies';
import { PUBLIC_ROUTES, ROUTES } from '@/shared/config/routes';
import { isJwtExpired } from '@/shared/lib/jwt';

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ROUTES.login;
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(AUTH_COOKIES.accessToken);
  response.cookies.delete(AUTH_COOKIES.refreshToken);
  return response;
}

function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set(
    AUTH_COOKIES.accessToken,
    accessToken,
    getAuthCookieOptions(60 * 60 * 24),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  let accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;

  const accessMissingOrExpired =
    !accessToken || isJwtExpired(accessToken);

  if (!isPublic && accessMissingOrExpired && refreshToken) {
    const newAccessToken = await refreshAccessTokenFromBackend(refreshToken);

    if (newAccessToken) {
      accessToken = newAccessToken;
      const response = NextResponse.next();
      setAccessTokenCookie(response, newAccessToken);
      return response;
    }

    return redirectToLogin(request);
  }

  if (!isPublic && accessMissingOrExpired) {
    return redirectToLogin(request);
  }

  if (
    accessToken &&
    !isJwtExpired(accessToken) &&
    (pathname === ROUTES.login || pathname === ROUTES.registration)
  ) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = ROUTES.home;
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

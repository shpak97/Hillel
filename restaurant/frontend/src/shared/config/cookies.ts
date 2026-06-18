export const AUTH_COOKIES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
} as const;

export function getAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/shared/config/cookies';

export async function getAccessTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

async function proxyPatch(uuid: string, action: 'deactivate' | 'activate') {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIES.accessToken)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}/${action}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося оновити статус ресторану' },
      { status: 502 },
    );
  }
}

export async function PATCH(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return proxyPatch(uuid, 'deactivate');
}

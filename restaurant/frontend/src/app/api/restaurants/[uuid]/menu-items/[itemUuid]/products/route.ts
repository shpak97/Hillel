import { NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/shared/api/auth-cookies';
import { API_URL } from '@/shared/config/env';

type RouteContext = {
  params: Promise<{ uuid: string; itemUuid: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid, itemUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/menu-items/${itemUuid}/products`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося оновити склад позиції' },
      { status: 502 },
    );
  }
}

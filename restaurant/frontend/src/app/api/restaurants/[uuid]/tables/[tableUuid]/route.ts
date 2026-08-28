import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';

type RouteContext = {
  params: Promise<{ uuid: string; tableUuid: string }>;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function GET(_request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid, tableUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/tables/${tableUuid}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося отримати столик' },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid, tableUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/tables/${tableUuid}`,
      {
        method: 'PATCH',
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
      { message: 'Не вдалося оновити столик' },
      { status: 502 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid, tableUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/tables/${tableUuid}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return new NextResponse(null, { status: response.status });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося видалити столик' },
      { status: 502 },
    );
  }
}

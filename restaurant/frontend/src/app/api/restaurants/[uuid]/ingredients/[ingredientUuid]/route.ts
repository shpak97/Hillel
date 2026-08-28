import { NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/shared/api/auth-cookies';
import { API_URL } from '@/shared/config/env';

type RouteContext = {
  params: Promise<{ uuid: string; ingredientUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid, ingredientUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/ingredients/${ingredientUuid}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося отримати інгредієнт' },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid, ingredientUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/ingredients/${ingredientUuid}`,
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
      { message: 'Не вдалося оновити інгредієнт' },
      { status: 502 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid, ingredientUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/ingredients/${ingredientUuid}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return new NextResponse(null, { status: response.status });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося видалити інгредієнт' },
      { status: 502 },
    );
  }
}

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function GET(_request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}/tables`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося отримати столики' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}/tables`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося створити столик' },
      { status: 502 },
    );
  }
}

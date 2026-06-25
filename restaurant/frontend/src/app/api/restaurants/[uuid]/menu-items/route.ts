import { NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/shared/api/auth-cookies';
import { API_URL } from '@/shared/config/env';

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

async function forwardFormData(
  url: string,
  accessToken: string,
  formData: FormData,
  method: 'POST' | 'PATCH',
) {
  const backendFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      backendFormData.append(key, value, value.name);
    } else {
      backendFormData.append(key, value);
    }
  }

  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body: backendFormData,
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function GET(_request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/restaurants/${uuid}/menu-items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося отримати позиції меню' },
      { status: 502 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      return forwardFormData(
        `${API_URL}/restaurants/${uuid}/menu-items`,
        accessToken,
        formData,
        'POST',
      );
    }

    const body = await request.json();
    const response = await fetch(`${API_URL}/restaurants/${uuid}/menu-items`, {
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
      { message: 'Не вдалося створити позицію' },
      { status: 502 },
    );
  }
}

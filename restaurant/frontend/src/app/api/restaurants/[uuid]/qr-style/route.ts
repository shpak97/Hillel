import { NextResponse } from 'next/server';
import { getAccessTokenFromCookies } from '@/shared/api/auth-cookies';
import { API_URL } from '@/shared/config/env';

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${API_URL}/restaurants/${uuid}/qr-style`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося отримати стиль QR' },
      { status: 502 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const accessToken = await getAccessTokenFromCookies();
  const { uuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') ?? '';
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    let body: BodyInit;

    if (contentType.includes('multipart/form-data')) {
      // Preserve original multipart boundary — re-wrapping FormData often breaks Nest/multer.
      headers['Content-Type'] = contentType;
      body = await request.arrayBuffer();
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(await request.json());
    }

    const response = await fetch(`${API_URL}/restaurants/${uuid}/qr-style`, {
      method: 'PUT',
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Не вдалося зберегти стиль QR' },
      { status: 502 },
    );
  }
}

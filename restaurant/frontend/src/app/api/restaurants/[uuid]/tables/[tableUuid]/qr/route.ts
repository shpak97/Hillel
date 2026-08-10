import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ uuid: string; tableUuid: string }>;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function GET(request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid, tableUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'json';

  const backendUrl = new URL(
    `${API_URL}/restaurants/${uuid}/tables/${tableUuid}/qr`,
  );
  backendUrl.searchParams.set('format', format);

  try {
    const response = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (format === 'png' || format === 'svg') {
      const body = await response.arrayBuffer();
      const headers = new Headers();
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');

      if (contentType) {
        headers.set('Content-Type', contentType);
      }
      if (contentDisposition) {
        headers.set('Content-Disposition', contentDisposition);
      }

      return new NextResponse(body, {
        status: response.status,
        headers,
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: 'Could not generate table QR code' },
      { status: 502 },
    );
  }
}

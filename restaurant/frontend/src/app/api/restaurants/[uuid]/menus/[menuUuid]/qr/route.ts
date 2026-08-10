import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/shared/config/env';
import { AUTH_COOKIES } from '@/shared/config/cookies';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ uuid: string; menuUuid: string }>;
};

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIES.accessToken)?.value;
}

export async function GET(request: Request, context: RouteContext) {
  const accessToken = await getAccessToken();
  const { uuid, menuUuid } = await context.params;

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'json';
  const selectTable = searchParams.get('selectTable') ?? '0';

  const backendUrl = new URL(
    `${API_URL}/restaurants/${uuid}/menus/${menuUuid}/qr`,
  );
  backendUrl.searchParams.set('format', format);
  backendUrl.searchParams.set('selectTable', selectTable);

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
      { message: 'Could not generate menu QR code' },
      { status: 502 },
    );
  }
}

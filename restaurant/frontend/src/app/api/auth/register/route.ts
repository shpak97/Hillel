import { NextResponse } from 'next/server';
import { registerUser } from '@/features/auth/api/auth-api';
import { ApiError } from '@/shared/api/client';
import { parseApiError } from '@/shared/api/error-message';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await registerUser(body);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      const parsed = parseApiError(error.body, 'Не вдалося зареєструватися');
      return NextResponse.json(parsed, { status: error.status });
    }

    return NextResponse.json(
      { message: 'Не вдалося зареєструватися' },
      { status: 500 },
    );
  }
}

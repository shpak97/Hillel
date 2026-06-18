import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/features/auth/api/auth-api';
import { ApiError } from '@/shared/api/client';
import { parseApiError } from '@/shared/api/error-message';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await sendVerificationEmail(body.email);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      const parsed = parseApiError(error.body, 'Не вдалося надіслати лист');
      return NextResponse.json(parsed, { status: error.status });
    }

    return NextResponse.json(
      { message: 'Не вдалося надіслати лист' },
      { status: 500 },
    );
  }
}

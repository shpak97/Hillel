import { apiClient } from '@/shared/api/client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@/features/auth/model/types';

export function registerUser(data: RegisterRequest) {
  return apiClient<void>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export function loginUser(data: LoginRequest) {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

export function verifyEmail(token: string) {
  return apiClient<{ ok: true }>(
    `/auth/email-verification/verify?token=${encodeURIComponent(token)}`,
  );
}

export function sendVerificationEmail(email: string) {
  return apiClient<{ message: string }>('/auth/email-verification/send', {
    method: 'POST',
    body: { email },
  });
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button, Input, FormAlert, InfoAlert } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { validateEmail, validatePassword } from '@/features/auth/lib/validation';
import { AuthFooterLink } from '@/features/auth/components/AuthPageLayout';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState('');
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setErrorCode(undefined);
    setResendMessage('');

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        const parsed = parseApiError(body, 'Не вдалося увійти');
        setFormError(parsed.message);
        setErrorCode(parsed.code);
        return;
      }

      router.push(ROUTES.home);
      router.refresh();
    } catch {
      setFormError('Не вдалося увійти. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setResendMessage('Спочатку введіть email.');
      return;
    }

    setResendMessage('');
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => undefined);
      const parsed = parseApiError(
        body,
        response.ok
          ? 'Лист надіслано, якщо акаунт існує.'
          : 'Не вдалося надіслати лист',
      );
      setResendMessage(parsed.message);
    } catch {
      setResendMessage('Не вдалося надіслати лист.');
    } finally {
      setIsResending(false);
    }
  }

  const showResendVerification = errorCode === 'EMAIL_NOT_VERIFIED';

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="owner@restaurant.ua"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />

      <Input
        label="Пароль"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Введіть пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        labelExtra={
          <Link
            href={ROUTES.forgotPassword}
            className="text-sm font-bold text-brand-700 transition hover:text-brand"
          >
            Забули пароль?
          </Link>
        }
      />

      {formError ? (
        <div className="space-y-3">
          <FormAlert>{formError}</FormAlert>
          {showResendVerification ? (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              disabled={isResending}
              onClick={handleResendVerification}
            >
              {isResending ? 'Надсилання...' : 'Надіслати лист підтвердження'}
            </Button>
          ) : null}
        </div>
      ) : null}

      {resendMessage ? <InfoAlert>{resendMessage}</InfoAlert> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Вхід...' : 'Увійти'}
      </Button>

      <AuthFooterLink
        prompt="Немає акаунту?"
        linkText="Зареєструватися"
        href={ROUTES.registration}
      />
    </form>
  );
}

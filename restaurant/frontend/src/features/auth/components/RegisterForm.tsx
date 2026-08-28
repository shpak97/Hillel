'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button, Input, FormAlert } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { validateEmail, validatePassword } from '@/features/auth/lib/validation';
import {
  AuthBadge,
  AuthFooterLink,
  AuthHero,
} from '@/features/auth/components/AuthPageLayout';

type RegisterFormProps = {
  onSuccessChange?: (success: boolean) => void;
};

export function RegisterForm({ onSuccessChange }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        const parsed = parseApiError(body, 'Не вдалося зареєструватися');
        setFormError(parsed.message);
        return;
      }

      setIsSuccess(true);
      onSuccessChange?.(true);
    } catch {
      setFormError('Не вдалося зареєструватися. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setResendMessage('');
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => undefined);
      if (!response.ok) {
        setResendMessage(
          parseApiError(body, 'Не вдалося надіслати лист').message,
        );
        return;
      }
      const parsed = parseApiError(
        body,
        'Лист надіслано, якщо акаунт існує.',
      );
      setResendMessage(parsed.message);
    } catch {
      setResendMessage('Не вдалося надіслати лист.');
    } finally {
      setIsResending(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-7 grid size-20 place-items-center rounded-[28px] bg-herb-50 text-4xl ring-1 ring-herb/10">
          ✉
        </div>
        <AuthHero
          centered
          badge={<AuthBadge tone="herb">Лист надіслано</AuthBadge>}
          title="Підтвердіть email"
          description={
            <>
              Ми надіслали лист на{' '}
              <strong className="font-black text-ink-950">{email}</strong>.
              Підтвердіть email, щоб увійти до кабінету.
            </>
          }
        />

        <div className="mt-8 space-y-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={isResending}
            onClick={handleResend}
          >
            {isResending ? 'Надсилання...' : 'Надіслати лист ще раз'}
          </Button>
          <Link
            href={ROUTES.login}
            className="inline-flex h-14 w-full items-center justify-center rounded-field bg-ink-950 px-5 text-[16px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-herb focus:outline-none focus:ring-4 focus:ring-herb/20"
          >
            Увійти
          </Link>
        </div>

        {resendMessage ? (
          <p className="mt-4 text-[14px] font-semibold text-ink-500">
            {resendMessage}
          </p>
        ) : null}

        <p className="mt-6 text-[14px] font-semibold leading-6 text-ink-500">
          Не бачите листа? Перевірте спам або правильність адреси.
        </p>
      </div>
    );
  }

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
        autoComplete="new-password"
        placeholder="8-20 символів"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint={
          errors.password
            ? undefined
            : 'Латинські літери верхнього та нижнього регістру і хоча б одна цифра.'
        }
      />

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <Button type="submit" variant="success" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
      </Button>

      <AuthFooterLink
        prompt="Вже є акаунт?"
        linkText="Увійти"
        href={ROUTES.login}
      />
    </form>
  );
}

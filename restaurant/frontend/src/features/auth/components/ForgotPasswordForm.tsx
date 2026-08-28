'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button, FormAlert, InfoAlert, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { validateEmail } from '@/features/auth/lib/validation';
import {
  AuthBadge,
  AuthFooterLink,
  AuthHero,
} from '@/features/auth/components/AuthPageLayout';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const nextError = validateEmail(email);
    setEmailError(nextError);
    if (nextError) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => undefined);
      const parsed = parseApiError(
        body,
        response.ok
          ? 'Якщо обліковий запис існує, лист для відновлення пароля буде надіслано.'
          : 'Не вдалося надіслати лист',
      );

      if (!response.ok) {
        setFormError(parsed.message);
        return;
      }

      setSuccessMessage(parsed.message);
    } catch {
      setFormError('Не вдалося надіслати лист. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="text-center">
        <AuthHero
          centered
          badge={<AuthBadge tone="herb">Лист надіслано</AuthBadge>}
          title="Перевірте пошту"
          description={successMessage}
        />
        <InfoAlert className="text-left">
          Якщо лист не зʼявився протягом кількох хвилин, перевірте папку «Спам».
        </InfoAlert>
        <div className="mt-8">
          <Link
            href={ROUTES.login}
            className="inline-flex h-14 w-full items-center justify-center rounded-field bg-ink-950 px-5 text-[16px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-herb focus:outline-none focus:ring-4 focus:ring-herb/20"
          >
            Повернутися до входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthHero
        badge={<AuthBadge tone="brand">Відновлення доступу</AuthBadge>}
        title="Забули пароль?"
        description="Введіть email акаунту — надішлемо посилання для встановлення нового пароля."
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="owner@restaurant.ua"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={emailError}
      />

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Надсилання...' : 'Надіслати лист'}
      </Button>

      <AuthFooterLink
        prompt="Згадали пароль?"
        linkText="Увійти"
        href={ROUTES.login}
      />
    </form>
  );
}

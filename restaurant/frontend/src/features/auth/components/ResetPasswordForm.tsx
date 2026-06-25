'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Button, FormAlert, Input } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { parseApiError } from '@/shared/api/error-message';
import { validatePassword } from '@/features/auth/lib/validation';
import {
  AuthBadge,
  AuthFooterLink,
  AuthHero,
} from '@/features/auth/components/AuthPageLayout';

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <AuthHero
          centered
          badge={<AuthBadge tone="danger">Токен відсутній</AuthBadge>}
          title="Невірне посилання"
          description="У посиланні немає токена для відновлення пароля."
        />
        <div className="mt-8">
          <Link
            href={ROUTES.forgotPassword}
            className="inline-flex h-14 w-full items-center justify-center rounded-field bg-ink-950 px-5 text-[16px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-herb focus:outline-none focus:ring-4 focus:ring-herb/20"
          >
            Запросити нове посилання
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <AuthHero
          centered
          badge={<AuthBadge tone="herb">Пароль змінено</AuthBadge>}
          title="Готово до входу"
          description="Новий пароль збережено. Усі попередні сесії завершено."
        />
        <div className="mt-8">
          <Link
            href={ROUTES.login}
            className="inline-flex h-14 w-full items-center justify-center rounded-field bg-ink-950 px-5 text-[16px] font-extrabold text-white shadow-[0_18px_38px_-22px_rgba(23,21,18,0.95)] transition hover:-translate-y-0.5 hover:bg-herb focus:outline-none focus:ring-4 focus:ring-herb/20"
          >
            Перейти до входу
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const nextErrors = {
      password: validatePassword(password),
      confirmPassword:
        password !== confirmPassword ? 'Паролі не збігаються' : undefined,
    };
    setErrors(nextErrors);

    if (nextErrors.password || nextErrors.confirmPassword) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        const parsed = parseApiError(body, 'Не вдалося змінити пароль');
        setFormError(parsed.message);
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError('Не вдалося змінити пароль. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <AuthHero
        badge={<AuthBadge tone="brand">Новий пароль</AuthBadge>}
        title="Встановіть пароль"
        description="Посилання дійсне 1 годину. Після зміни пароля потрібно увійти знову."
      />

      <Input
        label="Новий пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Введіть новий пароль"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
      />

      <Input
        label="Підтвердження пароля"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="Повторіть новий пароль"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        error={errors.confirmPassword}
      />

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Збереження...' : 'Зберегти пароль'}
      </Button>

      <AuthFooterLink
        prompt="Згадали пароль?"
        linkText="Увійти"
        href={ROUTES.login}
      />
    </form>
  );
}

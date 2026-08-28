'use client';

import { useState } from 'react';
import {
  AuthBadge,
  AuthHero,
  AuthPageLayout,
} from '@/features/auth/components/AuthPageLayout';
import {
  EmailSentAside,
  RegistrationAside,
} from '@/features/auth/components/RegistrationAside';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegistrationPage() {
  const [emailSent, setEmailSent] = useState(false);

  return (
    <AuthPageLayout
      activeTab="registration"
      background={emailSent ? 'email-sent' : 'registration'}
      aside={emailSent ? <EmailSentAside /> : <RegistrationAside />}
    >
      {!emailSent ? (
        <AuthHero
          badge={<AuthBadge tone="herb">Новий ресторан</AuthBadge>}
          title="Створіть акаунт"
          description="Після реєстрації ми надішлемо лист для підтвердження email."
        />
      ) : null}
      <RegisterForm onSuccessChange={setEmailSent} />
    </AuthPageLayout>
  );
}

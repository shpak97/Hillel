import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { LoginAside } from '@/features/auth/components/LoginAside';

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      activeTab="login"
      background="email-sent"
      aside={<LoginAside />}
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}

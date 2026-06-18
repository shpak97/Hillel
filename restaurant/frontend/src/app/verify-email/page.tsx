import { verifyEmail } from '@/features/auth/api/auth-api';
import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { VerifyEmailAside } from '@/features/auth/components/RegistrationAside';
import { VerifyEmailStatus } from '@/features/auth/components/VerifyEmailStatus';

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthPageLayout
        activeTab="login"
        background="verify"
        aside={<VerifyEmailAside />}
      >
        <VerifyEmailStatus status="missing" />
      </AuthPageLayout>
    );
  }

  try {
    await verifyEmail(token);
    return (
      <AuthPageLayout
        activeTab="login"
        background="verify"
        aside={<VerifyEmailAside />}
      >
        <VerifyEmailStatus status="success" />
      </AuthPageLayout>
    );
  } catch {
    return (
      <AuthPageLayout
        activeTab="login"
        background="error"
        aside={<VerifyEmailAside />}
      >
        <VerifyEmailStatus status="error" />
      </AuthPageLayout>
    );
  }
}

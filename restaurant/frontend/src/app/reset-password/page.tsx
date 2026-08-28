import { AuthPageLayout } from '@/features/auth/components/AuthPageLayout';
import { LoginAside } from '@/features/auth/components/LoginAside';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthPageLayout
      activeTab="login"
      background={token ? 'verify' : 'error'}
      aside={<LoginAside />}
    >
      <ResetPasswordForm token={token} />
    </AuthPageLayout>
  );
}

import {
  AuthBadge,
  AuthHero,
  AuthPageLayout,
} from '@/features/auth/components/AuthPageLayout';
import { LoginAside } from '@/features/auth/components/LoginAside';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <AuthPageLayout activeTab="login" background="login" aside={<LoginAside />}>
      <AuthHero
        badge={<AuthBadge tone="brand">Кабінет ресторану</AuthBadge>}
        title="Увійдіть до акаунту"
        description="Керуйте QR-меню, замовленнями та оплатами з одного робочого простору."
      />
      <LoginForm />
    </AuthPageLayout>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(ROUTES.login);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isLoading}
      onClick={handleLogout}
      className={cn('h-11 text-sm', className)}
    >
      {isLoading ? 'Вихід...' : 'Вийти'}
    </Button>
  );
}

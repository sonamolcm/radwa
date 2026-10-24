'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LoginPage } from '@/components/auth/LoginPage';
import { AuthUser } from '@/types/auth';

export default function NextLoginPage() {
  const router = useRouter();

  const handleLoginSuccess = (user: AuthUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_active_role', user.role);
    }
    router.push('/');
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

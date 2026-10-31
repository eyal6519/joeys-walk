'use client';

import type { ReactNode } from 'react';

import { Pwa } from '@/components/pwa';

import { AuthProvider } from './auth-provider';
import { ToastProvider } from './toast-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
      <Pwa />
    </ToastProvider>
  );
}

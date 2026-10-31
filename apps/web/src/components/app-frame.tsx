'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell } from './app-shell';

/**
 * Routes that render on their own, without the signed-in shell: sign-in,
 * onboarding, join and the offline fallback.
 */
const SHELL_FREE = ['/sign-in', '/onboarding', '/join', '/offline'];

/**
 * Applies the signed-in shell from the root layout rather than from each page.
 *
 * Layouts stay mounted across client-side navigation, so keeping `AppShell`
 * here means its household provider and Firestore subscriptions are built once
 * and survive tab switches. Wrapping each page individually (or using a route
 * group, whose "!<encoded>" output filenames Firebase Hosting answers with 404)
 * reintroduces a full reload on every navigation.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const bare = SHELL_FREE.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (bare) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}

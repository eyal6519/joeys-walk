import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';

/**
 * Shared shell for every signed-in screen.
 *
 * Because these routes share one layout, Next keeps it mounted while navigating
 * between them, so `AppShell`'s household provider and its Firestore
 * subscriptions survive a tab change instead of being torn down and recreated
 * on every tap (which re-read the household and flashed a loading gate).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

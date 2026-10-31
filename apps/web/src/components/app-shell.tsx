'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { HouseholdProvider, useHouseholdState } from '@/providers/household-provider';
import { useAuth } from '@/providers/auth-provider';

import { Button, cx, ErrorNote, Spinner } from './ui';

const NAV = [
  { href: '/', label: 'Today', icon: '🏠' },
  { href: '/history', label: 'History', icon: '📖' },
  { href: '/stats', label: 'Stats', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
] as const;

function GateRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <Spinner />;
}

function Gate({ children }: { children: ReactNode }) {
  const state = useHouseholdState();
  if (state.status === 'loading') return <Spinner label="Loading Joey's log" />;
  if (state.status === 'none') return <GateRedirect to="/onboarding" />;
  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <ErrorNote>{state.message}</ErrorNote>
        <Button variant="secondary" onClick={state.reset}>
          Choose a different household
        </Button>
      </div>
    );
  }
  return <>{children}</>;
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-2xl">
        {NAV.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs',
                  active ? 'font-semibold text-brand-strong' : 'text-ink-muted',
                )}
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Requires sign-in and an active household; renders the page inside the main layout. */
export function AppShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <SignedInOnly>
      <HouseholdProvider>
        <Gate>
          <main
            className={cx(
              'mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-8',
              hideNav ? 'pb-10' : 'pb-28',
            )}
          >
            {children}
          </main>
          {hideNav ? null : <BottomNav />}
        </Gate>
      </HouseholdProvider>
    </SignedInOnly>
  );
}

/** Requires sign-in only (used by onboarding and join, which run before a household exists). */
export function SignedInOnly({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  if (auth.status === 'loading') return <Spinner />;
  if (auth.status === 'signed-out') {
    const search = typeof window === 'undefined' ? '' : window.location.search;
    return <GateRedirect to={`/sign-in?next=${encodeURIComponent(pathname + search)}`} />;
  }
  return <>{children}</>;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { HouseholdProvider, useHouseholdState } from '@/providers/household-provider';
import { useAuth } from '@/providers/auth-provider';

import { ChartIcon, GearIcon, HomeIcon, LogbookIcon } from './icons';
import { Button, cx, ErrorNote, Spinner } from './ui';

const NAV = [
  { href: '/', label: 'Today', Icon: HomeIcon },
  { href: '/history', label: 'History', Icon: LogbookIcon },
  { href: '/stats', label: 'Stats', Icon: ChartIcon },
  { href: '/settings', label: 'Settings', Icon: GearIcon },
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_24px_-20px_rgb(36_28_21_/_0.5)]"
    >
      <ul className="mx-auto flex max-w-2xl">
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'group relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                  'transition-colors duration-150',
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink-soft',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-brand transition-opacity duration-150',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <Icon size={23} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Requires sign-in and an active household; renders the page inside the main layout. */
export function AppShell({ children }: { children: ReactNode }) {
  // The logging screens are focused tasks, so the bottom nav is hidden there.
  const hideNav = usePathname().startsWith('/log');
  return (
    <SignedInOnly>
      <HouseholdProvider>
        <Gate>
          <main
            className={cx(
              'mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-7',
              hideNav ? 'pb-12' : 'pb-28',
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

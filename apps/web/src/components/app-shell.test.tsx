import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthState } from '@/providers/auth-provider';
import type { HouseholdState } from '@/providers/household-provider';

import { AppShell } from './app-shell';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, back: vi.fn(), push: vi.fn() }),
  usePathname: () => '/history',
}));

vi.mock('@/providers/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/providers/household-provider', () => ({
  HouseholdProvider: ({ children }: { children: ReactNode }) => children,
  useHouseholdState: vi.fn(),
}));

const { useAuth } = await import('@/providers/auth-provider');
const { useHouseholdState } = await import('@/providers/household-provider');

const readyHousehold: HouseholdState = {
  status: 'ready',
  household: {
    id: 'h1',
    name: 'Home',
    ownerUid: 'u1',
    dogName: 'Joey',
    dogBreed: null,
    dogBirthDate: null,
  },
  members: [{ uid: 'u1', displayName: 'Eyal', role: 'owner' }],
  places: [],
  logs: [],
  actor: { uid: 'u1', name: 'Eyal' },
  isOwner: true,
};

beforeEach(() => {
  replace.mockReset();
  vi.mocked(useAuth).mockReset();
  vi.mocked(useHouseholdState).mockReset();
});

describe('AppShell gating', () => {
  it('redirects a signed-out visitor to sign-in, preserving the path', async () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'signed-out' } as AuthState);
    vi.mocked(useHouseholdState).mockReturnValue({ status: 'loading' });

    render(
      <AppShell>
        <p>secret</p>
      </AppShell>,
    );

    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/sign-in?next=${encodeURIComponent('/history')}`,
      ),
    );
  });

  it('sends someone without a household to onboarding', async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'signed-in',
      user: { uid: 'u1' },
      name: 'Eyal',
    } as unknown as AuthState);
    vi.mocked(useHouseholdState).mockReturnValue({ status: 'none' });

    render(
      <AppShell>
        <p>secret</p>
      </AppShell>,
    );

    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding'));
  });

  it('renders the page once the household is ready', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'signed-in',
      user: { uid: 'u1' },
      name: 'Eyal',
    } as unknown as AuthState);
    vi.mocked(useHouseholdState).mockReturnValue(readyHousehold);

    render(
      <AppShell>
        <p>secret</p>
      </AppShell>,
    );

    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

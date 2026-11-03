'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebase/client';
import { isPreview } from '@/lib/preview';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: User; name: string };

const AuthContext = createContext<AuthState>({ status: 'loading' });

/** A stand-in user so preview mode renders the app signed in with no account. */
const PREVIEW_USER = {
  uid: 'u-eyal',
  displayName: 'Eyal',
  email: 'eyal@preview.local',
} as unknown as User;

export function displayNameFor(user: User): string {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Someone';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() =>
    isPreview()
      ? { status: 'signed-in', user: PREVIEW_USER, name: 'Eyal' }
      : { status: 'loading' },
  );

  useEffect(() => {
    if (isPreview()) return;
    return onAuthStateChanged(getFirebaseAuth(), (user) =>
      setState(
        user
          ? { status: 'signed-in', user, name: displayNameFor(user) }
          : { status: 'signed-out' },
      ),
    );
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useSignedIn(): Extract<AuthState, { status: 'signed-in' }> {
  const state = useContext(AuthContext);
  if (state.status !== 'signed-in')
    throw new Error('useSignedIn called while signed out');
  return state;
}

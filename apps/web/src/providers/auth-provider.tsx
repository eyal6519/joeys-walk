'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { getFirebaseAuth } from '@/lib/firebase/client';

export type AuthState =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: User; name: string };

const AuthContext = createContext<AuthState>({ status: 'loading' });

export function displayNameFor(user: User): string {
  return user.displayName?.trim() || user.email?.split('@')[0] || 'Someone';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(
    () =>
      onAuthStateChanged(getFirebaseAuth(), (user) =>
        setState(
          user
            ? { status: 'signed-in', user, name: displayNameFor(user) }
            : { status: 'signed-out' },
        ),
      ),
    [],
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function useSignedIn(): Extract<AuthState, { status: 'signed-in' }> {
  const state = useContext(AuthContext);
  if (state.status !== 'signed-in') throw new Error('useSignedIn called while signed out');
  return state;
}

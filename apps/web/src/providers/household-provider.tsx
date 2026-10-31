'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Household, LogRecord, Member, Place } from '@walklogger/shared';

import {
  clearActiveHousehold,
  watchActiveHousehold,
  watchHousehold,
  watchMembers,
} from '@/lib/data/household';
import { watchLogs } from '@/lib/data/logs';
import { watchPlaces } from '@/lib/data/places';
import type { Actor } from '@/lib/data/refs';

import { useSignedIn } from './auth-provider';

export type HouseholdData = {
  household: Household;
  members: Member[];
  places: Place[];
  logs: LogRecord[];
  actor: Actor;
  isOwner: boolean;
};

export type HouseholdState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'error'; message: string; reset: () => void }
  | ({ status: 'ready' } & HouseholdData);

const HouseholdContext = createContext<HouseholdState>({ status: 'loading' });

export function useHouseholdState(): HouseholdState {
  return useContext(HouseholdContext);
}

/** For screens that only render once a household is loaded. */
export function useHousehold(): HouseholdData {
  const state = useContext(HouseholdContext);
  if (state.status !== 'ready')
    throw new Error('useHousehold called before the household is ready');
  return state;
}

function describe(error: Error): string {
  return /permission|insufficient/i.test(error.message)
    ? 'You do not have access to this household any more.'
    : error.message;
}

/** Watches which household is active for this user, then mounts its data subscriptions. */
export function HouseholdProvider({ children }: { children: ReactNode }) {
  const auth = useSignedIn();
  const [pointer, setPointer] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const actor = useMemo<Actor>(
    () => ({ uid: auth.user.uid, name: auth.name }),
    [auth.user.uid, auth.name],
  );

  useEffect(() => watchActiveHousehold(actor.uid, setPointer, setError), [actor.uid]);

  const reset = () => {
    setError(null);
    clearActiveHousehold(actor).catch((e: Error) => setError(e));
  };

  if (error) {
    return (
      <HouseholdContext.Provider
        value={{ status: 'error', message: describe(error), reset }}
      >
        {children}
      </HouseholdContext.Provider>
    );
  }
  if (pointer === undefined) {
    return (
      <HouseholdContext.Provider value={{ status: 'loading' }}>
        {children}
      </HouseholdContext.Provider>
    );
  }
  if (pointer === null) {
    return (
      <HouseholdContext.Provider value={{ status: 'none' }}>
        {children}
      </HouseholdContext.Provider>
    );
  }
  return (
    <HouseholdData key={pointer} hid={pointer} actor={actor} reset={reset}>
      {children}
    </HouseholdData>
  );
}

function HouseholdData({
  hid,
  actor,
  reset,
  children,
}: {
  hid: string;
  actor: Actor;
  reset: () => void;
  children: ReactNode;
}) {
  const [household, setHousehold] = useState<Household | null | undefined>(undefined);
  const [members, setMembers] = useState<Member[] | undefined>(undefined);
  const [places, setPlaces] = useState<Place[] | undefined>(undefined);
  const [logs, setLogs] = useState<LogRecord[] | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubs = [
      watchHousehold(hid, setHousehold, setError),
      watchMembers(hid, setMembers, setError),
      watchPlaces(hid, setPlaces, setError),
      watchLogs(hid, setLogs, setError),
    ];
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, [hid]);

  let value: HouseholdState;
  if (error) {
    value = { status: 'error', message: describe(error), reset };
  } else if (household === null) {
    value = { status: 'error', message: 'This household no longer exists.', reset };
  } else if (!household || !members || !places || !logs) {
    value = { status: 'loading' };
  } else {
    value = {
      status: 'ready',
      household,
      members,
      places,
      logs,
      actor,
      isOwner: members.some((m) => m.uid === actor.uid && m.role === 'owner'),
    };
  }
  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

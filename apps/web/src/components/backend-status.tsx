'use client';

import { useSyncExternalStore } from 'react';

import { getFirebaseApp, isEmulatorMode } from '@/lib/firebase/client';

type Status =
  | { state: 'checking' }
  | { state: 'ready'; projectId: string; appName: string }
  | { state: 'error'; message: string };

const CHECKING: Status = { state: 'checking' };
let cachedStatus: Status | undefined;

/** Initialises the SDK once in the browser; the result is cached so the snapshot is stable. */
function readStatus(): Status {
  if (cachedStatus) return cachedStatus;
  try {
    const app = getFirebaseApp();
    cachedStatus = {
      state: 'ready',
      projectId: app.options.projectId ?? 'unknown',
      appName: app.name,
    };
  } catch (error) {
    cachedStatus = {
      state: 'error',
      message: error instanceof Error ? error.message : 'Unknown initialisation error',
    };
  }
  return cachedStatus;
}

const subscribe = () => () => {};
const getServerSnapshot = () => CHECKING;

/**
 * Phase 0 acceptance check: proves the Firebase SDK actually initialises in the
 * browser with the config from `.env.local`.
 *
 * Real data fetching (Auth, Firestore listeners) arrives in phase 1. This exists
 * so a misconfigured environment is caught in the browser instead of surfacing
 * as a mysterious failure during a dog walk.
 */
export function BackendStatus() {
  // Server and first hydration render "checking"; the client then reads the real result.
  const status = useSyncExternalStore(subscribe, readStatus, getServerSnapshot);
  const emulators = isEmulatorMode();

  return (
    <section
      aria-labelledby="backend-heading"
      className="rounded-card border-line bg-surface-raised border p-5"
    >
      <h2 id="backend-heading" className="text-sm font-semibold tracking-wide uppercase">
        Backend connection
      </h2>

      <p
        role="status"
        aria-live="polite"
        className="text-ink-muted mt-3 text-sm leading-relaxed"
      >
        {status.state === 'checking' && 'Initialising the Firebase SDK…'}

        {status.state === 'ready' && (
          <>
            Connected to project{' '}
            <code className="text-ink font-mono text-xs">{status.projectId}</code> via app
            instance <code className="text-ink font-mono text-xs">{status.appName}</code>.
          </>
        )}

        {status.state === 'error' && (
          <span className="text-danger">{status.message}</span>
        )}
      </p>

      <p className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={
            emulators
              ? 'bg-brand-soft text-brand-strong rounded-full px-2 py-0.5 font-medium'
              : 'rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900'
          }
        >
          {emulators ? 'Emulator Suite' : 'Production data'}
        </span>
        <span className="text-ink-muted">
          {emulators
            ? 'Local development - nothing here touches real logs.'
            : 'WARNING: writes would hit the live Firestore database.'}
        </span>
      </p>
    </section>
  );
}

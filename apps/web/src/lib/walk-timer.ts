import { useSyncExternalStore } from 'react';

/**
 * The running walk timer lives in localStorage, not React state, so it survives
 * a reload, a backgrounded tab, or the phone killing the browser mid-walk.
 */
const KEY = 'walklogger.walkStartedAt';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): number | null {
  const raw = window.localStorage.getItem(KEY);
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : null;
}

export function startWalkTimer(): void {
  window.localStorage.setItem(KEY, String(Date.now()));
  emit();
}

export function clearWalkTimer(): void {
  window.localStorage.removeItem(KEY);
  emit();
}

/** Epoch ms when the current walk started, or null when no walk is running. */
export function useWalkTimerStart(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

import type { FirebaseOptions } from 'firebase/app';

/**
 * The raw Firebase web configuration, already resolved from the environment.
 *
 * Values are passed in explicitly rather than read from `process.env` inside
 * this module on purpose: Next.js performs a *textual* replacement of
 * `process.env.NEXT_PUBLIC_*` at build time. A dynamic lookup such as
 * `process.env[name]` is not statically analysable and would silently resolve
 * to `undefined` in the browser bundle. Every read therefore happens at the
 * call site in `client.ts`, where the identifiers are literal.
 */
export type FirebaseEnvConfig = {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId?: string | undefined;
};

const REQUIRED_KEYS: (keyof FirebaseEnvConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

/**
 * Validates and maps an environment-derived config onto `FirebaseOptions`.
 *
 * Throws rather than defaulting, because Firebase's own failure mode for a bad
 * config is a confusing runtime error deep inside the SDK. Failing loudly here
 * turns a misconfigured deploy into an obvious, immediate message.
 */
export function toFirebaseOptions(env: FirebaseEnvConfig): FirebaseOptions {
  const missing = REQUIRED_KEYS.filter((key) => {
    const value = env[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Firebase configuration is incomplete. Missing: ${missing.join(', ')}. ` +
        `Copy apps/web/.env.local.example to apps/web/.env.local and fill it in ` +
        `from Firebase console -> Project settings -> General -> Your apps.`,
    );
  }

  return {
    apiKey: env.apiKey,
    authDomain: env.authDomain,
    projectId: env.projectId,
    storageBucket: env.storageBucket,
    messagingSenderId: env.messagingSenderId,
    appId: env.appId,
    // Measurement ID is optional: Analytics simply stays disabled without it.
    ...(env.measurementId ? { measurementId: env.measurementId } : {}),
  };
}

/** True when the app should talk to the local Emulator Suite. */
export function shouldUseEmulators(flag: string | undefined): boolean {
  return flag === 'true';
}

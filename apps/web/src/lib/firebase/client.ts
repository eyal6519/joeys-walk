import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

import { toFirebaseOptions, shouldUseEmulators } from './config';

/**
 * Firebase singletons.
 *
 * Initialisation is lazy and idempotent so this module is safe to import from
 * both server components and client components. Nothing here runs until one of
 * the getters below is first called, which keeps the SDK out of the critical
 * path for pages that never touch the backend.
 */

const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORTS = { auth: 9099, firestore: 8080 } as const;

let appInstance: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let firestoreInstance: Firestore | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;

  // `getApps()` guards against re-initialising during HMR or a second import
  // of this module in a different bundle chunk.
  appInstance = getApps().length > 0 ? getApp() : initializeApp(readEnvOptions());
  return appInstance;
}

function readEnvOptions() {
  return toFirebaseOptions({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  });
}

export function isEmulatorMode(): boolean {
  return shouldUseEmulators(process.env.NEXT_PUBLIC_USE_EMULATORS);
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;

  const auth = getAuth(getFirebaseApp());
  if (isEmulatorMode()) {
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    });
  }
  authInstance = auth;
  return auth;
}

export function getDb(): Firestore {
  if (firestoreInstance) return firestoreInstance;

  // Offline persistence is a hard requirement: walks happen in parks with no
  // signal, and log entries must never be blocked by connectivity. The
  // multi-tab manager keeps several open tabs from fighting over one cache.
  const db = initializeFirestore(getFirebaseApp(), {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });

  if (isEmulatorMode()) {
    connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
  }
  firestoreInstance = db;
  return db;
}

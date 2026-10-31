import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { getFirebaseAuth } from './client';

const EMAIL_STORAGE_KEY = 'walklogger.emailForSignIn';

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(getFirebaseAuth(), provider);
}

/** Sends a passwordless sign-in link. The email is remembered to complete sign-in on this device. */
export async function sendEmailLink(email: string, returnPath: string): Promise<void> {
  const url = `${window.location.origin}${returnPath}`;
  await sendSignInLinkToEmail(getFirebaseAuth(), email, { url, handleCodeInApp: true });
  window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
}

export function isEmailLinkUrl(href: string): boolean {
  return isSignInWithEmailLink(getFirebaseAuth(), href);
}

export function getRememberedEmail(): string | null {
  return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

/** Completes link sign-in. Throws if the email is wrong or the link is expired or used. */
export async function completeEmailLinkSignIn(email: string, href: string): Promise<void> {
  await signInWithEmailLink(getFirebaseAuth(), email, href);
  window.localStorage.removeItem(EMAIL_STORAGE_KEY);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

/** Turns Firebase auth error codes into something a human can act on. */
export function describeAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow pop-ups and try again.';
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/expired-action-code':
      return 'That link has expired. Request a new one.';
    case 'auth/invalid-action-code':
      return 'That link is invalid or was already used. Request a new one.';
    case 'auth/network-request-failed':
      return 'No connection. Check your network and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled yet in the Firebase console.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for sign-in in the Firebase console.';
    default:
      return error instanceof Error ? error.message : 'Something went wrong. Try again.';
  }
}

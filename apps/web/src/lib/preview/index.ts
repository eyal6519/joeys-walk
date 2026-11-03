/**
 * Dev-only preview mode.
 *
 * When `NEXT_PUBLIC_PREVIEW=1` and the build is not a production build, the app
 * serves a seeded, in-memory household instead of talking to Firebase, so the UI
 * can be opened and driven with no account and no emulators. It is compiled out
 * of production builds by the `NODE_ENV` guard, so it can never ship.
 */
export function isPreview(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_PREVIEW === '1';
}

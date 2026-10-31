/*
 * WalkLogger service worker.
 *
 * Hand-written on purpose: this app is a Next.js static export on Firebase
 * Hosting, and a generated worker (Serwist) would need a webpack build or the
 * Turbopack route handler. Firestore data is already cached by the SDK's
 * persistent local cache, so this worker only has to keep the app shell
 * installable and available offline.
 *
 * Strategies:
 *   - navigations: network first, then the cached page, then the offline page.
 *   - same-origin static assets: network first, then the cached copy. The build
 *     does not content-hash chunk filenames, so a cached-first strategy would
 *     keep serving a stale stylesheet/bundle under an unchanged URL.
 *   - everything else (Firestore, Auth, Google APIs): untouched.
 */

const VERSION = 'v2';
const SHELL_CACHE = `walklogger-shell-${VERSION}`;
const ASSET_CACHE = `walklogger-assets-${VERSION}`;
const OFFLINE_URL = '/offline';

const SHELL = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually, so one missing entry cannot fail the whole install.
      await Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(networkFirstAsset(request));
  }
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match(OFFLINE_URL));
    return cached || Response.error();
  }
}

async function networkFirstAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || Response.error();
  }
}

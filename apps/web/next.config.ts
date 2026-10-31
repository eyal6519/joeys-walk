import type { NextConfig } from 'next';

/**
 * WalkLogger runs as a static export served by Firebase Hosting.
 *
 * Constraints that follow from `output: 'export'` and are deliberately honoured
 * here (see https://nextjs.org/docs/app/guides/static-exports):
 *
 *  - `rewrites`, `redirects` and `headers` are NOT supported in this file.
 *    All HTTP-level concerns (cache headers, clean URLs, SPA behaviour) live in
 *    `firebase.json` instead.
 *  - Image Optimization with the default loader needs a server, so it is off.
 *  - Route handlers only work when they are fully static (`dynamic =
 *    'force-static'` and no request-time APIs).
 *  - `cacheComponents` is intentionally NOT enabled: it requires the Node.js
 *    runtime and Partial Prerendering, neither of which exists in a static
 *    export. This app fetches everything client-side from Firebase.
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,

  // The workspace package ships raw TypeScript, so Next must compile it.
  transpilePackages: ['@walklogger/shared'],

  // Tailwind v4 is wired in through Turbopack's CSS loader rather than PostCSS.
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;

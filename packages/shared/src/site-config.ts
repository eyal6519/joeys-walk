/**
 * Single source of truth for product branding and PWA metadata.
 *
 * Renaming the app is a change here plus `apps/web/src/app/manifest.ts`, and
 * nothing else: no schema, storage or infrastructure is affected.
 */
export const siteConfig = {
  name: "Joey's Log",
  shortName: 'Joey',
  tagline: 'Every walk. Every business.',
  description:
    'Track Joey the toy poodle: walks, who took him, and every potty break in between.',
  dogName: 'Joey',
  dogBreed: 'Toy Poodle',
  themeColor: '#e8749b',
  backgroundColor: '#fff7f2',
  locale: 'en',
  startUrl: '/',
} as const;

export type SiteConfig = typeof siteConfig;

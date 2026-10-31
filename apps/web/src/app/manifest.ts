import type { MetadataRoute } from 'next';

import { siteConfig } from '@walklogger/shared';

/**
 * The PWA manifest, served at /manifest.webmanifest.
 *
 * This is a route handler, which a static export supports because it is
 * fully static: no request-time APIs are read, so Next renders it at build
 * time. Icons referenced here are added in phase 6 along with the service
 * worker; until then the app installs with a generated placeholder icon.
 */
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: siteConfig.startUrl,
    display: 'standalone',
    orientation: 'portrait',
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

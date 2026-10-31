#!/usr/bin/env node
/**
 * Fails fast when the Firebase client config is missing or still a placeholder.
 *
 * Deliberately dependency-free so it can run in CI before `npm install`, and as
 * a `prebuild` guard so a misconfigured build never produces a broken bundle
 * (a static export inlines these values at build time - a missing key would
 * silently ship `undefined` to every visitor).
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(repoRoot, 'apps/web/.env.local');

const REQUIRED = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

if (!existsSync(envPath)) {
  console.error(`\n✖ Missing apps/web/.env.local\n`);
  console.error(`  Create it from the template:\n`);
  console.error(`    cp apps/web/.env.local.example apps/web/.env.local\n`);
  process.exit(1);
}

/** Minimal .env parser: KEY=VALUE, ignores blanks and # comments. */
function parseEnv(contents) {
  const values = {};
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

const env = parseEnv(readFileSync(envPath, 'utf8'));
const missing = REQUIRED.filter((key) => !env[key]);

if (missing.length > 0) {
  console.error(
    `\n✖ Invalid apps/web/.env.local - ${missing.length} value(s) missing:\n`,
  );
  for (const key of missing) console.error(`    ${key}`);
  console.error(`\n  Fill them in from the Firebase console:\n`);
  console.error(`    Project settings -> General -> Your apps -> Web app -> Config\n`);
  process.exit(1);
}

const emulators = env.NEXT_PUBLIC_USE_EMULATORS === 'true';
console.log(
  `✔ Firebase config present for project "${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}"`,
);
console.log(
  emulators
    ? '  Backend target: local Emulator Suite (NEXT_PUBLIC_USE_EMULATORS=true)'
    : '  Backend target: PRODUCTION (NEXT_PUBLIC_USE_EMULATORS is not "true")',
);

# WalkLogger ("Joey's Log") - Handoff

Audience: another LLM/engineer continuing this work. Read this first, then `README.md`.

**Product:** PWA for logging a toy poodle's (Joey, 6 months) potty events. Two entry types:
- **walk**: who took him, when, duration, result (pee / poop / both / neither)
- **home** (found at home): result (pee / poop / both), place from a user-defined list OR free text

**Stack (versions pinned, verified on the registry):** Next.js 16.4.3 (App Router, `output: 'export'`, Turbopack), React 19.3.1, TypeScript 7.0.2, Tailwind 4.3.3 (via `@tailwindcss/turbopack`, no postcss), Firebase JS SDK 13.1.0 (Auth, Firestore), Zod 4.6.7, Recharts 3.10.1, Vitest 5.0.5, ESLint 10. npm workspaces monorepo. No custom API: **Firestore Security Rules are the trust boundary.**

Firebase project: `walklogger-c02fa` (web config is in gitignored `apps/web/.env.local`; template in `.env.local.example`). User asked for Firebase full-stack, industry-standard choices, Spark (free) plan.

## Layout
```
apps/web/src/app/          routes: / (dashboard), sign-in, onboarding, join, log, log/edit, history, stats, settings, offline, manifest.ts
apps/web/src/components/   app-shell (auth+household gate, bottom nav), log-form, form/ui primitives, charts, settings/*, pwa
apps/web/src/lib/data/     Firestore access: household, logs, places, refs
apps/web/src/lib/firebase/ client (lazy singletons, offline cache, emulator switch), auth, converters, config
apps/web/src/providers/    auth, household (live subscriptions), toast
apps/web/public/           sw.js (service worker), icons/*.png (generated)
packages/shared/           Zod domain, stats, formatting, siteConfig (+ vitest tests)
tests/rules/               Firestore rules tests (emulator)
scripts/                   check-env.mjs, generate-icons.mjs
firestore.rules  firestore.indexes.json  storage.rules (deny-all)  firebase.json  .firebaserc
```
Data model: `users/{uid}{householdId}`, `households/{hid}` -> `members/{uid}`, `places/{id}`, `logs/{id}`; `invites/{code}` (get-only, 192-bit code, <=7d TTL). Logs denormalise `walkerName`/`placeLabel`.

## Done (committed on `main`)
1. **Phase 0 scaffold**: monorepo, static export, Tailwind theme (dark mode), manifest route (`dynamic='force-static'` is REQUIRED for export), CI workflow, env check script.
2. **Shared domain** (`packages/shared`): Zod schemas, stats (daily buckets, longest gap, walker/place breakdown), formatters, unit tests.
3. **Firestore rules** + 30 emulator tests: default deny, membership, schema validation, server timestamps, invite join, ownership protection, and the full atomic onboarding batch.
4. **Data layer, auth** (Google popup + email magic link, safe `next` redirect), providers, UI primitives.
5. **Screens**: sign-in, onboarding, join, dashboard (walk timer persisted in localStorage), log create/edit/delete, history (filters), stats (charts), **settings**.
6. **Settings**: dog/household edit (owner), places CRUD + reorder + archive/restore, members list + owner remove + rename self, invite link (copy/share), sign out, leave household.
7. **PWA**: hand-written `apps/web/public/sw.js` (offline shell + stale-while-revalidate assets), `/offline` route, install prompt (`components/pwa.tsx`), generated icons (`scripts/generate-icons.mjs` → `public/icons`).
8. **Tests**: component tests for `LogForm` and `AppShell` gating; 66 unit tests total. CI runs a second job with Java 21 + `npm run test:rules`; `deploy.yml` (manual / version tags) ships hosting + rules.
9. Local tooling: Java 21 JRE at `~/.local/jre` (no sudo). Run emulator tests with `PATH=$HOME/.local/jre/bin:$PATH npm run test:rules`.
10. **One-command local run**: `npm start` (`scripts/run-local.mjs`) starts the Auth+Firestore emulators, waits for them, then `next dev`, and prints the URL. Local sign-in uses "Use a local test account" (`signInForLocalDemo`, emulator mode only). Children are spawned detached and killed by process group on Ctrl+C, so the Java emulator never orphans and holds port 8080. Plain-language steps are in `README.md` -> "Just want to use it?".

Verified at HEAD: `npm run format:check`, `lint`, `typecheck`, `test` (66), `build` (13 routes), `test:rules` (30) all pass.

## Known bug fixed
`createHousehold` writes household + owner member + default places + user pointer in one batch.
The `places` rule's `isMember(hid)` uses `exists()` (pre-batch state), so place writes used to be
**denied** and the whole onboarding batch failed. Fixed with `isMemberAfter(hid)` in
`firestore.rules`, which also accepts the founder's post-batch owner membership via
`existsAfter`/`getAfter`. Covered by a new rules test ("found a household with default places and
profile pointer in one batch").


## Still to build
- **App Check** (reCAPTCHA Enterprise) and API-key HTTP-referrer restriction. Needs console setup.
- **Cloud Functions** (optional, needs Blaze): weekly digest, "Joey hasn't been out" reminder.
- **Playwright E2E** against the emulators (auth + logging flow). The unit/component and rules
  layers are covered; end-to-end is the remaining test gap.
- The logs listener is capped at 1500 docs (`limit(1500)`), so History and Stats only see those. Revisit if needed.
- Stats `walkerBreakdown` ties are now broken by total minutes then name (was name only).

## Deployed state (2026-10-31)
- Live at **https://walklogger-c02fa.web.app** (hosting + firestore rules + indexes deployed).
  Verified: all routes/assets return 200, and the live JS is wired to `walklogger-c02fa` with no
  emulator host.
- Google sign-in: **enabled** (verified via `accounts:createAuthUri`).
- Email-link sign-in: **must be confirmed** in the console (Authentication -> Sign-in method ->
  Email link). No read-only API probe exists for it.
- Firebase Storage: **not set up**, and the app does not use it. `npm run deploy` / `deploy:rules`
  intentionally exclude `storage` so the deny-all rule in `storage.rules` (kept for the future) does
  not block a deploy. Set Storage up in the console only if photo uploads are added.
- Prod builds use `apps/web/.env.production.local` (`NEXT_PUBLIC_USE_EMULATORS=false`), which
  overrides the emulator setting in `.env.local`. Both files are gitignored.
- Redeploy everything with `npm run deploy`.

## Needs the user (an agent cannot do these)
1. Firebase console: confirm **Authentication -> Sign-in method -> Email link (passwordless)** is
   enabled. Google is already enabled; `localhost` and the hosting domains are authorised.
2. Restrict the browser API key to the hosting domains (Google Cloud console -> Credentials), and
   add App Check later.
3. If photo uploads are ever added, click "Get Started" under Storage in the Firebase console.

## Gotchas
- `NEXT_PUBLIC_*` reads must stay literal `process.env.X` (Next inlines them textually); see `lib/firebase/client.ts`.
- Static export: no `rewrites/redirects/headers` in `next.config.ts` (use `firebase.json`); no dynamic route segments for records (edit uses `/log/edit?id=`); `images.unoptimized`.
- The new React lint rules are active: no `Date.now()` in render (use `new Date().getTime()` inside a state initializer) and no synchronous `setState` in an effect body (derive initial state lazily instead).
- Writes are fire-and-forget by design (offline queue); failures surface through toasts.
- `npm run format:check` is enforced in CI and `.prettierrc.json` uses `printWidth: 90`; run `npm run format` before committing.
- The service worker is only registered in production (`process.env.NODE_ENV`), so `next dev` never serves a stale cache. `public/sw.js` is hand-written and not ignored by git even though `.gitignore` ignores `public/sw*` (that pattern is anchored to the repo root).
- `jsdom@30` warns it wants Node >=24.15 (machine has 24.14). `npm audit` flags firebase/firebase-tools transitive deps; the offered fix downgrades Firebase, so do not apply it.
- `apps/web/AGENTS.md` (generated) warns Next 16 differs from older knowledge; docs live in `node_modules/next/dist/docs/`.


# WalkLogger ("Joey's Log") - Handoff

Audience: another LLM/engineer continuing this work. Read this first, then `README.md`.

**Product:** PWA for logging a toy poodle's (Joey, 6 months) potty events. Two entry types:
- **walk**: who took him, when, duration, result (pee / poop / both / neither)
- **home** (found at home): result (pee / poop / both), place from a user-defined list OR free text

**Stack (versions pinned, verified on the registry):** Next.js 16.4.3 (App Router, `output: 'export'`, Turbopack), React 19.3.1, TypeScript 7.0.2, Tailwind 4.3.3 (via `@tailwindcss/turbopack`, no postcss), Firebase JS SDK 13.1.0 (Auth, Firestore), Zod 4.6.7, Recharts 3.10.1, Vitest 5.0.5, ESLint 10. npm workspaces monorepo. No custom API: **Firestore Security Rules are the trust boundary.**

Firebase project: `walklogger-c02fa` (web config is in gitignored `apps/web/.env.local`; template in `.env.local.example`). User asked for Firebase full-stack, industry-standard choices, Spark (free) plan.

## Layout
```
apps/web/src/app/          routes: / (dashboard), sign-in, onboarding, join, log, log/edit, history, stats, manifest.ts
apps/web/src/components/   app-shell (auth+household gate, bottom nav), log-form, form/ui primitives, charts
apps/web/src/lib/data/     Firestore access: household, logs, places, refs
apps/web/src/lib/firebase/ client (lazy singletons, offline cache, emulator switch), auth, converters, config
apps/web/src/providers/    auth, household (live subscriptions), toast
packages/shared/           Zod domain, stats, formatting, siteConfig (+ vitest tests)
tests/rules/               Firestore rules tests (emulator)
firestore.rules  firestore.indexes.json  storage.rules (deny-all)  firebase.json  .firebaserc
```
Data model: `users/{uid}{householdId}`, `households/{hid}` -> `members/{uid}`, `places/{id}`, `logs/{id}`; `invites/{code}` (get-only, 192-bit code, <=7d TTL). Logs denormalise `walkerName`/`placeLabel`.

## Done (committed on `main`)
1. **Phase 0 scaffold**: monorepo, static export, Tailwind theme (dark mode), manifest route (`dynamic='force-static'` is REQUIRED for export), CI workflow, env check script. Verified at that commit: typecheck, lint, 12 tests, build all passed.
2. **Shared domain** (`packages/shared`): Zod schemas, stats (daily buckets, longest gap, walker/place breakdown), formatters, unit tests (written, never run).
3. **Firestore rules** + 29 emulator tests (**ran and passed**): default deny, membership, schema validation, server timestamps, invite join, ownership protection.
4. **Data layer, auth** (Google popup + email magic link, safe `next` redirect), providers, UI primitives.
5. **Screens**: sign-in, onboarding, join, dashboard (walk timer persisted in localStorage), log create/edit/delete, history (filters), stats (charts).
6. Local tooling: Java 21 JRE at `~/.local/jre` (no sudo). Run emulator tests with `PATH=$HOME/.local/jre/bin:$PATH npm run test:rules`; launch detached (`setsid nohup ...`) or a shell hangup kills the emulator.

## NOT verified - run these first
After the rules tests, all later code (data layer, providers, every screen, shared tests) was written **without running typecheck, lint, unit tests or build**. Expect errors. From the repo root run:
`npm run typecheck && npm run lint && npm test && npm run build`
Likely trouble: the `LayoutProps` global did not type-check in Next 16 (layout uses an explicit `children` type); lint rules `react-hooks/set-state-in-effect` and `rules-of-hooks` (functions named `use*` that are not hooks) are active; static export needs `<Suspense>` around `useSearchParams`; `useNow`/`useWalkTimerStart` and provider code may trip the new React lint rules.

## Known bug to fix (high priority)
`createHousehold` (`lib/data/household.ts`) writes household + owner member + **default places** + user pointer in ONE batch. The `places` rule uses `isMember(hid)`, which relies on `exists()` (pre-batch state), so the place writes will be **denied** and the whole onboarding batch fails. The rules tests only covered household + member. Fix: add a batch-aware check (`existsAfter()`) for places create, or write places in a second batch after the first commits. Add a rules test for the full onboarding batch.

## Still to build
- **`/settings` page** (bottom nav links to it; the page does not exist): edit dog/household (`updateHousehold`), places CRUD + reorder + archive (`lib/data/places.ts` is ready), members list + remove (owner), rename self, **invite link** (`createInvite` then `${origin}/join?code=...`, copy/share), sign out (`lib/firebase/auth.signOut`), leave household.
- **PWA**: service worker (Serwist: `@serwist/turbopack` route handler needs `dynamic='force-static'`; fallbacks: `@serwist/next` with `next build --webpack`, or a hand-written sw), icons `/icons/icon-192.png` and `icon-512.png` (manifest references them; they are missing), install prompt, offline fallback page. Firestore offline persistence already works without a service worker.
- **App Check** (reCAPTCHA Enterprise) and API-key HTTP-referrer restriction.
- **Cloud Functions** (optional, needs Blaze): weekly digest, "Joey hasn't been out" reminder.
- **Tests**: component tests for log form and app-shell gating; Playwright E2E against emulators.
- **CI**: add Java + `npm run test:rules` job; add a `deploy.yml` for Hosting.
- Update `README.md` roadmap (still shows only phase 0 done). Remove the unused composite index in `firestore.indexes.json` (queries only use `orderBy('occurredAt')`).
- The logs listener is capped at 1500 docs (`limit(1500)`), so History and Stats only see those. Revisit if needed.

## Needs the user (an agent cannot do these)
1. Firebase console: enable **Authentication -> Google** and **Email link (passwordless)**; confirm `localhost` and the hosting domain are authorised domains.
2. Create the **Firestore database** (production mode, e.g. `europe-west1` or `me-west1`).
3. `npx firebase login`, then `npm run deploy:rules` and `npm run deploy:hosting`.
4. Restrict the browser API key to the hosting domains.

## Gotchas
- `NEXT_PUBLIC_*` reads must stay literal `process.env.X` (Next inlines them textually); see `lib/firebase/client.ts`.
- Static export: no `rewrites/redirects/headers` in `next.config.ts` (use `firebase.json`); no dynamic route segments for records (edit uses `/log/edit?id=`); `images.unoptimized`.
- Writes are fire-and-forget by design (offline queue); failures surface through toasts.
- `jsdom@30` warns it wants Node >=24.15 (machine has 24.14). `npm audit` flags firebase/firebase-tools transitive deps; the offered fix downgrades Firebase, so do not apply it.
- `apps/web/AGENTS.md` (generated) warns Next 16 differs from older knowledge; docs live in `node_modules/next/dist/docs/`.


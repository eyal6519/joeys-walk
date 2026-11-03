# AGENTS.md

"Joey's Log" — a Next.js static-export PWA for logging a toy poodle's walks and
potty events, on Firebase (Auth + Firestore). npm workspaces monorepo. Read
`HANDOFF.md` first for the fuller engineering state, then `README.md`.

## Backlog workflow (do this, always)

`BACKLOG.md` is the shared, local-only list of features and bugs. When the user
reports a bug or proposes a feature:

1. Add it to the correct section (Features or Bugs) in `BACKLOG.md`.
2. Rephrase it concisely and professionally; keep the user's intent intact.
3. Assign the next `#`, set status `open`, and stamp the captured date.
4. Do **not** design, plan, or implement it, and do not ask how — capture only.

`BACKLOG.md` is gitignored and must not be committed.

## Commands (run from the repo root)

| Task | Command |
| --- | --- |
| Everything local (emulators + app) | `npm start` → http://localhost:3000 |
| Dev server only | `npm run dev` |
| Design preview (no auth or Firebase) | `npm run preview` → http://localhost:3000 |
| Lint | `npm run lint` |
| Typecheck (all workspaces) | `npm run typecheck` |
| Unit/component tests | `npm test` |
| Firestore rules tests (needs Java) | `npm run test:rules` |
| Static export | `npm run build` |
| Format (write) | `npm run format` |
| Full verify order (what CI runs) | `check:env` → `format:check` → `lint` → `typecheck` → `test` → `build` |
| Deploy (hosting + rules + indexes) | `npm run deploy` |

- Single test file: `npx vitest run <path>` from the owning package, e.g.
  `npm test -w @walklogger/web -- src/components/log-form.test.tsx`.
- `npm run test:rules` runs via `firebase emulators:exec --only firestore`, so it
  starts and stops the emulator for you. On this machine Java is at
  `~/.local/jre`; if it is not found, prefix with
  `PATH=$HOME/.local/jre/bin:$PATH`.
- Always run `npm run format` before committing: `format:check` is enforced in CI
  and Prettier uses `printWidth: 90`.

## Monorepo layout

- `apps/web/` — the Next.js app (the only UI workspace). Routes in `src/app/`,
  shared UI in `src/components/`, Firestore access in `src/lib/data/`, Firebase
  SDK init in `src/lib/firebase/`, React context in `src/providers/`.
- `packages/shared/` — `@walklogger/shared`: Zod domain model, stats, formatters.
  Ships **raw TypeScript** (`exports` points at `src/index.ts`); Next compiles it
  via `transpilePackages` in `next.config.ts`. Do not add a build step for it.
- `tests/rules/` — Firestore security-rules tests, a separate workspace run
  against the emulator (its own `package.json` / vitest config).
- `apps/web/.env.local` is required for build/dev and is gitignored; `npm start`
  auto-creates it from `.env.local.example`. Run `npm run check:env` to validate.

## Hard constraints (easy to get wrong)

- **Static export.** `output: 'export'` in `next.config.ts`. No SSR, no server
  code, no `rewrites`/`redirects`/`headers` in Next config — those live in
  `firebase.json`. No dynamic route segments for records: detail pages are
  addressed by query string (e.g. `/log/edit?id=`). Route handlers must be
  `dynamic = 'force-static'` (required for `manifest.ts`).
- **No custom API layer.** Reads/writes go browser → Firestore, authorised by
  `firestore.rules`, which is the single trust boundary. Writes are
  fire-and-forget (offline queue); failures surface through toasts.
- **Offline is mandatory.** `persistentLocalCache` is enabled at startup; the
  hand-written `apps/web/public/sw.js` is only registered in production, so
  `next dev` never serves a stale cache.
- **`NEXT_PUBLIC_*` reads must be literal `process.env.X`** — Next inlines them
  textually. See `apps/web/src/lib/firebase/client.ts`.
- Tailwind v4 is wired through Turbopack's CSS loader (`@tailwindcss/turbopack`),
  not PostCSS. No `tailwind.config`; theme tokens live in
  `apps/web/src/app/globals.css`.
- React 19 lint rules are active: no `Date.now()` in render (use
  `new Date().getTime()` in a state initializer) and no synchronous `setState` in
  an effect body.

## Updating the app

- **PWA icons are generated**, not hand-drawn: `node scripts/generate-icons.mjs`
  (rasterises from the brand colour). Re-run it when the brand colour changes.
- Returning users may need a full close/reopen (or hard refresh) after a deploy
  because the service worker self-caches.
- Brand colour is defined in three places kept in sync:
  `apps/web/src/app/globals.css` (tokens, light `#a9713f` / dark `#c8935a`),
  `packages/shared/src/site-config.ts`, and `scripts/generate-icons.mjs`.
- Renaming the app is a change in `site-config.ts` plus
  `apps/web/src/app/manifest.ts` only.

## Testing notes

- Component tests run under jsdom via `apps/web/vitest.config.mts`; the `@` alias
  maps to `src/`. Vitest 5 transpiles `.tsx` from tsconfig's `jsx: react-jsx`, so
  no React plugin is needed.
- Rules tests run in `tests/rules/` under `environment: 'node'` with
  `fileParallelism: false` (shared emulator). They need Java and the emulator.
- `jsdom@30` warns it wants Node >=24.15 (machine has 24.14) — harmless.

## Files that regenerate themselves

- `apps/web/AGENTS.md` (Next.js version notes) is written and re-added by
  `next dev`; commit it with your work rather than deleting it from a diff.
- `.kilo/` (including worktrees) is gitignored and prettier-ignored.

## Environment

- CI (`.github/workflows/ci.yml`): `verify` job runs the full check chain with
  placeholder env; `rules` job needs JDK 21 for the emulator.
- `deploy.yml` deploys on manual dispatch or `v*` tags only, and needs the
  `FIREBASE_WEB_CONFIG` and `FIREBASE_SERVICE_ACCOUNT` secrets.
- Firebase project is `walklogger-c02fa`; live at
  https://walklogger-c02fa.web.app. Prod builds use
  `apps/web/.env.production.local` (`NEXT_PUBLIC_USE_EMULATORS=false`).
- Product truth lives in `PRODUCT.md`.

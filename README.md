# Joey's Log 🐩

Potty and walk tracking for a toy poodle, built on Firebase.

Every event is one of two things:

- **A walk** — who took Joey, when, and what he did (pee, poop, both, or neither).
- **A find at home** — what he did, and where, picked from your own list of places
  or typed freehand.

Plus the part that actually matters at the vet: counts per day, longest gap between
potty events, and a breakdown per caregiver.

---

## Just want to use it? (no setup, no account)

Everything runs on your own computer in "test mode" — nothing is sent anywhere and
no Firebase account is needed.

1. Open a terminal in this folder.
2. First time only, run: `npm install`
3. Then run: `npm start`
4. When it says the app is ready, open **http://localhost:3000**
5. On the sign-in screen, click **"Use a local test account"**.

That's it. To stop, go back to the terminal and press **Ctrl+C**.

Notes:

- Test data lives only on this computer and is cleared every time you stop with
  Ctrl+C, so it is safe to experiment.
- To use it for real — on your phone, synced, and shared with family — see
  **Publishing (for real use)** below, then use **Settings → Invite someone** to
  add the other caregivers.

### Publishing (for real use)

The app is already published at **https://walklogger-c02fa.web.app**. After any
code change, publish it with one command (requires `npx firebase login` once):

```bash
npm run deploy
```

This builds the app in production mode (talking to the real Firebase project, not
the local test backend) and uploads the app, security rules, and indexes.

Before sharing the link, make sure in the Firebase console that **Authentication →
Sign-in method** has both **Google** and **Email link (passwordless)** turned on.

---

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 16 (App Router, TypeScript, static export) |
| Styling | Tailwind CSS v4 |
| Backend | Firebase Auth, Cloud Firestore, Cloud Storage, Security Rules |
| Hosting | Firebase Hosting (static) |
| PWA | Manifest + hand-written service worker (offline shell, install prompt) |
| Tests | Vitest + Testing Library, Firebase Emulator Suite for rules |
| Tooling | ESLint 10 (flat config), Prettier, GitHub Actions |

There is intentionally **no custom API layer**. Reads and writes go straight from the
browser to Firestore and are authorised by Security Rules, which are the single trust
boundary. This removes a whole class of bugs (and a whole deployment target) at the cost
of doing more work in rules, which are tested against the emulator.

---

## Prerequisites

- **Node.js 22 or newer** (24 is what this was built on)
- **Java 17+** — only needed for the Firebase Emulator Suite
  (`sudo apt install -y default-jre-headless`). Nothing else requires it.

---

## Getting started

```bash
npm install
cp apps/web/.env.local.example apps/web/.env.local   # then fill in your Firebase config
npm run check:env                                    # fails fast if anything is missing
npm run dev
```

The app runs at http://localhost:3000 and, with
`NEXT_PUBLIC_USE_EMULATORS=true`, talks only to the local Emulator Suite.

Start the emulators in a second terminal:

```bash
npm run emulators   # Firestore :8080, Auth :9099, UI :4000
```

### Where to get the config values

Firebase console → **Project settings → General → Your apps → Web app → Config**.

These values are **not secrets**. Firebase web config is shipped to every visitor by
design; it is not a credential. What protects your data is Security Rules, plus App Check
(phase 6) and an API key restricted to your own domains. Never put a service account key
in `.env.local`.

---

## Scripts

Run from the repository root.

| Command | What it does |
| --- | --- |
| `npm start` | Run everything locally in test mode: emulators + app, one command (see above) |
| `npm run dev` | Next dev server (`apps/web`) |
| `npm run build` | Static export to `apps/web/out` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` across all workspaces |
| `npm test` | Vitest |
| `npm run check:env` | Validates `.env.local` before building |
| `npm run format` | Prettier write |
| `npm run emulators` | Firebase Emulator Suite |
| `npm run deploy:hosting` | Build then deploy to Firebase Hosting |

---

## Layout

```
apps/web/           Next.js PWA
  src/app/          routes (dashboard, log, history, stats, settings, ...), layout, manifest, styles
  src/components/   shared UI (app shell, forms, charts, settings sections)
  src/lib/data/     Firestore access (household, logs, places, refs)
  src/lib/firebase/ SDK initialisation and config mapping
  src/providers/    auth, household and toast context
  public/           service worker and generated PWA icons
packages/shared/    Zod domain model + stats + types (web, functions, rules tests)
scripts/            repo tooling (env check, icon generation)
firestore.rules     Security Rules - the trust boundary
firebase.json       Hosting, emulator and deployment configuration
```

---

## Notable decisions

- **Static export, not SSR.** Keeps the app on Firebase's free Spark plan and removes any
  server to operate. The cost is that `rewrites`, `redirects` and `headers` cannot be
  declared in `next.config.ts` — they live in `firebase.json` instead.
- **Offline writes are mandatory, not a nicety.** Firestore's persistent local cache is
  enabled at startup so logging a walk in a park with no signal works normally and syncs
  later.
- **Denormalised `walkerName` and `placeLabel`** are stored on each log so history stays
  readable after someone leaves the household or a place is renamed.
- **No dynamic route segments for records.** A static export cannot prerender unknown
  IDs, so record detail pages are addressed by query string instead.

---

## Roadmap

- [x] **Phase 0** — monorepo, Next.js static export, Firebase wiring, CI
- [x] **Phase 1** — Auth, onboarding, Joey's profile, default places
- [x] **Phase 2** — Firestore rules + emulator test suite, shared domain model
- [x] **Phase 3** — walk and home-find logging, dashboard
- [x] **Phase 4** — history, filters, stats
- [x] **Phase 5** — places management, household invites
- [x] **Phase 6** — PWA install, offline shell, icons, install prompt
- [ ] **Phase 6b** — App Check (reCAPTCHA Enterprise), key restrictions, accessibility pass
- [ ] **Phase 7** — Cloud Functions: digests and reminders
- [ ] **Phase 8** — deploy pipeline, docs

## PWA icons

`apps/web/public/icons/*.png` are generated, not hand-drawn:

```bash
node scripts/generate-icons.mjs
```

It rasterises a paw print on the brand colour and encodes the PNGs with Node's
zlib, so no image toolchain is required. Re-run it if the brand colour changes.

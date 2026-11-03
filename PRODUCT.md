# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The people who live with Joey — the primary caregiver and one or two family
members — plus occasional sitters and dog-walkers who do not live in the
household and are added through the invite link. All of them share one
household and one log. The app is used on a phone, often one-handed and
sometimes outdoors with no signal, at the exact moment something happens (or is
about to).

## Product Purpose

Joey's Log records a toy poodle's potty events so any caregiver can answer the
one question that matters in the moment: **when did he last go?** Every entry is
either a walk — who took him, when, how long, and the result — or a find at
home, with the place taken from the household's own list or typed freehand. The
app exists so that overlapping caregivers stop asking each other, and so the
record it quietly builds stays good enough to show at a vet visit. Success is
that the log is trusted and complete without anyone having to think about
maintaining it.

## Positioning

The gap between the last event and now, shared across every caregiver and
available offline. A group chat or a fridge note holds the log but not the
answer; a generic notes app holds an answer but only for the person who wrote
it. Joey's Log makes "when did he last go?" a fact any caregiver can read off
their own phone, in the park, with no signal — and keeps the numbers clean
enough to be evidence later.

## Operating Context

- Used at the moment of the event, on a phone, frequently one-handed and
  outdoors; logging must survive a dead zone and sync later.
- The walk timer is often started as someone is leaving and stopped when they
  get back, so it has to survive the phone being locked or the app backgrounded.
- Places come from the household's own names ("the back yard", "by the lift"),
  reordered over time, and can be archived without losing history.
- The household is small and fixed, but sitters join and leave through an invite
  link, so denormalised names on each entry are what keep old history readable.
- The vet visit is the moment the stats earn their keep: counts per day, longest
  gap between potty events, and a breakdown per caregiver.
- Local development runs entirely in test mode against the Firebase emulators
  (`npm start`); production is a static PWA on Firebase Hosting.

## Capabilities and Constraints

- Two entry types only: **walk** (walker, time, duration, result of pee / poop /
  both / neither) and **home find** (result plus a place from the list or free
  text).
- Single dog today. The domain model, copy, and brand are written for Joey and
  are not currently multi-dog.
- Static export (`output: 'export'`) is a hard constraint: no SSR, no server
  code, no dynamic route segments for records (detail views are addressed by
  query string), and `rewrites` / `redirects` / `headers` live in `firebase.json`
  rather than Next config.
- There is intentionally no custom API layer; Firestore Security Rules are the
  single trust boundary. Writes are fire-and-forget by design, queued offline,
  and surface failures through toasts.
- Offline is mandatory, not a nicety: the Firestore persistent local cache is
  enabled at startup, and a hand-written service worker serves the offline shell.
- The household, places, and log live in Firestore; Firebase Auth is Google
  popup plus email magic link. The app runs on Firebase's free Spark plan.
- The logs listener is capped at 1500 documents, so History and Stats only see
  those. This is a known limit, not a design intent.

## Brand Commitments

- Name: **Joey's Log** (short name "Joey"); the dog is Joey, a toy poodle, and
  the product is named after him.
- Brand palette is brown/tan, defined as CSS tokens in
  `apps/web/src/app/globals.css`, `packages/shared/src/site-config.ts`
  (`themeColor` / `backgroundColor`), and `scripts/generate-icons.mjs`. The
  light-mode brand is `#a9713f`, dark-mode `#c8935a`.
- Voice is light and specific to Joey — the emoji, the tagline "Every walk.
  Every business.", and the plain-language framing in the README are deliberate,
  not incidental. Future work preserves them.
- PWA icons are generated from the brand colour (`node scripts/generate-icons.mjs`).

## Evidence on Hand

Real product truth exists in the repository: `README.md`, `HANDOFF.md`, and the
live app at https://walklogger-c02fa.web.app. There are no testimonials,
customer logos, benchmarks, pricing, or press — nothing of the kind may be
fabricated for future surfaces.

## Product Principles

1. **Answer the question in one glance.** The gap since the last event is the
   product; every surface should make it readable instantly.
2. **Logging must never be blocked.** No signal, one hand, phone locked — the
   entry still lands and syncs later.
3. **One shared truth, many caregivers.** The same household, the same log, kept
   readable after people or places change.
4. **Honest and specific to Joey.** Plain, literal copy; no invented claims,
   metrics, or generic dog-app filler.
5. **Quietly accumulate evidence.** The record builds itself, so the vet visit
   needs no forethought.

## Accessibility & Inclusion

The app is used one-handed outdoors and in low-attention moments, so controls
must be large enough to hit without looking and text must stay legible in
daylight. A dedicated accessibility pass is planned (Phase 6b) but not yet
complete; future work should not assume the current UI meets WCAG AA.

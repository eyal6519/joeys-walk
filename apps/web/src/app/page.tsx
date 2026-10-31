import { siteConfig } from '@walklogger/shared';

import { BackendStatus } from '@/components/backend-status';

const ROADMAP = [
  {
    phase: 'Phase 1',
    title: 'Sign in & Joey\u2019s profile',
    detail:
      'Google or emailed magic link, then name the household and seed the default places.',
  },
  {
    phase: 'Phase 2',
    title: 'Security rules & domain model',
    detail: 'Household-scoped Firestore rules, validated against the emulator suite.',
  },
  {
    phase: 'Phase 3',
    title: 'Log a walk or a find',
    detail: 'Walk timer, who took him, pee/poop/both/neither, and home places as chips.',
  },
  {
    phase: 'Phase 4',
    title: 'History & stats',
    detail: 'Filterable timeline plus per-day counts, what your vet actually asks about.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <header className="flex flex-col gap-2">
        <span className="text-brand text-4xl" aria-hidden="true">
          🐩
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{siteConfig.name}</h1>
        <p className="text-ink-muted">{siteConfig.tagline}</p>
        <p className="text-ink-muted text-sm">{siteConfig.description}</p>
      </header>

      <BackendStatus />

      <section aria-labelledby="roadmap-heading" className="flex flex-col gap-3">
        <h2
          id="roadmap-heading"
          className="text-sm font-semibold tracking-wide uppercase"
        >
          What is coming next
        </h2>
        <ol className="flex flex-col gap-3">
          {ROADMAP.map((item) => (
            <li
              key={item.phase}
              className="rounded-card border-line bg-surface-raised flex flex-col gap-1 border p-4"
            >
              <span className="text-brand-strong text-xs font-semibold">
                {item.phase}
              </span>
              <span className="font-medium">{item.title}</span>
              <span className="text-ink-muted text-sm">{item.detail}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="text-ink-muted mt-auto text-xs">
        Scaffold complete: Next.js static export, Firebase, Tailwind and Vitest are wired
        up.
      </footer>
    </main>
  );
}

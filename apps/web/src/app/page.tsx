'use client';

import Link from 'next/link';

import { startOfDay } from '@walklogger/shared';

import { LogItem } from '@/components/log-item';
import { TodaySummary } from '@/components/today-summary';
import { WalkTimerCard } from '@/components/walk-timer-card';
import { PawIcon, PinIcon, PlusIcon } from '@/components/icons';
import { ActionTile, EmptyState, SectionHeading } from '@/components/ui';
import { useNow } from '@/lib/hooks/use-now';
import { useHousehold } from '@/providers/household-provider';

function Dashboard() {
  const { household, logs } = useHousehold();
  const now = useNow(30_000);
  const start = startOfDay(now);
  const today = logs.filter((log) => log.occurredAt >= start);

  return (
    <>
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-[0.9rem] bg-brand-strong text-on-brand shadow-card"
        >
          <PawIcon size={24} />
        </span>
        <div className="flex flex-col">
          <h1 className="font-display text-[22px] font-extrabold leading-none">
            Joey&rsquo;s Log
          </h1>
          <p className="text-[13px] font-medium text-ink-muted">{household.name}</p>
        </div>
      </header>

      <TodaySummary logs={logs} now={now} dogName={household.dogName} />

      <div className="flex flex-col gap-3">
        <ActionTile
          href="/log?type=home"
          icon={PinIcon}
          title="Found something at home"
          subtitle="Pee or poop, and where"
          tone="brand"
        />
        <WalkTimerCard />
      </div>

      <section aria-labelledby="today-heading" className="flex flex-col gap-3">
        <SectionHeading
          id="today-heading"
          action={
            <Link
              href="/log"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-strong hover:underline"
            >
              <PlusIcon size={16} />
              Add entry
            </Link>
          }
        >
          Today
        </SectionHeading>
        {today.length === 0 ? (
          <EmptyState
            title="Nothing logged today"
            hint="Start a walk or log something you found — it fills in from there."
          />
        ) : (
          <ul className="flex flex-col gap-2.5">
            {today.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function HomePage() {
  return <Dashboard />;
}

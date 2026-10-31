'use client';

import Link from 'next/link';

import { startOfDay } from '@walklogger/shared';

import { AppShell } from '@/components/app-shell';
import { LogItem } from '@/components/log-item';
import { TodaySummary } from '@/components/today-summary';
import { buttonClass, EmptyState, PageHeader } from '@/components/ui';
import { WalkTimerCard } from '@/components/walk-timer-card';
import { useNow } from '@/lib/hooks/use-now';
import { useHousehold } from '@/providers/household-provider';

function Dashboard() {
  const { household, logs } = useHousehold();
  const now = useNow(30_000);
  const start = startOfDay(now);
  const today = logs.filter((log) => log.occurredAt >= start);

  return (
    <>
      <PageHeader title={`${household.dogName}'s day 🐩`} subtitle={household.name} />
      <TodaySummary logs={logs} now={now} dogName={household.dogName} />
      <WalkTimerCard />
      <Link href="/log?type=home" className={buttonClass('secondary')}>
        🏠 Found something at home
      </Link>

      <section aria-labelledby="today-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="today-heading" className="text-sm font-semibold uppercase tracking-wide">
            Today
          </h2>
          <Link href="/log" className="text-sm font-medium text-brand-strong underline">
            Add entry
          </Link>
        </div>
        {today.length === 0 ? (
          <EmptyState title="Nothing logged today" hint="Start a walk or log something you found." />
        ) : (
          <ul className="flex flex-col gap-2">
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
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

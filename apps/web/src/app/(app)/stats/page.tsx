'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

import {
  dailyBuckets,
  formatSpan,
  longestGapMs,
  placeBreakdown,
  summarize,
  walkerBreakdown,
} from '@walklogger/shared';

import { Card, cx, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { useHousehold } from '@/providers/household-provider';

// Recharts is heavy and only needed here, so it is loaded on demand.
const DailyPottyChart = dynamic(
  () => import('@/components/stats-charts').then((m) => m.DailyPottyChart),
  { ssr: false, loading: () => <Spinner label="Loading chart" /> },
);

const RANGES = [7, 30, 90] as const;

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </Card>
  );
}

function Stats() {
  const { logs, household } = useHousehold();
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);

  const data = useMemo(() => {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
    const inRange = logs.filter((l) => l.occurredAt >= since);
    const gap = longestGapMs(inRange);
    return {
      summary: summarize(inRange),
      buckets: dailyBuckets(inRange, days, now),
      walkers: walkerBreakdown(inRange),
      places: placeBreakdown(inRange),
      gap: gap === null ? '–' : formatSpan(gap),
      count: inRange.length,
    };
  }, [logs, days]);

  return (
    <>
      <PageHeader title="Stats" subtitle={`How ${household.dogName} has been doing`} />

      <div role="group" aria-label="Period" className="grid grid-cols-3 gap-2">
        {RANGES.map((range) => (
          <button
            key={range}
            type="button"
            aria-pressed={days === range}
            onClick={() => setDays(range)}
            className={cx(
              'min-h-11 rounded-xl border font-medium',
              days === range
                ? 'border-brand-strong bg-brand-soft text-brand-strong'
                : 'border-line bg-surface-raised',
            )}
          >
            {range} days
          </button>
        ))}
      </div>

      {data.count === 0 ? (
        <EmptyState
          title="No data in this period"
          hint="Log a walk or a find and it will show up here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Tile label="Walks" value={String(data.summary.walks)} />
            <Tile label="Found at home" value={String(data.summary.homeFinds)} />
            <Tile label="Pee" value={String(data.summary.pee)} />
            <Tile label="Poop" value={String(data.summary.poop)} />
            <Tile label="Avg poops / day" value={(data.summary.poop / days).toFixed(1)} />
            <Tile label="Longest gap" value={data.gap} />
          </div>

          <Card>
            <h2 className="mb-3 text-sm font-semibold">Potty events per day</h2>
            <DailyPottyChart buckets={data.buckets} />
          </Card>

          {data.walkers.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold">
                Who walks {household.dogName}
              </h2>
              <ul className="flex flex-col gap-2">
                {data.walkers.map((w) => (
                  <li key={w.name} className="flex justify-between text-sm">
                    <span>{w.name}</span>
                    <span className="text-ink-muted">
                      {w.walks} {w.walks === 1 ? 'walk' : 'walks'}
                      {w.totalMin > 0 ? ` · ${formatSpan(w.totalMin * 60_000)}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.places.length > 0 && (
            <Card>
              <h2 className="mb-3 text-sm font-semibold">Where he goes indoors</h2>
              <ul className="flex flex-col gap-2">
                {data.places.map((p) => (
                  <li key={p.label} className="flex justify-between text-sm">
                    <span>{p.label}</span>
                    <span className="text-ink-muted">{p.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </>
  );
}

export default function StatsPage() {
  return <Stats />;
}

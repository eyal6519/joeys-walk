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

import { Card, EmptyState, PageHeader, Segmented, Spinner } from '@/components/ui';
import { useHousehold } from '@/providers/household-provider';

// Recharts is heavy and only needed here, so it is loaded on demand.
const DailyPottyChart = dynamic(
  () => import('@/components/stats-charts').then((m) => m.DailyPottyChart),
  { ssr: false, loading: () => <Spinner label="Loading chart" /> },
);

const RANGES = [7, 30, 90] as const;

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-line bg-surface-raised p-4 shadow-card">
      <span className="font-display text-[28px] font-extrabold leading-none tabular-nums">
        {value}
      </span>
      <span className="text-xs font-semibold text-ink-muted">{label}</span>
    </div>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <Card>
      <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        {title}
      </h2>
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between border-t border-line py-2.5 first:border-t-0 first:pt-0"
          >
            <span className="font-semibold">{row.label}</span>
            <span className="text-sm font-medium text-ink-muted tabular-nums">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
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

      <Segmented
        label="Period"
        value={String(days)}
        onChange={(v) => setDays(Number(v) as (typeof RANGES)[number])}
        options={RANGES.map((range) => ({
          value: String(range),
          label: `${range} days`,
        }))}
      />

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
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              Potty events per day
            </h2>
            <DailyPottyChart buckets={data.buckets} />
          </Card>

          {data.walkers.length > 0 && (
            <Breakdown
              title={`Who walks ${household.dogName}`}
              rows={data.walkers.map((w) => ({
                label: w.name,
                value: `${w.walks} ${w.walks === 1 ? 'walk' : 'walks'}${
                  w.totalMin > 0 ? ` · ${formatSpan(w.totalMin * 60_000)}` : ''
                }`,
              }))}
            />
          )}

          {data.places.length > 0 && (
            <Breakdown
              title="Where he goes indoors"
              rows={data.places.map((p) => ({ label: p.label, value: String(p.count) }))}
            />
          )}
        </>
      )}
    </>
  );
}

export default function StatsPage() {
  return <Stats />;
}

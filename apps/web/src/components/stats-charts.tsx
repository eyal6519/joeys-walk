'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { DayBucket } from '@walklogger/shared';

import { formatShortDate } from '@/lib/utils/datetime';

/** Chart colours are CSS variables so dark mode needs no extra work. */
const PEE = 'var(--color-pee)';
const POOP = 'var(--color-poop)';

export function DailyPottyChart({ buckets }: { buckets: DayBucket[] }) {
  const data = buckets.map((b) => ({
    day: formatShortDate(b.date),
    Pee: b.pee,
    Poop: b.poop,
  }));
  const total = buckets.reduce((sum, b) => sum + b.pee + b.poop, 0);

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="sr-only">
        Daily pee and poop counts. {total} potty events in this period.
      </figcaption>
      <div className="h-56 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--color-ink-muted)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-line)',
                borderRadius: 12,
                color: 'var(--color-ink)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Pee" stackId="a" fill={PEE} radius={[0, 0, 0, 0]} />
            <Bar dataKey="Poop" stackId="a" fill={POOP} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Daily potty events</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Pee</th>
            <th scope="col">Poop</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.day}>
              <th scope="row">{row.day}</th>
              <td>{row.Pee}</td>
              <td>{row.Poop}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

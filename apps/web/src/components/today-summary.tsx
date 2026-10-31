import {
  formatAgo,
  lastPottyAt,
  startOfDay,
  summarize,
  type LogRecord,
} from '@walklogger/shared';

import { Card } from './ui';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-ink-muted">{label}</span>
    </div>
  );
}

export function TodaySummary({
  logs,
  now,
  dogName,
}: {
  logs: LogRecord[];
  now: Date;
  dogName: string;
}) {
  const start = startOfDay(now);
  const today = logs.filter((log) => log.occurredAt >= start);
  const summary = summarize(today);
  const last = lastPottyAt(logs);

  return (
    <Card className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        {last ? (
          <>
            Last potty break: <strong className="text-ink">{formatAgo(last, now)}</strong>
          </>
        ) : (
          `No potty breaks logged for ${dogName} yet.`
        )}
      </p>
      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Today">
        <Stat value={summary.walks} label="Walks" />
        <Stat value={summary.pee} label="Pee" />
        <Stat value={summary.poop} label="Poop" />
        <Stat value={summary.homeFinds} label="At home" />
      </div>
    </Card>
  );
}

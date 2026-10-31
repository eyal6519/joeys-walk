'use client';

import { useMemo, useState } from 'react';

import { AppShell } from '@/components/app-shell';
import { LogItem } from '@/components/log-item';
import { EmptyState, PageHeader, cx, inputClass } from '@/components/ui';
import {
  applyFilter,
  DEFAULT_FILTER,
  groupByDay,
  type HistoryFilter,
} from '@/lib/history-filter';
import { formatDayHeading } from '@/lib/utils/datetime';
import { useHousehold } from '@/providers/household-provider';

const PAGE = 40;

function History() {
  const { logs, members } = useHousehold();
  const [filter, setFilter] = useState<HistoryFilter>(DEFAULT_FILTER);
  const [shown, setShown] = useState(PAGE);
  const now = new Date();

  const filtered = useMemo(() => applyFilter(logs, filter, new Date()), [logs, filter]);
  const groups = useMemo(() => groupByDay(filtered.slice(0, shown)), [filtered, shown]);

  function update(patch: Partial<HistoryFilter>) {
    setFilter((current) => ({ ...current, ...patch }));
    setShown(PAGE);
  }

  return (
    <>
      <PageHeader
        title="History"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'entry' : 'entries'}`}
      />

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Type
          <select
            className={cx(inputClass, 'text-sm')}
            value={filter.type}
            onChange={(e) => update({ type: e.target.value as HistoryFilter['type'] })}
          >
            <option value="all">All</option>
            <option value="walk">Walks</option>
            <option value="home">At home</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Who
          <select
            className={cx(inputClass, 'text-sm')}
            value={filter.person}
            onChange={(e) => update({ person: e.target.value })}
          >
            <option value="all">Everyone</option>
            {members.map((m) => (
              <option key={m.uid} value={m.uid}>
                {m.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Period
          <select
            className={cx(inputClass, 'text-sm')}
            value={filter.days}
            onChange={(e) =>
              update({ days: Number(e.target.value) as HistoryFilter['days'] })
            }
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={0}>All time</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No entries match"
          hint="Try a longer period or clear the filters."
        />
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section
              key={group.key}
              aria-label={formatDayHeading(group.date, now)}
              className="flex flex-col gap-2"
            >
              <h2 className="text-sm font-semibold text-ink-muted">
                {formatDayHeading(group.date, now)}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.logs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </ul>
            </section>
          ))}
          {shown < filtered.length && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="min-h-11 rounded-xl border border-line bg-surface-raised font-medium"
            >
              Show more
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default function HistoryPage() {
  return (
    <AppShell>
      <History />
    </AppShell>
  );
}

'use client';

import { useMemo, useState } from 'react';

import { LogItem } from '@/components/log-item';
import { Button, EmptyState, PageHeader, cx, inputClass } from '@/components/ui';
import {
  applyFilter,
  DEFAULT_FILTER,
  groupByDay,
  type HistoryFilter,
} from '@/lib/history-filter';
import { formatDayHeading } from '@/lib/utils/datetime';
import { useHousehold } from '@/providers/household-provider';

const PAGE = 40;

function Filter({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </span>
      <select
        className={cx(inputClass, 'text-sm font-semibold')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

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

      <div className="grid grid-cols-3 gap-2.5">
        <Filter
          label="Type"
          value={filter.type}
          onChange={(v) => update({ type: v as HistoryFilter['type'] })}
        >
          <option value="all">All</option>
          <option value="walk">Walks</option>
          <option value="home">At home</option>
        </Filter>
        <Filter label="Who" value={filter.person} onChange={(v) => update({ person: v })}>
          <option value="all">Everyone</option>
          {members.map((m) => (
            <option key={m.uid} value={m.uid}>
              {m.displayName}
            </option>
          ))}
        </Filter>
        <Filter
          label="Period"
          value={filter.days}
          onChange={(v) => update({ days: Number(v) as HistoryFilter['days'] })}
        >
          <option value={7}>7 days</option>
          <option value={30}>30 days</option>
          <option value={90}>90 days</option>
          <option value={0}>All time</option>
        </Filter>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No entries match"
          hint="Try a longer period or clear the filters."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section
              key={group.key}
              aria-label={formatDayHeading(group.date, now)}
              className="flex flex-col gap-3"
            >
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                {formatDayHeading(group.date, now)}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.logs.map((log) => (
                  <LogItem key={log.id} log={log} />
                ))}
              </ul>
            </section>
          ))}
          {shown < filtered.length && (
            <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
              Show more
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default function HistoryPage() {
  return <History />;
}

'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';

import { formatAgo, startOfDay, summarize, type LogRecord } from '@walklogger/shared';

import { PeeIcon, PoopIcon, SunRiseIcon, WalkIcon, XIcon } from './icons';
import {
  describeLast,
  describePotty,
  lastPottyLog,
  POTTY_ICON,
  POTTY_TONE,
  pottyKey,
} from './potty';
import { cx } from './ui';
import { formatTime } from '@/lib/utils/datetime';

/** A compact "2h 14m" style interval for the hero. */
function heroInterval(ms: number): { h: number; m: number } {
  const totalMin = Math.max(0, Math.round(ms / 60_000));
  return { h: Math.floor(totalMin / 60), m: totalMin % 60 };
}

function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * The day drawn as a single rule: every event a tick at its time, the gap since
 * the last one carried in brand, and "now" as a live cursor. A walk is a light
 * marker, a find spotted at home is the red marker; tapping one reveals its
 * essential details without leaving the day.
 */
function DayRule({
  events,
  lastAt,
  now,
  selectedId,
  onSelect,
}: {
  events: LogRecord[];
  lastAt: Date | null;
  now: Date;
  selectedId: string | null;
  onSelect: (log: LogRecord) => void;
}) {
  const nowPct = (minuteOfDay(now) / 1440) * 100;
  const dayStart = startOfDay(now).getTime();
  const gapStart =
    lastAt && lastAt.getTime() >= dayStart ? (minuteOfDay(lastAt) / 1440) * 100 : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-11">
        <div className="pointer-events-none absolute inset-x-0 bottom-2 h-px bg-line-strong" />
        {/* the gap since the last event, carried in brand */}
        <div
          className="pointer-events-none absolute bottom-2 h-[3px] rounded-full bg-brand"
          style={{ left: `${gapStart}%`, width: `${Math.max(0, nowPct - gapStart)}%` }}
        />
        {/* now */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 top-1 z-10 w-[2px] -translate-x-1/2 rounded-full bg-brand-strong"
          style={{ left: `${nowPct}%` }}
        />
        {events.map((log) => {
          const pct = (minuteOfDay(log.occurredAt) / 1440) * 100;
          const home = log.type === 'home';
          const selected = log.id === selectedId;
          return (
            <button
              key={log.id}
              type="button"
              aria-pressed={selected}
              aria-label={`${describePotty(log)} ${home ? 'found at home' : 'on a walk'} at ${formatTime(
                log.occurredAt,
              )}. Show details.`}
              onClick={() => onSelect(log)}
              className="absolute top-[36px] z-20 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand-strong"
              style={{ left: `${pct}%` }}
            >
              <span
                className={cx(
                  'block size-2.5 rounded-full transition-[transform,box-shadow] duration-150',
                  home
                    ? 'bg-found ring-2 ring-surface'
                    : 'bg-surface-raised ring-[1.5px] ring-line-strong',
                  selected && 'scale-125 ring-4',
                )}
              />
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}

/** The essential details of one entry, shown inline under the day rule. */
function EntryDetails({
  log,
  now,
  onClose,
}: {
  log: LogRecord;
  now: Date;
  onClose: () => void;
}) {
  const key = pottyKey(log);
  const potty = describePotty(log);
  const ResultIcon = POTTY_ICON[key];
  const walk = log.type === 'walk';

  return (
    <div
      aria-live="polite"
      className="animate-rise flex flex-col gap-3 rounded-control border border-line bg-surface-sunken p-3.5"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cx(
            'grid size-10 shrink-0 place-items-center rounded-[0.7rem]',
            POTTY_TONE[key],
          )}
        >
          <ResultIcon size={21} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[15px] font-bold leading-tight">{potty}</p>
          <p className="text-[12.5px] font-medium text-ink-muted">
            {walk ? 'Walk' : 'Found at home'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Hide details"
          onClick={onClose}
          className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-brand-soft hover:text-ink"
        >
          <XIcon size={18} />
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        <Field label={walk ? 'When' : 'When spotted'}>
          {formatTime(log.occurredAt)}
          <span className="ml-1 font-medium text-ink-muted">
            {formatAgo(log.occurredAt, now)}
          </span>
        </Field>
        {walk ? (
          <>
            <Field label="By">{log.walkerName ?? 'Someone'}</Field>
            {log.durationMin !== null ? (
              <Field label="How long">{log.durationMin} min</Field>
            ) : null}
          </>
        ) : (
          <Field label="Where">{log.placeLabel ?? 'At home'}</Field>
        )}
      </dl>

      {log.note ? (
        <p className="border-t border-line pt-2.5 text-sm italic text-ink-soft">
          “{log.note}”
        </p>
      ) : null}

      <Link
        href={`/log/edit?id=${encodeURIComponent(log.id)}`}
        className="inline-flex min-h-10 items-center justify-center rounded-control border border-line-strong bg-surface-raised px-4 text-sm font-semibold transition-colors hover:bg-brand-soft"
      >
        Edit entry
      </Link>
    </div>
  );
}

function Count({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: typeof PeeIcon;
  value: number;
  label: string;
  tone?: 'pee' | 'poop' | 'live';
}) {
  const toneClass =
    tone === 'pee'
      ? 'text-pee'
      : tone === 'poop'
        ? 'text-poop'
        : tone === 'live'
          ? 'text-live'
          : 'text-ink-muted';
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={20} className={toneClass} />
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold tabular-nums">{value}</span>
        <span className="text-xs font-medium text-ink-muted">{label}</span>
      </div>
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
  const last = lastPottyLog(logs);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = today.find((log) => log.id === selectedId) ?? null;

  return (
    <section
      aria-label={`How ${dogName} has been today`}
      className="flex flex-col gap-4 rounded-card border border-line bg-surface-raised p-5 shadow-card"
    >
      {last ? (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            <SunRiseIcon size={15} />
            Since {dogName} last went
          </span>
          {(() => {
            const { h, m } = heroInterval(now.getTime() - last.occurredAt.getTime());
            return (
              <p className="font-display text-[52px] font-extrabold leading-[1.02] tracking-[-0.03em] tabular-nums">
                {h > 0 ? (
                  <>
                    {h}
                    <span className="text-2xl font-bold text-ink-muted">h </span>
                  </>
                ) : null}
                {m}
                <span className="text-2xl font-bold text-ink-muted">m</span>
                <span className="sr-only">{formatAgo(last.occurredAt, now)}</span>
              </p>
            );
          })()}
          <p className="text-sm font-medium text-ink-soft">{describeLast(last)}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-ink-muted">
            {dogName}&rsquo;s log
          </span>
          <p className="font-display text-2xl font-extrabold">Nothing logged yet</p>
          <p className="text-sm text-ink-muted">
            Start a walk or log what you find — the gap fills in from there.
          </p>
        </div>
      )}

      <DayRule
        events={today}
        lastAt={last?.occurredAt ?? null}
        now={now}
        selectedId={selectedId}
        onSelect={(log) =>
          setSelectedId((current) => (current === log.id ? null : log.id))
        }
      />

      {selected ? (
        <EntryDetails log={selected} now={now} onClose={() => setSelectedId(null)} />
      ) : null}

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
        <Count icon={WalkIcon} value={summary.walks} label="walks" tone="live" />
        <Count icon={PeeIcon} value={summary.pee} label="pee" tone="pee" />
        <Count icon={PoopIcon} value={summary.poop} label="poop" tone="poop" />
        <Count icon={SunRiseIcon} value={summary.homeFinds} label="at home" />
      </div>
    </section>
  );
}

import Link from 'next/link';

import type { LogRecord } from '@walklogger/shared';

import { formatTime } from '@/lib/utils/datetime';

export function describePotty(log: Pick<LogRecord, 'pee' | 'poop'>): string {
  if (log.pee && log.poop) return 'Pee and poop';
  if (log.pee) return 'Pee';
  if (log.poop) return 'Poop';
  return 'Nothing this time';
}

function pottyIcon(log: Pick<LogRecord, 'pee' | 'poop'>): string {
  if (log.pee && log.poop) return '💧💩';
  if (log.pee) return '💧';
  if (log.poop) return '💩';
  return '➖';
}

export function LogItem({ log }: { log: LogRecord }) {
  const where =
    log.type === 'walk'
      ? `Walk with ${log.walkerName ?? 'someone'}${log.durationMin !== null ? ` · ${log.durationMin} min` : ''}`
      : `Found in ${log.placeLabel ?? 'the house'}`;

  return (
    <li>
      <Link
        href={`/log/edit?id=${encodeURIComponent(log.id)}`}
        className="flex min-h-14 items-center gap-3 rounded-card border border-line bg-surface-raised p-3 hover:bg-brand-soft"
      >
        <span aria-hidden="true" className="w-10 text-center text-xl">
          {log.type === 'walk' ? '🦮' : '🏠'}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">
            {pottyIcon(log)} {describePotty(log)}
          </span>
          <span className="truncate text-sm text-ink-muted">{where}</span>
          {log.note ? (
            <span className="truncate text-xs text-ink-muted">“{log.note}”</span>
          ) : null}
        </span>
        <time dateTime={log.occurredAt.toISOString()} className="text-sm text-ink-muted">
          {formatTime(log.occurredAt)}
        </time>
      </Link>
    </li>
  );
}

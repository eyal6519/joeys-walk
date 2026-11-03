import Link from 'next/link';

import type { LogRecord } from '@walklogger/shared';

import { ChevronRightIcon, PinIcon, WalkIcon } from './icons';
import { describePotty, POTTY_ICON, POTTY_TONE, pottyKey } from './potty';
import { cx } from './ui';
import { formatTime } from '@/lib/utils/datetime';

export function LogItem({ log }: { log: LogRecord }) {
  const key = pottyKey(log);
  const ResultIcon = POTTY_ICON[key];
  const where =
    log.type === 'walk'
      ? `${log.walkerName ?? 'Someone'}${
          log.durationMin !== null ? ` · ${log.durationMin} min` : ''
        }`
      : (log.placeLabel ?? 'At home');

  return (
    <li>
      <Link
        href={`/log/edit?id=${encodeURIComponent(log.id)}`}
        className={cx(
          'group flex min-h-16 items-center gap-3.5 rounded-control border border-line bg-surface-raised p-3 pr-3.5',
          'shadow-card transition-[border-color,transform] duration-150 hover:border-line-strong active:scale-[0.99]',
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'grid size-10 shrink-0 place-items-center rounded-[0.7rem]',
            POTTY_TONE[key],
          )}
        >
          <ResultIcon size={21} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold">{describePotty(log)}</span>
          <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ink-muted">
            {log.type === 'walk' ? (
              <WalkIcon size={14} className="shrink-0" />
            ) : (
              <PinIcon size={14} className="shrink-0" />
            )}
            {where}
          </span>
          {log.note ? (
            <span className="truncate text-xs text-ink-muted">“{log.note}”</span>
          ) : null}
        </span>
        <time
          dateTime={log.occurredAt.toISOString()}
          className="shrink-0 text-sm font-semibold tabular-nums text-ink-soft"
        >
          {formatTime(log.occurredAt)}
        </time>
        <ChevronRightIcon
          size={18}
          className="shrink-0 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}

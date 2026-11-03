'use client';

import Link from 'next/link';

import { formatStopwatch } from '@walklogger/shared';

import { useNow } from '@/lib/hooks/use-now';
import { clearWalkTimer, startWalkTimer, useWalkTimerStart } from '@/lib/walk-timer';

import { TimerIcon, WalkIcon } from './icons';
import { ActionTile, buttonClass, Button } from './ui';

/** Start/stop timer for a walk. The start time is persisted, so closing the app does not lose it. */
export function WalkTimerCard() {
  const startedAt = useWalkTimerStart();
  const now = useNow(1000);

  if (startedAt === null) {
    return (
      <ActionTile
        onClick={startWalkTimer}
        icon={WalkIcon}
        title="Going for a walk?"
        subtitle="Start the timer"
        tone="live"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-control border border-live/40 bg-[color-mix(in_oklab,var(--color-live)_10%,var(--color-surface-raised))] p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-live">
          <TimerIcon size={15} />
          Walk in progress
        </span>
        <p
          className="font-display text-3xl font-extrabold tabular-nums"
          role="timer"
          aria-label={`Elapsed ${formatStopwatch(now.getTime() - startedAt)}`}
        >
          {formatStopwatch(now.getTime() - startedAt)}
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/log?type=walk&start=${startedAt}`}
          className={buttonClass('primary', 'flex-1')}
        >
          Finish &amp; log
        </Link>
        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm('Discard this walk without logging it?')) clearWalkTimer();
          }}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}

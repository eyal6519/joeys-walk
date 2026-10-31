'use client';

import Link from 'next/link';

import { formatStopwatch } from '@walklogger/shared';

import { useNow } from '@/lib/hooks/use-now';
import { clearWalkTimer, startWalkTimer, useWalkTimerStart } from '@/lib/walk-timer';

import { Button, buttonClass, Card } from './ui';

/** Start/stop timer for a walk. The start time is persisted, so closing the app does not lose it. */
export function WalkTimerCard() {
  const startedAt = useWalkTimerStart();
  const now = useNow(1000);

  if (startedAt === null) {
    return (
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold">Going for a walk?</h2>
          <p className="text-sm text-ink-muted">
            Start the timer and log what happened when you are back.
          </p>
        </div>
        <Button onClick={startWalkTimer}>🦮 Start walk</Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-brand-strong bg-brand-soft">
      <div>
        <h2 className="font-semibold">Walk in progress</h2>
        <p
          className="text-4xl font-semibold tabular-nums"
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
    </Card>
  );
}

import { describe, expect, it } from 'vitest';

import { formatAgo, formatSpan, formatStopwatch } from './format';
import {
  dailyBuckets,
  lastPottyAt,
  longestGapMs,
  placeBreakdown,
  summarize,
  walkerBreakdown,
  type StatLog,
} from './stats';

const at = (y: number, m: number, d: number, h = 12, min = 0) => new Date(y, m - 1, d, h, min);

function log(partial: Partial<StatLog> & { occurredAt: Date }): StatLog {
  return {
    type: 'walk',
    pee: false,
    poop: false,
    walkerUid: 'u1',
    walkerName: 'Eyal',
    durationMin: null,
    placeLabel: null,
    ...partial,
  };
}

describe('summarize', () => {
  it('counts walks, home finds, pee and poop independently', () => {
    const result = summarize([
      log({ occurredAt: at(2026, 1, 1), pee: true, poop: true }),
      log({ occurredAt: at(2026, 1, 1), type: 'home', pee: true }),
      log({ occurredAt: at(2026, 1, 1) }),
    ]);
    expect(result).toEqual({ walks: 2, homeFinds: 1, pee: 2, poop: 1 });
  });
});

describe('dailyBuckets', () => {
  it('returns one bucket per day including empty ones, oldest first', () => {
    const now = at(2026, 3, 10);
    const buckets = dailyBuckets(
      [log({ occurredAt: at(2026, 3, 10, 8), pee: true }), log({ occurredAt: at(2026, 3, 8), poop: true })],
      3,
      now,
    );
    expect(buckets.map((b) => b.key)).toEqual(['2026-03-08', '2026-03-09', '2026-03-10']);
    expect(buckets.map((b) => [b.pee, b.poop])).toEqual([
      [0, 1],
      [0, 0],
      [1, 0],
    ]);
  });

  it('ignores logs outside the window', () => {
    const buckets = dailyBuckets([log({ occurredAt: at(2026, 1, 1), pee: true })], 3, at(2026, 3, 10));
    expect(buckets.every((b) => b.pee === 0)).toBe(true);
  });

  it('handles a month boundary', () => {
    const buckets = dailyBuckets([], 3, at(2026, 3, 1));
    expect(buckets.map((b) => b.key)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });
});

describe('longestGapMs', () => {
  it('is null with fewer than two potty events', () => {
    expect(longestGapMs([])).toBeNull();
    expect(longestGapMs([log({ occurredAt: at(2026, 1, 1), pee: true })])).toBeNull();
  });

  it('ignores walks where nothing happened and works on unsorted input', () => {
    const gap = longestGapMs([
      log({ occurredAt: at(2026, 1, 1, 18), pee: true }),
      log({ occurredAt: at(2026, 1, 1, 9), poop: true }),
      log({ occurredAt: at(2026, 1, 1, 12) }),
      log({ occurredAt: at(2026, 1, 1, 10), pee: true }),
    ]);
    expect(gap).toBe(8 * 60 * 60 * 1000);
  });
});

describe('lastPottyAt', () => {
  it('returns the latest event with a result', () => {
    const latest = lastPottyAt([
      log({ occurredAt: at(2026, 1, 1, 9), pee: true }),
      log({ occurredAt: at(2026, 1, 1, 15) }),
      log({ occurredAt: at(2026, 1, 1, 11), poop: true }),
    ]);
    expect(latest).toEqual(at(2026, 1, 1, 11));
  });
  it('is null when nothing happened', () => {
    expect(lastPottyAt([log({ occurredAt: at(2026, 1, 1) })])).toBeNull();
  });
});

describe('walkerBreakdown', () => {
  it('groups by account when present and by name otherwise, sorted by walks', () => {
    const result = walkerBreakdown([
      log({ occurredAt: at(2026, 1, 1), walkerUid: 'u1', walkerName: 'Eyal', durationMin: 20 }),
      log({ occurredAt: at(2026, 1, 2), walkerUid: 'u1', walkerName: 'Eyal', durationMin: 30 }),
      log({ occurredAt: at(2026, 1, 3), walkerUid: null, walkerName: 'Dana', durationMin: 15 }),
      log({ occurredAt: at(2026, 1, 4), walkerUid: null, walkerName: 'dana' }),
      log({ occurredAt: at(2026, 1, 5), type: 'home', pee: true }),
    ]);
    expect(result).toEqual([
      { name: 'Eyal', walks: 2, totalMin: 50 },
      { name: 'Dana', walks: 2, totalMin: 15 },
    ]);
  });
});

describe('placeBreakdown', () => {
  it('counts home finds per place, case-insensitively', () => {
    const result = placeBreakdown([
      log({ occurredAt: at(2026, 1, 1), type: 'home', pee: true, placeLabel: 'Kitchen' }),
      log({ occurredAt: at(2026, 1, 2), type: 'home', pee: true, placeLabel: 'kitchen' }),
      log({ occurredAt: at(2026, 1, 3), type: 'home', poop: true, placeLabel: 'Bedroom' }),
      log({ occurredAt: at(2026, 1, 4), pee: true }),
    ]);
    expect(result).toEqual([
      { label: 'Kitchen', count: 2 },
      { label: 'Bedroom', count: 1 },
    ]);
  });
});

describe('formatting', () => {
  it('formats spans', () => {
    expect(formatSpan(0)).toBe('0 min');
    expect(formatSpan(12 * 60_000)).toBe('12 min');
    expect(formatSpan(60 * 60_000)).toBe('1 h');
    expect(formatSpan(65 * 60_000)).toBe('1 h 05 min');
    expect(formatSpan(27 * 60 * 60_000)).toBe('1 d 3 h');
  });
  it('formats relative time', () => {
    const now = at(2026, 1, 1, 12);
    expect(formatAgo(new Date(now.getTime() - 20_000), now)).toBe('just now');
    expect(formatAgo(new Date(now.getTime() - 5 * 60_000), now)).toBe('5 min ago');
  });
  it('formats stopwatch', () => {
    expect(formatStopwatch(7 * 60_000 + 42_000)).toBe('07:42');
    expect(formatStopwatch(3600_000 + 7 * 60_000 + 42_000)).toBe('1:07:42');
    expect(formatStopwatch(-5)).toBe('00:00');
  });
});

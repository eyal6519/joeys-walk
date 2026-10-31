import { describe, expect, it } from 'vitest';

import type { LogRecord } from '@walklogger/shared';

import { applyFilter, DEFAULT_FILTER, groupByDay } from './history-filter';

const now = new Date(2026, 5, 15, 12, 0);

function log(id: string, partial: Partial<LogRecord>): LogRecord {
  return {
    id,
    type: 'walk',
    occurredAt: now,
    pee: true,
    poop: false,
    note: null,
    placeId: null,
    placeLabel: null,
    walkerUid: 'u1',
    walkerName: 'Eyal',
    durationMin: 20,
    createdBy: 'u1',
    createdByName: 'Eyal',
    ...partial,
  };
}

describe('applyFilter', () => {
  const logs = [
    log('a', { occurredAt: new Date(2026, 5, 14) }),
    log('b', { type: 'home', createdBy: 'u2', walkerUid: null, occurredAt: new Date(2026, 5, 13) }),
    log('c', { walkerUid: 'u2', occurredAt: new Date(2026, 4, 1) }),
  ];

  it('limits by day window', () => {
    expect(applyFilter(logs, { ...DEFAULT_FILTER, days: 7 }, now).map((l) => l.id)).toEqual(['a', 'b']);
    expect(applyFilter(logs, { ...DEFAULT_FILTER, days: 0 }, now)).toHaveLength(3);
  });

  it('filters by type', () => {
    expect(applyFilter(logs, { ...DEFAULT_FILTER, days: 0, type: 'home' }, now).map((l) => l.id)).toEqual(['b']);
  });

  it('filters by person using walker for walks and author for home finds', () => {
    const u2 = applyFilter(logs, { ...DEFAULT_FILTER, days: 0, person: 'u2' }, now).map((l) => l.id);
    expect(u2).toEqual(['b', 'c']);
  });
});

describe('groupByDay', () => {
  it('groups consecutive logs of the same local day', () => {
    const groups = groupByDay([
      log('a', { occurredAt: new Date(2026, 5, 15, 18) }),
      log('b', { occurredAt: new Date(2026, 5, 15, 8) }),
      log('c', { occurredAt: new Date(2026, 5, 14, 22) }),
    ]);
    expect(groups.map((g) => [g.key, g.logs.length])).toEqual([
      ['2026-06-15', 2],
      ['2026-06-14', 1],
    ]);
  });

  it('returns nothing for no logs', () => {
    expect(groupByDay([])).toEqual([]);
  });
});

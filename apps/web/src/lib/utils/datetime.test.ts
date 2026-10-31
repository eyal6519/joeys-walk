import { describe, expect, it } from 'vitest';

import { formatDayHeading, fromLocalInputValue, toLocalInputValue } from './datetime';

describe('datetime-local helpers', () => {
  it('round-trips a local date without shifting the time zone', () => {
    const date = new Date(2026, 2, 5, 7, 4);
    const value = toLocalInputValue(date);
    expect(value).toBe('2026-03-05T07:04');
    expect(fromLocalInputValue(value).getTime()).toBe(date.getTime());
  });

  it('yields an invalid date for empty input', () => {
    expect(Number.isNaN(fromLocalInputValue('').getTime())).toBe(true);
  });
});

describe('formatDayHeading', () => {
  const now = new Date(2026, 2, 10, 15, 0);
  it('labels today and yesterday', () => {
    expect(formatDayHeading(new Date(2026, 2, 10, 1), now)).toBe('Today');
    expect(formatDayHeading(new Date(2026, 2, 9, 23), now)).toBe('Yesterday');
  });
  it('uses a weekday and date for older days', () => {
    expect(formatDayHeading(new Date(2026, 2, 1), now)).not.toBe('Today');
  });
});

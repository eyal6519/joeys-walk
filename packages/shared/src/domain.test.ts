import { describe, expect, it } from 'vitest';

import {
  flagsToPotty,
  logInputSchema,
  placeInputSchema,
  pottyToFlags,
  POTTY_VALUES,
} from './domain';

const now = () => new Date();

describe('potty <-> flags', () => {
  it.each(POTTY_VALUES)('round-trips %s', (potty) => {
    const { pee, poop } = pottyToFlags(potty);
    expect(flagsToPotty(pee, poop)).toBe(potty);
  });
});

describe('logInputSchema', () => {
  const walk = () => ({
    type: 'walk' as const,
    occurredAt: now(),
    pee: false,
    poop: false,
    walkerUid: 'u1',
    walkerName: 'Eyal',
    durationMin: 25,
    note: null,
  });
  const home = () => ({
    type: 'home' as const,
    occurredAt: now(),
    pee: true,
    poop: false,
    placeId: 'kitchen',
    placeLabel: 'Kitchen',
    note: null,
  });

  it('accepts a walk where nothing happened', () => {
    expect(logInputSchema.safeParse(walk()).success).toBe(true);
  });

  it('accepts a home find with a place', () => {
    expect(logInputSchema.safeParse(home()).success).toBe(true);
  });

  it('accepts a home find with free-text place', () => {
    expect(
      logInputSchema.safeParse({ ...home(), placeId: null, placeLabel: 'Under the sofa' }).success,
    ).toBe(true);
  });

  it('rejects a home find where nothing was found', () => {
    expect(logInputSchema.safeParse({ ...home(), pee: false, poop: false }).success).toBe(false);
  });

  it('rejects a home find with no place', () => {
    expect(logInputSchema.safeParse({ ...home(), placeLabel: '   ' }).success).toBe(false);
  });

  it('rejects a walk without a walker name', () => {
    expect(logInputSchema.safeParse({ ...walk(), walkerName: '' }).success).toBe(false);
  });

  it('rejects absurd walk durations', () => {
    expect(logInputSchema.safeParse({ ...walk(), durationMin: 5000 }).success).toBe(false);
    expect(logInputSchema.safeParse({ ...walk(), durationMin: -1 }).success).toBe(false);
    expect(logInputSchema.safeParse({ ...walk(), durationMin: 1.5 }).success).toBe(false);
  });

  it('rejects times well in the future but tolerates small clock skew', () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    const skew = new Date(Date.now() + 2 * 60 * 1000);
    expect(logInputSchema.safeParse({ ...walk(), occurredAt: future }).success).toBe(false);
    expect(logInputSchema.safeParse({ ...walk(), occurredAt: skew }).success).toBe(true);
  });

  it('normalises empty notes to null and trims whitespace', () => {
    const empty = logInputSchema.parse({ ...walk(), note: '   ' });
    expect(empty.note).toBeNull();
    const trimmed = logInputSchema.parse({ ...walk(), note: '  good boy  ' });
    expect(trimmed.note).toBe('good boy');
  });

  it('rejects overlong notes', () => {
    expect(logInputSchema.safeParse({ ...walk(), note: 'x'.repeat(501) }).success).toBe(false);
  });
});

describe('placeInputSchema', () => {
  it('requires a label', () => {
    expect(placeInputSchema.safeParse({ label: ' ', icon: null }).success).toBe(false);
    expect(placeInputSchema.safeParse({ label: 'Garden', icon: '🌳' }).success).toBe(true);
  });
});

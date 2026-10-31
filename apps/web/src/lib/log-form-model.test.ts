import { describe, expect, it } from 'vitest';

import type { Member, Place } from '@walklogger/shared';

import { buildLogInput, OTHER, type LogFormValues } from './log-form-model';

const members: Member[] = [
  { uid: 'u1', displayName: 'Eyal', role: 'owner' },
  { uid: 'u2', displayName: 'Dana', role: 'member' },
];
const places: Place[] = [{ id: 'p1', label: 'Kitchen', icon: '🍳', order: 0, archived: false }];

const base: LogFormValues = {
  type: 'walk',
  when: new Date(),
  potty: 'pee',
  note: '',
  walker: 'u1',
  walkerOther: '',
  duration: '25',
  place: 'p1',
  placeOther: '',
};

describe('buildLogInput - walks', () => {
  it('uses the member account and display name for a household walker', () => {
    const result = buildLogInput(base, members, places);
    expect(result.ok).toBe(true);
    if (result.ok && result.input.type === 'walk') {
      expect(result.input.walkerUid).toBe('u1');
      expect(result.input.walkerName).toBe('Eyal');
      expect(result.input.durationMin).toBe(25);
      expect(result.input.pee).toBe(true);
      expect(result.input.poop).toBe(false);
    }
  });

  it('accepts "neither" and an empty duration', () => {
    const result = buildLogInput({ ...base, potty: 'neither', duration: '' }, members, places);
    expect(result.ok).toBe(true);
    if (result.ok && result.input.type === 'walk') {
      expect(result.input.pee || result.input.poop).toBe(false);
      expect(result.input.durationMin).toBeNull();
    }
  });

  it('supports a walker who is not a member', () => {
    const result = buildLogInput({ ...base, walker: OTHER, walkerOther: 'Neighbour Sam' }, members, places);
    expect(result.ok).toBe(true);
    if (result.ok && result.input.type === 'walk') {
      expect(result.input.walkerUid).toBeNull();
      expect(result.input.walkerName).toBe('Neighbour Sam');
    }
  });

  it('requires a name for someone else', () => {
    const result = buildLogInput({ ...base, walker: OTHER, walkerOther: '  ' }, members, places);
    expect(result).toMatchObject({ ok: false, errors: { walkerName: expect.any(String) } });
  });

  it('requires choosing what happened', () => {
    const result = buildLogInput({ ...base, potty: null }, members, places);
    expect(result).toMatchObject({ ok: false, errors: { potty: 'What did Joey do?' } });
  });

  it('rejects fractional or negative minutes and invalid dates', () => {
    expect(buildLogInput({ ...base, duration: '2.5' }, members, places).ok).toBe(false);
    expect(buildLogInput({ ...base, duration: '-3' }, members, places).ok).toBe(false);
    expect(buildLogInput({ ...base, when: new Date('nope') }, members, places).ok).toBe(false);
  });
});

describe('buildLogInput - home finds', () => {
  const home = { ...base, type: 'home' as const, potty: 'poop' as const };

  it('uses a predefined place', () => {
    const result = buildLogInput(home, members, places);
    expect(result.ok).toBe(true);
    if (result.ok && result.input.type === 'home') {
      expect(result.input.placeId).toBe('p1');
      expect(result.input.placeLabel).toBe('Kitchen');
      expect(result.input.poop).toBe(true);
    }
  });

  it('supports free text and stores no place id', () => {
    const result = buildLogInput({ ...home, place: OTHER, placeOther: 'Behind the sofa' }, members, places);
    expect(result.ok).toBe(true);
    if (result.ok && result.input.type === 'home') {
      expect(result.input.placeId).toBeNull();
      expect(result.input.placeLabel).toBe('Behind the sofa');
    }
  });

  it('requires a place when typing freehand', () => {
    const result = buildLogInput({ ...home, place: OTHER, placeOther: '' }, members, places);
    expect(result).toMatchObject({ ok: false, errors: { placeLabel: expect.any(String) } });
  });

  it('refuses "neither" for a find at home', () => {
    expect(buildLogInput({ ...home, potty: 'neither' }, members, places).ok).toBe(false);
  });

  it('drops walk-only fields', () => {
    const result = buildLogInput({ ...home, duration: '30' }, members, places);
    expect(result.ok && 'durationMin' in result.input).toBe(false);
  });
});

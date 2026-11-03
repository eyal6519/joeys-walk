import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LogRecord } from '@walklogger/shared';

import { TodaySummary } from './today-summary';

const now = new Date(2026, 0, 4, 15, 0);

function makeLog(overrides: Partial<LogRecord>): LogRecord {
  return {
    id: 'x',
    type: 'home',
    occurredAt: now,
    pee: true,
    poop: false,
    note: null,
    placeId: null,
    placeLabel: null,
    walkerUid: null,
    walkerName: null,
    durationMin: null,
    createdBy: 'u1',
    createdByName: 'Eyal',
    ...overrides,
  };
}

const home = makeLog({
  id: 'h',
  type: 'home',
  pee: false,
  poop: true,
  placeLabel: 'Hallway',
  occurredAt: new Date(2026, 0, 4, 14, 0),
});
const walk = makeLog({
  id: 'w',
  type: 'walk',
  pee: true,
  poop: false,
  walkerName: 'Dana',
  durationMin: 32,
  occurredAt: new Date(2026, 0, 4, 11, 0),
});

describe('TodaySummary day rule', () => {
  it('reveals a home find’s essentials when its marker is pressed', () => {
    render(<TodaySummary logs={[home, walk]} now={now} dogName="Joey" />);

    fireEvent.click(screen.getByRole('button', { name: /found at home/i }));

    expect(screen.getByText('Found at home')).toBeInTheDocument();
    expect(screen.getByText('Hallway')).toBeInTheDocument();
  });

  it('reveals a walk’s essentials when its marker is pressed', () => {
    render(<TodaySummary logs={[home, walk]} now={now} dogName="Joey" />);

    fireEvent.click(screen.getByRole('button', { name: /on a walk/i }));

    expect(screen.getByText('Walk')).toBeInTheDocument();
    expect(screen.getByText('Dana')).toBeInTheDocument();
    expect(screen.getByText('32 min')).toBeInTheDocument();
  });

  it('hides the details again when the same marker is pressed twice', () => {
    render(<TodaySummary logs={[home, walk]} now={now} dogName="Joey" />);

    const dot = screen.getByRole('button', { name: /found at home/i });
    fireEvent.click(dot);
    expect(screen.getByText('Hallway')).toBeInTheDocument();

    fireEvent.click(dot);
    expect(screen.queryByText('Hallway')).not.toBeInTheDocument();
  });
});

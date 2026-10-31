import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LogForm } from './log-form';

vi.mock('@/providers/household-provider', () => ({
  useHousehold: () => ({
    household: {
      id: 'h1',
      name: 'Home',
      ownerUid: 'u1',
      dogName: 'Joey',
      dogBreed: null,
      dogBirthDate: null,
    },
    members: [
      { uid: 'u1', displayName: 'Eyal', role: 'owner' },
      { uid: 'u2', displayName: 'Dana', role: 'member' },
    ],
    places: [
      { id: 'p1', label: 'Kitchen', icon: '🍳', order: 0, archived: false },
      { id: 'p2', label: 'Old sofa', icon: null, order: 1, archived: true },
    ],
    logs: [],
    actor: { uid: 'u1', name: 'Eyal' },
    isOwner: true,
  }),
}));

const occurredAt = new Date(2026, 0, 1, 12, 0);

function renderForm(onSubmit: (input: unknown) => void) {
  return render(
    <LogForm
      initial={{ type: 'walk', occurredAt, durationMin: null }}
      submitLabel="Save entry"
      onSubmit={onSubmit}
      onCancel={() => undefined}
    />,
  );
}

describe('LogForm', () => {
  it('blocks a walk with no result and reports it on the potty field', () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('What did Joey do?');
  });

  it('submits a valid walk using the selected member and potty result', () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fireEvent.click(screen.getByRole('radio', { name: /Pee/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      type: 'walk',
      pee: true,
      poop: false,
      walkerUid: 'u1',
      walkerName: 'Eyal',
      durationMin: null,
    });
  });

  it('switches to a home find, hides archived places, and submits the chosen place', () => {
    const onSubmit = vi.fn();
    renderForm(onSubmit);

    fireEvent.click(screen.getByRole('button', { name: /Found at home/ }));

    expect(screen.queryByRole('radio', { name: /Old sofa/ })).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Kitchen/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /Poop/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      type: 'home',
      pee: false,
      poop: true,
      placeId: 'p1',
      placeLabel: 'Kitchen',
    });
  });
});

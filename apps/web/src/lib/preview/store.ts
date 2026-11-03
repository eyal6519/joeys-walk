'use client';

import { useSyncExternalStore } from 'react';

import type {
  Household,
  HouseholdInput,
  LogInput,
  LogRecord,
  Member,
  Place,
  PlaceInput,
} from '@walklogger/shared';

import type { Actor } from '@/lib/data/refs';

/**
 * An in-memory household for preview mode. Mutations here stand in for the
 * Firestore writes, so logging and settings edits change the screen exactly as
 * they would against the real backend — they just do not persist.
 */

export type PreviewSnapshot = {
  household: Household;
  members: Member[];
  places: Place[];
  logs: LogRecord[];
  actor: Actor;
};

const PREVIEW_UID = 'u-eyal';
const MINUTE = 60_000;
const loadedAt = Date.now();
const ago = (minutes: number) => new Date(loadedAt - minutes * MINUTE);

const MEMBERS: Member[] = [
  { uid: PREVIEW_UID, displayName: 'Eyal', role: 'owner' },
  { uid: 'u-dana', displayName: 'Dana', role: 'member' },
  { uid: 'u-noa', displayName: 'Noa', role: 'member' },
];

const PLACES: Place[] = [
  { id: 'p1', label: 'Hallway', icon: null, order: 0, archived: false },
  { id: 'p2', label: 'Living room', icon: null, order: 1, archived: false },
  { id: 'p3', label: 'Kitchen', icon: null, order: 2, archived: false },
  { id: 'p4', label: 'Bedroom', icon: null, order: 3, archived: false },
  { id: 'p5', label: 'Balcony', icon: null, order: 4, archived: false },
];

function seedLogs(): LogRecord[] {
  return [
    {
      id: 'l5',
      type: 'walk',
      occurredAt: ago(40),
      pee: false,
      poop: false,
      note: null,
      placeId: null,
      placeLabel: null,
      walkerUid: PREVIEW_UID,
      walkerName: 'Eyal',
      durationMin: 24,
      createdBy: PREVIEW_UID,
      createdByName: 'Eyal',
    },
    {
      id: 'l4',
      type: 'home',
      occurredAt: ago(134),
      pee: true,
      poop: false,
      note: null,
      placeId: 'p2',
      placeLabel: 'Living room',
      walkerUid: null,
      walkerName: null,
      durationMin: null,
      createdBy: 'u-noa',
      createdByName: 'Noa',
    },
    {
      id: 'l3',
      type: 'walk',
      occurredAt: ago(255),
      pee: true,
      poop: true,
      note: 'Long one round the park.',
      placeId: null,
      placeLabel: null,
      walkerUid: 'u-dana',
      walkerName: 'Dana',
      durationMin: 32,
      createdBy: 'u-dana',
      createdByName: 'Dana',
    },
    {
      id: 'l2',
      type: 'home',
      occurredAt: ago(480),
      pee: false,
      poop: true,
      note: null,
      placeId: 'p1',
      placeLabel: 'Hallway',
      walkerUid: null,
      walkerName: null,
      durationMin: null,
      createdBy: PREVIEW_UID,
      createdByName: 'Eyal',
    },
    {
      id: 'l1',
      type: 'home',
      occurredAt: ago(604),
      pee: true,
      poop: false,
      note: null,
      placeId: 'p3',
      placeLabel: 'Kitchen',
      walkerUid: null,
      walkerName: null,
      durationMin: null,
      createdBy: 'u-dana',
      createdByName: 'Dana',
    },
  ];
}

const actor: Actor = { uid: PREVIEW_UID, name: 'Eyal' };

let state: PreviewSnapshot = {
  household: {
    id: 'preview',
    name: 'The Cohens',
    ownerUid: PREVIEW_UID,
    dogName: 'Joey',
    dogBreed: 'Toy Poodle',
    dogBirthDate: new Date(2022, 4, 12),
  },
  members: [...MEMBERS],
  places: [...PLACES],
  logs: seedLogs(),
  actor,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setState(next: Partial<PreviewSnapshot>) {
  state = { ...state, ...next };
  emit();
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function subscribePreview(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPreviewSnapshot(): PreviewSnapshot {
  return state;
}

export function usePreviewSnapshot(): PreviewSnapshot {
  return useSyncExternalStore(subscribePreview, getPreviewSnapshot, getPreviewSnapshot);
}

export function previewCreateLog(input: LogInput, who: Actor): void {
  const record: LogRecord = {
    id: nextId('l'),
    type: input.type,
    occurredAt: input.occurredAt,
    pee: input.pee,
    poop: input.poop,
    note: input.note,
    placeId: input.type === 'home' ? input.placeId : null,
    placeLabel: input.type === 'home' ? input.placeLabel : null,
    walkerUid: input.type === 'walk' ? input.walkerUid : null,
    walkerName: input.type === 'walk' ? input.walkerName : null,
    durationMin: input.type === 'walk' ? input.durationMin : null,
    createdBy: who.uid,
    createdByName: who.name,
  };
  setState({
    logs: [record, ...state.logs].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    ),
  });
}

export function previewUpdateLog(id: string, input: LogInput): void {
  setState({
    logs: state.logs.map((log) =>
      log.id === id
        ? {
            ...log,
            type: input.type,
            occurredAt: input.occurredAt,
            pee: input.pee,
            poop: input.poop,
            note: input.note,
            placeId: input.type === 'home' ? input.placeId : null,
            placeLabel: input.type === 'home' ? input.placeLabel : null,
            walkerUid: input.type === 'walk' ? input.walkerUid : null,
            walkerName: input.type === 'walk' ? input.walkerName : null,
            durationMin: input.type === 'walk' ? input.durationMin : null,
          }
        : log,
    ),
  });
}

export function previewDeleteLog(id: string): void {
  setState({ logs: state.logs.filter((log) => log.id !== id) });
}

export function previewAddPlace(input: PlaceInput, order: number): void {
  setState({
    places: [
      ...state.places,
      { id: nextId('p'), label: input.label, icon: input.icon, order, archived: false },
    ],
  });
}

export function previewUpdatePlace(
  id: string,
  patch: Partial<Pick<Place, 'label' | 'icon' | 'archived'>>,
): void {
  const clean = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  );
  setState({
    places: state.places.map((place) =>
      place.id === id ? { ...place, ...clean } : place,
    ),
  });
}

export function previewReorderPlaces(orderedIds: string[]): void {
  setState({
    places: state.places.map((place) => {
      const index = orderedIds.indexOf(place.id);
      return index === -1 ? place : { ...place, order: index };
    }),
  });
}

export function previewDeletePlace(id: string): void {
  setState({ places: state.places.filter((place) => place.id !== id) });
}

export function previewUpdateHousehold(input: HouseholdInput): void {
  setState({
    household: {
      ...state.household,
      name: input.name,
      dogName: input.dogName,
      dogBreed: input.dogBreed || null,
      dogBirthDate: input.dogBirthDate,
    },
  });
}

export function previewRenameSelf(uid: string, name: string): void {
  setState({
    members: state.members.map((member) =>
      member.uid === uid ? { ...member, displayName: name.trim() } : member,
    ),
  });
  if (uid === actor.uid) setState({ actor: { ...actor, name: name.trim() } });
}

export function previewRemoveMember(uid: string): void {
  setState({ members: state.members.filter((member) => member.uid !== uid) });
}

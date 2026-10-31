import type { DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

import type { Household, LogRecord, Member, Place } from '@walklogger/shared';

function toDate(value: unknown): Date {
  // Pending server timestamps are null in the local cache until the server confirms.
  const ts = value as Timestamp | null | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : new Date();
}

function toDateOrNull(value: unknown): Date | null {
  const ts = value as Timestamp | null | undefined;
  return ts && typeof ts.toDate === 'function' ? ts.toDate() : null;
}

const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);

export function logFromDoc(snap: QueryDocumentSnapshot<DocumentData>): LogRecord {
  const d = snap.data();
  return {
    id: snap.id,
    type: d.type === 'walk' ? 'walk' : 'home',
    occurredAt: toDate(d.occurredAt),
    pee: d.pee === true,
    poop: d.poop === true,
    note: str(d.note),
    placeId: str(d.placeId),
    placeLabel: str(d.placeLabel),
    walkerUid: str(d.walkerUid),
    walkerName: str(d.walkerName),
    durationMin: typeof d.durationMin === 'number' ? d.durationMin : null,
    createdBy: str(d.createdBy) ?? '',
    createdByName: str(d.createdByName) ?? '',
  };
}

export function placeFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Place {
  const d = snap.data();
  return {
    id: snap.id,
    label: str(d.label) ?? '',
    icon: str(d.icon),
    order: typeof d.order === 'number' ? d.order : 0,
    archived: d.archived === true,
  };
}

export function memberFromDoc(snap: QueryDocumentSnapshot<DocumentData>): Member {
  const d = snap.data();
  return {
    uid: snap.id,
    displayName: str(d.displayName) ?? 'Member',
    role: d.role === 'owner' ? 'owner' : 'member',
  };
}

export function householdFromData(id: string, d: DocumentData): Household {
  return {
    id,
    name: str(d.name) ?? '',
    ownerUid: str(d.ownerUid) ?? '',
    dogName: str(d.dogName) ?? 'Joey',
    dogBreed: str(d.dogBreed),
    dogBirthDate: toDateOrNull(d.dogBirthDate),
  };
}

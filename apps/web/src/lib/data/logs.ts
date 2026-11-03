import {
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';

import { logInputSchema, type LogInput, type LogRecord } from '@walklogger/shared';

import { logFromDoc } from '@/lib/firebase/converters';
import { isPreview } from '@/lib/preview';
import {
  previewCreateLog,
  previewDeleteLog,
  previewUpdateLog,
} from '@/lib/preview/store';

import { logsCol, type Actor } from './refs';

function logPayload(input: LogInput) {
  return {
    type: input.type,
    occurredAt: Timestamp.fromDate(input.occurredAt),
    pee: input.pee,
    poop: input.poop,
    note: input.note,
    placeId: input.type === 'home' ? input.placeId : null,
    placeLabel: input.type === 'home' ? input.placeLabel : null,
    walkerUid: input.type === 'walk' ? input.walkerUid : null,
    walkerName: input.type === 'walk' ? input.walkerName : null,
    durationMin: input.type === 'walk' ? input.durationMin : null,
  };
}

/**
 * Callers should NOT block the UI on the returned promise: with offline
 * persistence it only settles once the server acknowledges, which may be much
 * later in a park with no signal. Validation errors throw synchronously.
 */
export function createLog(hid: string, actor: Actor, raw: LogInput): Promise<void> {
  const input = logInputSchema.parse(raw);
  if (isPreview()) {
    previewCreateLog(input, actor);
    return Promise.resolve();
  }
  return setDoc(doc(logsCol(hid)), {
    ...logPayload(input),
    createdBy: actor.uid,
    createdByName: actor.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateLog(hid: string, id: string, raw: LogInput): Promise<void> {
  const input = logInputSchema.parse(raw);
  if (isPreview()) {
    previewUpdateLog(id, input);
    return Promise.resolve();
  }
  return updateDoc(doc(logsCol(hid), id), {
    ...logPayload(input),
    updatedAt: serverTimestamp(),
  });
}

export function deleteLog(hid: string, id: string): Promise<void> {
  if (isPreview()) {
    previewDeleteLog(id);
    return Promise.resolve();
  }
  return deleteDoc(doc(logsCol(hid), id));
}

export function watchLogs(
  hid: string,
  onChange: (logs: LogRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    // ~4 years at 1 event/hour; keeps the live listener bounded for a single dog.
    query(logsCol(hid), orderBy('occurredAt', 'desc'), limit(1500)),
    (snap) => onChange(snap.docs.map(logFromDoc)),
    onError,
  );
}

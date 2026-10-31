import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import { placeInputSchema, type Place, type PlaceInput } from '@walklogger/shared';

import { getDb } from '@/lib/firebase/client';
import { placeFromDoc } from '@/lib/firebase/converters';

import { placesCol } from './refs';

export function watchPlaces(
  hid: string,
  onChange: (places: Place[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(placesCol(hid), orderBy('order')),
    (snap) => onChange(snap.docs.map(placeFromDoc)),
    onError,
  );
}

export async function addPlace(
  hid: string,
  input: PlaceInput,
  order: number,
): Promise<void> {
  const parsed = placeInputSchema.parse(input);
  await addDoc(placesCol(hid), {
    label: parsed.label,
    icon: parsed.icon || null,
    order,
    archived: false,
  });
}

export async function updatePlace(
  hid: string,
  id: string,
  patch: Partial<Pick<Place, 'label' | 'icon' | 'archived'>>,
): Promise<void> {
  const data: Record<string, unknown> = {};
  if (patch.label !== undefined)
    data.label = placeInputSchema.shape.label.parse(patch.label);
  if (patch.icon !== undefined) data.icon = patch.icon || null;
  if (patch.archived !== undefined) data.archived = patch.archived;
  await updateDoc(doc(placesCol(hid), id), data);
}

/** Persists a new ordering by rewriting `order` for the given ids. */
export async function reorderPlaces(hid: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(getDb());
  orderedIds.forEach((id, index) =>
    batch.update(doc(placesCol(hid), id), { order: index }),
  );
  await batch.commit();
}

export async function deletePlace(hid: string, id: string): Promise<void> {
  await deleteDoc(doc(placesCol(hid), id));
}

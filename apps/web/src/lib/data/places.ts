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
import { isPreview } from '@/lib/preview';
import {
  previewAddPlace,
  previewDeletePlace,
  previewReorderPlaces,
  previewUpdatePlace,
} from '@/lib/preview/store';

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
  if (isPreview()) {
    previewAddPlace(parsed, order);
    return;
  }
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
  if (isPreview()) {
    previewUpdatePlace(id, {
      label: patch.label,
      icon: patch.icon,
      archived: patch.archived,
    });
    return;
  }
  await updateDoc(doc(placesCol(hid), id), data);
}

/** Persists a new ordering by rewriting `order` for the given ids. */
export async function reorderPlaces(hid: string, orderedIds: string[]): Promise<void> {
  if (isPreview()) {
    previewReorderPlaces(orderedIds);
    return;
  }
  const batch = writeBatch(getDb());
  orderedIds.forEach((id, index) =>
    batch.update(doc(placesCol(hid), id), { order: index }),
  );
  await batch.commit();
}

export async function deletePlace(hid: string, id: string): Promise<void> {
  if (isPreview()) {
    previewDeletePlace(id);
    return;
  }
  await deleteDoc(doc(placesCol(hid), id));
}

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';

import {
  DEFAULT_PLACES,
  householdInputSchema,
  INVITE_TTL_DAYS,
  type Household,
  type HouseholdInput,
  type Member,
} from '@walklogger/shared';

import { getDb } from '@/lib/firebase/client';
import { householdFromData, memberFromDoc } from '@/lib/firebase/converters';
import { isPreview } from '@/lib/preview';
import {
  previewRemoveMember,
  previewRenameSelf,
  previewUpdateHousehold,
} from '@/lib/preview/store';

import { householdDoc, inviteDoc, membersCol, userDoc, type Actor } from './refs';

/** 24 random bytes, base64url: ~192 bits, so a code cannot be guessed. */
export function generateInviteCode(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function watchActiveHousehold(
  uid: string,
  onChange: (householdId: string | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    userDoc(uid),
    (snap) =>
      onChange(
        snap.exists() ? ((snap.data().householdId as string | null) ?? null) : null,
      ),
    onError,
  );
}

function pointerData(householdId: string | null, name: string) {
  return { householdId, displayName: name, updatedAt: serverTimestamp() };
}

function dogFields(input: HouseholdInput) {
  return {
    name: input.name,
    dogName: input.dogName,
    dogBreed: input.dogBreed || null,
    dogBirthDate: input.dogBirthDate ? Timestamp.fromDate(input.dogBirthDate) : null,
  };
}

/** Household + owner membership + default places + the user's pointer, in one atomic batch. */
export async function createHousehold(
  actor: Actor,
  raw: HouseholdInput,
): Promise<string> {
  const input = householdInputSchema.parse(raw);
  if (isPreview()) return 'preview';
  const db = getDb();
  const ref = doc(collection(db, 'households'));
  const batch = writeBatch(db);

  batch.set(ref, {
    ...dogFields(input),
    ownerUid: actor.uid,
    createdAt: serverTimestamp(),
  });
  batch.set(doc(ref, 'members', actor.uid), {
    displayName: actor.name,
    role: 'owner',
    joinedAt: serverTimestamp(),
  });
  DEFAULT_PLACES.forEach((place, index) => {
    batch.set(doc(collection(ref, 'places')), {
      label: place.label,
      icon: place.icon,
      order: index,
      archived: false,
    });
  });
  batch.set(userDoc(actor.uid), pointerData(ref.id, actor.name));

  await batch.commit();
  return ref.id;
}

export function watchHousehold(
  hid: string,
  onChange: (household: Household | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    householdDoc(hid),
    (snap) => onChange(snap.exists() ? householdFromData(snap.id, snap.data()) : null),
    onError,
  );
}

export async function updateHousehold(hid: string, raw: HouseholdInput): Promise<void> {
  const input = householdInputSchema.parse(raw);
  if (isPreview()) {
    previewUpdateHousehold(input);
    return;
  }
  await updateDoc(householdDoc(hid), dogFields(input));
}

export type InvitePreview = {
  householdId: string;
  householdName: string;
  dogName: string;
  expired: boolean;
};

export async function createInvite(
  actor: Actor,
  household: Household,
): Promise<{ code: string; expiresAt: Date }> {
  const code = generateInviteCode();
  // One minute short of the TTL so server-side clock skew can never exceed the rule's cap.
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 3600_000 - 60_000);
  if (isPreview()) return { code: 'PREVIEW-INVITE', expiresAt };
  await setDoc(inviteDoc(code), {
    householdId: household.id,
    householdName: household.name,
    dogName: household.dogName,
    createdBy: actor.uid,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });
  return { code, expiresAt };
}

export async function previewInvite(code: string): Promise<InvitePreview | null> {
  if (isPreview()) return null;
  const snap = await getDoc(inviteDoc(code));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    householdId: d.householdId as string,
    householdName: d.householdName as string,
    dogName: d.dogName as string,
    expired: (d.expiresAt as Timestamp).toDate().getTime() <= Date.now(),
  };
}

export async function joinHousehold(
  actor: Actor,
  code: string,
  householdId: string,
): Promise<void> {
  const batch = writeBatch(getDb());
  batch.set(doc(membersCol(householdId), actor.uid), {
    displayName: actor.name,
    role: 'member',
    joinedAt: serverTimestamp(),
    inviteCode: code,
  });
  batch.set(userDoc(actor.uid), pointerData(householdId, actor.name));
  await batch.commit();
}

export function watchMembers(
  hid: string,
  onChange: (members: Member[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    membersCol(hid),
    (snap) =>
      onChange(
        snap.docs
          .map(memberFromDoc)
          .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      ),
    onError,
  );
}

export async function removeMember(hid: string, uid: string): Promise<void> {
  if (isPreview()) {
    previewRemoveMember(uid);
    return;
  }
  await deleteDoc(doc(membersCol(hid), uid));
}

export async function renameSelf(hid: string, uid: string, name: string): Promise<void> {
  if (isPreview()) {
    previewRenameSelf(uid, name);
    return;
  }
  await updateDoc(doc(membersCol(hid), uid), { displayName: name.trim() });
}

export async function clearActiveHousehold(actor: Actor): Promise<void> {
  if (isPreview()) return;
  await setDoc(userDoc(actor.uid), pointerData(null, actor.name));
}

/**
 * Leaves a household: removes the caller's membership and clears their active
 * pointer in one batch. Owners cannot leave (rules forbid removing the owner);
 * the UI hides the button for them.
 */
export async function leaveHousehold(actor: Actor, hid: string): Promise<void> {
  if (isPreview()) return;
  const batch = writeBatch(getDb());
  batch.delete(doc(membersCol(hid), actor.uid));
  batch.set(userDoc(actor.uid), pointerData(null, actor.name));
  await batch.commit();
}

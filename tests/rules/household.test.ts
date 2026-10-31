import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import { createEnv, HID, MEMBER, OWNER, seed, STRANGER } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await createEnv('walklogger-rules-household');
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await seed(env);
});

const db = (uid: string) => env.authenticatedContext(uid).firestore();

describe('default deny', () => {
  it('blocks unauthenticated access', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, `households/${HID}`)));
    await assertFails(getDocs(collection(anon, `households/${HID}/logs`)));
  });

  it('blocks unknown collections even for members', async () => {
    await assertFails(setDoc(doc(db(OWNER), 'secrets/a'), { x: 1 }));
    await assertFails(getDoc(doc(db(OWNER), 'secrets/a')));
  });
});

describe('household access', () => {
  it('lets members read and strangers not', async () => {
    await assertSucceeds(getDoc(doc(db(MEMBER), `households/${HID}`)));
    await assertFails(getDoc(doc(db(STRANGER), `households/${HID}`)));
    await assertFails(getDocs(collection(db(STRANGER), `households/${HID}/logs`)));
    await assertFails(getDocs(collection(db(STRANGER), `households/${HID}/members`)));
  });

  it('only lets the owner edit the dog profile, and never ownerUid', async () => {
    await assertSucceeds(updateDoc(doc(db(OWNER), `households/${HID}`), { dogName: 'Joey Jr' }));
    await assertFails(updateDoc(doc(db(MEMBER), `households/${HID}`), { dogName: 'Hax' }));
    await assertFails(updateDoc(doc(db(OWNER), `households/${HID}`), { ownerUid: MEMBER }));
  });

  it('never allows deleting a household', async () => {
    await assertFails(deleteDoc(doc(db(OWNER), `households/${HID}`)));
  });
});

describe('household creation', () => {
  it('lets a user found a household in one batch and become its owner', async () => {
    const user = db('newbie');
    const batch = writeBatch(user);
    batch.set(doc(user, 'households/new1'), {
      name: 'Mine',
      ownerUid: 'newbie',
      dogName: 'Joey',
      dogBreed: 'Toy Poodle',
      dogBirthDate: null,
      createdAt: serverTimestamp(),
    });
    batch.set(doc(user, 'households/new1/members/newbie'), {
      displayName: 'Newbie',
      role: 'owner',
      joinedAt: serverTimestamp(),
    });
    await assertSucceeds(batch.commit());
  });

  it('blocks claiming ownership of an existing household', async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), `households/${HID}/members/${STRANGER}`), {
        displayName: 'Evil',
        role: 'owner',
        joinedAt: serverTimestamp(),
      }),
    );
  });

  it('blocks naming someone else as owner of a new household', async () => {
    await assertFails(
      setDoc(doc(db('newbie'), 'households/new2'), {
        name: 'x',
        ownerUid: 'someone-else',
        dogName: 'Joey',
        dogBreed: null,
        dogBirthDate: null,
        createdAt: serverTimestamp(),
      }),
    );
  });
});

describe('members', () => {
  it('stops members promoting themselves but allows renaming', async () => {
    const ref = doc(db(MEMBER), `households/${HID}/members/${MEMBER}`);
    await assertFails(updateDoc(ref, { role: 'owner' }));
    await assertSucceeds(updateDoc(ref, { displayName: 'New name' }));
  });

  it('lets members leave, but the owner cannot be removed or leave', async () => {
    await assertFails(deleteDoc(doc(db(OWNER), `households/${HID}/members/${OWNER}`)));
    await assertFails(deleteDoc(doc(db(MEMBER), `households/${HID}/members/${OWNER}`)));
    await assertSucceeds(deleteDoc(doc(db(MEMBER), `households/${HID}/members/${MEMBER}`)));
  });

  it('lets the owner remove another member', async () => {
    await assertSucceeds(deleteDoc(doc(db(OWNER), `households/${HID}/members/${MEMBER}`)));
  });
});

describe('places', () => {
  const place = { label: 'Kitchen', icon: '🍳', order: 1, archived: false };

  it('lets members manage valid places and strangers not', async () => {
    await assertSucceeds(setDoc(doc(db(MEMBER), `households/${HID}/places/p1`), place));
    await assertFails(setDoc(doc(db(STRANGER), `households/${HID}/places/p2`), place));
    await assertFails(setDoc(doc(db(MEMBER), `households/${HID}/places/p3`), { ...place, label: '' }));
    await assertFails(setDoc(doc(db(MEMBER), `households/${HID}/places/p4`), { ...place, evil: true }));
  });
});

describe('user profile', () => {
  it('is private to its owner', async () => {
    const data = { householdId: HID, displayName: 'Me', updatedAt: serverTimestamp() };
    await assertSucceeds(setDoc(doc(db('u1'), 'users/u1'), data));
    await assertSucceeds(getDoc(doc(db('u1'), 'users/u1')));
    await assertFails(getDoc(doc(db('u2'), 'users/u1')));
    await assertFails(setDoc(doc(db('u2'), 'users/u1'), data));
    await assertFails(setDoc(doc(db('u1'), 'users/u1'), { ...data, admin: true }));
  });
});

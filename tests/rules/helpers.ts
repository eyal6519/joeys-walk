import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

export const HID = 'house1';
export const OWNER = 'owner1';
export const MEMBER = 'member1';
export const STRANGER = 'stranger1';

const here = dirname(fileURLToPath(import.meta.url));

export async function createEnv(projectId: string): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(resolve(here, '../../firestore.rules'), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
}

/** Seeds a household with an owner, a member and one existing walk log. */
export async function seed(env: RulesTestEnvironment): Promise<void> {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, `households/${HID}`), {
      name: 'Home',
      ownerUid: OWNER,
      dogName: 'Joey',
      dogBreed: null,
      dogBirthDate: null,
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, `households/${HID}/members/${OWNER}`), {
      displayName: 'Owner',
      role: 'owner',
      joinedAt: Timestamp.now(),
    });
    await setDoc(doc(db, `households/${HID}/members/${MEMBER}`), {
      displayName: 'Member',
      role: 'member',
      joinedAt: Timestamp.now(),
    });
    await setDoc(
      doc(db, `households/${HID}/logs/existing`),
      walkLog(OWNER, { createdAt: Timestamp.now(), updatedAt: Timestamp.now() }),
    );
  });
}

export function walkLog(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    type: 'walk',
    occurredAt: Timestamp.now(),
    pee: true,
    poop: false,
    note: null,
    placeId: null,
    placeLabel: null,
    walkerUid: uid,
    walkerName: 'Someone',
    durationMin: 20,
    createdBy: uid,
    createdByName: 'Someone',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

export function homeLog(uid: string, overrides: Record<string, unknown> = {}) {
  return {
    type: 'home',
    occurredAt: Timestamp.now(),
    pee: true,
    poop: false,
    note: null,
    placeId: 'kitchen',
    placeLabel: 'Kitchen',
    walkerUid: null,
    walkerName: null,
    durationMin: null,
    createdBy: uid,
    createdByName: 'Someone',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

import {
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import {
  createEnv,
  HID,
  homeLog,
  MEMBER,
  OWNER,
  seed,
  STRANGER,
  walkLog,
} from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await createEnv('walklogger-rules-logs');
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await seed(env);
});

const db = (uid: string) => env.authenticatedContext(uid).firestore();
const logs = (uid: string) => collection(db(uid), `households/${HID}/logs`);

describe('creating logs', () => {
  it('accepts valid walk and home logs from a member', async () => {
    await assertSucceeds(setDoc(doc(logs(MEMBER)), walkLog(MEMBER)));
    await assertSucceeds(
      setDoc(
        doc(logs(MEMBER)),
        walkLog(MEMBER, { pee: false, poop: false, durationMin: null }),
      ),
    );
    await assertSucceeds(setDoc(doc(logs(MEMBER)), homeLog(MEMBER)));
    await assertSucceeds(
      setDoc(
        doc(logs(MEMBER)),
        homeLog(MEMBER, { placeId: null, placeLabel: 'Under the sofa' }),
      ),
    );
  });

  it('rejects strangers', async () => {
    await assertFails(setDoc(doc(logs(STRANGER)), walkLog(STRANGER)));
  });

  it('rejects forged authorship and client-supplied timestamps', async () => {
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(OWNER)));
    await assertFails(
      setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { createdAt: Timestamp.fromMillis(0) })),
    );
  });

  it('rejects a home log where nothing was found', async () => {
    await assertFails(
      setDoc(doc(logs(MEMBER)), homeLog(MEMBER, { pee: false, poop: false })),
    );
  });

  it('rejects mixing walk and home fields', async () => {
    await assertFails(
      setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { placeLabel: 'Kitchen' })),
    );
    await assertFails(setDoc(doc(logs(MEMBER)), homeLog(MEMBER, { walkerName: 'X' })));
  });

  it('rejects unknown fields, bad types, absurd values and unknown log types', async () => {
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { extra: 'nope' })));
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { pee: 'yes' })));
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { durationMin: 5000 })));
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { type: 'swim' })));
    await assertFails(
      setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { note: 'x'.repeat(501) })),
    );
  });

  it('rejects logs dated well into the future', async () => {
    const future = Timestamp.fromMillis(Date.now() + 3600_000);
    await assertFails(setDoc(doc(logs(MEMBER)), walkLog(MEMBER, { occurredAt: future })));
  });
});

describe('editing and deleting logs', () => {
  it('lets a member correct a log but not change author, type or creation time', async () => {
    const ref = doc(db(MEMBER), `households/${HID}/logs/existing`);
    await assertSucceeds(
      updateDoc(ref, { durationMin: 45, updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, { createdBy: MEMBER, updatedAt: serverTimestamp() }),
    );
    await assertFails(updateDoc(ref, { type: 'home', updatedAt: serverTimestamp() }));
    await assertFails(
      updateDoc(ref, {
        createdAt: Timestamp.fromMillis(0),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(updateDoc(ref, { durationMin: 46 }));
  });

  it('lets authors and owners delete, but not other members', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), `households/${HID}/logs/byMember`),
        walkLog(MEMBER, { createdAt: Timestamp.now(), updatedAt: Timestamp.now() }),
      );
    });
    await assertFails(deleteDoc(doc(db(MEMBER), `households/${HID}/logs/existing`)));
    await assertSucceeds(deleteDoc(doc(db(MEMBER), `households/${HID}/logs/byMember`)));
    await assertSucceeds(deleteDoc(doc(db(OWNER), `households/${HID}/logs/existing`)));
  });
});

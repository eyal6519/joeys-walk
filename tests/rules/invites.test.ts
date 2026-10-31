import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import { createEnv, HID, OWNER, seed, STRANGER } from './helpers';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await createEnv('walklogger-rules-invites');
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await seed(env);
});

const db = (uid: string) => env.authenticatedContext(uid).firestore();
const code = 'a'.repeat(32);
const expiredCode = 'b'.repeat(32);

function inviteDoc(householdId: string, expiresInMs: number) {
  return {
    householdId,
    householdName: 'Home',
    dogName: 'Joey',
    createdBy: OWNER,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + expiresInMs),
  };
}

function joinDoc(inviteCode: string) {
  return { displayName: 'Guest', role: 'member', joinedAt: serverTimestamp(), inviteCode };
}

describe('creating invites', () => {
  it('lets a member create one, and anyone signed in fetch it by code but never list', async () => {
    await assertSucceeds(
      setDoc(doc(db(OWNER), `invites/${code}`), {
        ...inviteDoc(HID, 24 * 3600_000),
        createdAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(getDoc(doc(db(STRANGER), `invites/${code}`)));
    await assertFails(getDocs(collection(db(STRANGER), 'invites')));
  });

  it('refuses invites from non-members', async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), `invites/${code}`), {
        ...inviteDoc(HID, 3600_000),
        createdBy: STRANGER,
        createdAt: serverTimestamp(),
      }),
    );
  });

  it('refuses invites that live longer than a week', async () => {
    await assertFails(
      setDoc(doc(db(OWNER), `invites/${code}`), {
        ...inviteDoc(HID, 30 * 24 * 3600_000),
        createdAt: serverTimestamp(),
      }),
    );
  });
});

describe('joining with an invite', () => {
  const path = `households/${HID}/members/${STRANGER}`;

  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `invites/${code}`), inviteDoc(HID, 3600_000));
      await setDoc(doc(ctx.firestore(), `invites/${expiredCode}`), inviteDoc(HID, -3600_000));
    });
  });

  it('works with a valid invite and grants access', async () => {
    await assertSucceeds(setDoc(doc(db(STRANGER), path), joinDoc(code)));
    await assertSucceeds(getDoc(doc(db(STRANGER), `households/${HID}`)));
  });

  it('fails with an expired or non-existent code', async () => {
    await assertFails(setDoc(doc(db(STRANGER), path), joinDoc(expiredCode)));
    await assertFails(setDoc(doc(db(STRANGER), path), joinDoc('nope'.repeat(8))));
  });

  it('fails when the invite belongs to a different household', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `invites/${'c'.repeat(32)}`), inviteDoc('other', 3600_000));
    });
    await assertFails(setDoc(doc(db(STRANGER), path), joinDoc('c'.repeat(32))));
  });

  it('cannot be used to join as owner', async () => {
    await assertFails(
      setDoc(doc(db(STRANGER), path), { ...joinDoc(code), role: 'owner' }),
    );
  });
});

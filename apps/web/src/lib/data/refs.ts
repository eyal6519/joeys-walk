import { collection, doc } from 'firebase/firestore';

import { getDb } from '@/lib/firebase/client';

export type Actor = { uid: string; name: string };

export const householdDoc = (hid: string) => doc(getDb(), 'households', hid);
export const logsCol = (hid: string) => collection(getDb(), 'households', hid, 'logs');
export const placesCol = (hid: string) => collection(getDb(), 'households', hid, 'places');
export const membersCol = (hid: string) => collection(getDb(), 'households', hid, 'members');
export const userDoc = (uid: string) => doc(getDb(), 'users', uid);
export const inviteDoc = (code: string) => doc(getDb(), 'invites', code);

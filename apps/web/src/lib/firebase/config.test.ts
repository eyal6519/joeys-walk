import { describe, expect, it } from 'vitest';

import { toFirebaseOptions, shouldUseEmulators, type FirebaseEnvConfig } from './config';

const completeEnv: FirebaseEnvConfig = {
  apiKey: 'test-api-key',
  authDomain: 'walklogger-test.firebaseapp.com',
  projectId: 'walklogger-test',
  storageBucket: 'walklogger-test.firebasestorage.app',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
};

describe('toFirebaseOptions', () => {
  it('maps a complete environment onto Firebase options', () => {
    expect(toFirebaseOptions(completeEnv)).toEqual({
      apiKey: 'test-api-key',
      authDomain: 'walklogger-test.firebaseapp.com',
      projectId: 'walklogger-test',
      storageBucket: 'walklogger-test.firebasestorage.app',
      messagingSenderId: '1234567890',
      appId: '1:1234567890:web:abcdef',
    });
  });

  it('omits measurementId when Analytics is not configured', () => {
    const options = toFirebaseOptions(completeEnv);
    expect(options).not.toHaveProperty('measurementId');
  });

  it('includes measurementId when it is present', () => {
    const options = toFirebaseOptions({ ...completeEnv, measurementId: 'G-TEST123' });
    expect(options.measurementId).toBe('G-TEST123');
  });

  it.each([
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ] as const)('throws when %s is missing', (key) => {
    expect(() => toFirebaseOptions({ ...completeEnv, [key]: undefined })).toThrow(
      /Firebase configuration is incomplete/,
    );
  });

  it('treats blank and whitespace-only values as missing', () => {
    expect(() => toFirebaseOptions({ ...completeEnv, apiKey: '   ' })).toThrow(
      /Missing: apiKey/,
    );
  });

  it('names every missing key in the error message', () => {
    expect(() =>
      toFirebaseOptions({ ...completeEnv, apiKey: undefined, appId: '' }),
    ).toThrow(/Missing: apiKey, appId/);
  });
});

describe('shouldUseEmulators', () => {
  it('is true only for the exact string "true"', () => {
    expect(shouldUseEmulators('true')).toBe(true);
    expect(shouldUseEmulators('false')).toBe(false);
    expect(shouldUseEmulators(undefined)).toBe(false);
    expect(shouldUseEmulators('1')).toBe(false);
    expect(shouldUseEmulators('TRUE')).toBe(false);
  });
});

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { siteConfig } from '@walklogger/shared';

import {
  completeEmailLinkSignIn,
  describeAuthError,
  getRememberedEmail,
  isEmailLinkUrl,
  sendEmailLink,
  signInForLocalDemo,
  signInWithGoogle,
} from '@/lib/firebase/auth';
import { isEmulatorMode } from '@/lib/firebase/client';
import { useAuth } from '@/providers/auth-provider';

import { TextField } from './form';
import { Button, Card, ErrorNote, Spinner } from './ui';

/** Only same-site relative paths are allowed as a post-login target (no open redirects). */
export function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\'))
    return '/';
  return value;
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const next = safeNext(params.get('next'));

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Returning from the emailed link is detected once, during the first render, so
  // the effect below never has to set state synchronously.
  const [linkReturn] = useState(() => {
    if (typeof window === 'undefined' || !isEmailLinkUrl(window.location.href))
      return null;
    return { href: window.location.href, remembered: getRememberedEmail() };
  });
  const [finishing, setFinishing] = useState(() => Boolean(linkReturn?.remembered));
  const [needsEmail] = useState(() => Boolean(linkReturn && !linkReturn.remembered));

  useEffect(() => {
    if (!linkReturn?.remembered) return;
    completeEmailLinkSignIn(linkReturn.remembered, linkReturn.href).catch((e) => {
      setError(describeAuthError(e));
      setFinishing(false);
    });
  }, [linkReturn]);

  useEffect(() => {
    if (auth.status === 'signed-in') router.replace(next);
  }, [auth.status, next, router]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(describeAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email address.');
      return;
    }
    if (needsEmail) {
      void run(async () => {
        await completeEmailLinkSignIn(trimmed, window.location.href);
      });
      return;
    }
    void run(async () => {
      await sendEmailLink(trimmed, `/sign-in?next=${encodeURIComponent(next)}`);
      setSent(true);
    });
  }

  if (auth.status === 'loading' || finishing || auth.status === 'signed-in') {
    return <Spinner label="Signing you in" />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <span aria-hidden="true" className="text-5xl">
          🐩
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{siteConfig.name}</h1>
        <p className="text-ink-muted">{siteConfig.tagline}</p>
      </header>

      <Card className="flex flex-col gap-4">
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => void run(signInWithGoogle)}
        >
          Continue with Google
        </Button>

        {isEmulatorMode() && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => void run(signInForLocalDemo)}
          >
            Use a local test account
          </Button>
        )}

        <div
          className="flex items-center gap-3 text-xs text-ink-muted"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        {sent ? (
          <p role="status" className="text-sm">
            Check <strong>{email.trim()}</strong> for a sign-in link. You can close this
            tab; open the link on this device.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
            <TextField
              label={needsEmail ? 'Confirm your email to finish signing in' : 'Email'}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hint={
                needsEmail ? undefined : 'We email you a link. No password to remember.'
              }
            />
            <Button type="submit" disabled={busy}>
              {needsEmail ? 'Finish signing in' : 'Email me a sign-in link'}
            </Button>
          </form>
        )}

        {error ? <ErrorNote>{error}</ErrorNote> : null}
      </Card>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { SignedInOnly } from '@/components/app-shell';
import { Button, Card, ErrorNote, PageHeader, Spinner } from '@/components/ui';
import { joinHousehold, previewInvite, type InvitePreview } from '@/lib/data/household';
import { useSignedIn } from '@/providers/auth-provider';
import { HouseholdProvider, useHouseholdState } from '@/providers/household-provider';

type Load =
  | { state: 'loading' }
  | { state: 'missing' }
  | { state: 'ready'; invite: InvitePreview }
  | { state: 'error'; message: string };

function Join() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useSignedIn();
  const household = useHouseholdState();
  const code = params.get('code')?.trim() ?? '';

  const [load, setLoad] = useState<Load>(() =>
    code ? { state: 'loading' } : { state: 'missing' },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    previewInvite(code)
      .then((invite) => {
        if (!cancelled)
          setLoad(invite ? { state: 'ready', invite } : { state: 'missing' });
      })
      .catch((e: Error) => {
        if (!cancelled) setLoad({ state: 'error', message: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function accept(invite: InvitePreview) {
    setBusy(true);
    setError(null);
    try {
      await joinHousehold(
        { uid: auth.user.uid, name: auth.name },
        code,
        invite.householdId,
      );
      router.replace('/');
    } catch {
      setError('Could not join. The invite may have expired, ask for a new one.');
      setBusy(false);
    }
  }

  if (load.state === 'loading' || household.status === 'loading') return <Spinner />;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
      <PageHeader title="Join a household" />
      <Card className="flex flex-col gap-4">
        {load.state === 'missing' && (
          <ErrorNote>This invite link is not valid. Ask for a new one.</ErrorNote>
        )}
        {load.state === 'error' && <ErrorNote>{load.message}</ErrorNote>}
        {load.state === 'ready' && load.invite.expired && (
          <ErrorNote>This invite has expired. Ask for a new one.</ErrorNote>
        )}
        {load.state === 'ready' && !load.invite.expired && (
          <>
            <p>
              You have been invited to help look after{' '}
              <strong>{load.invite.dogName}</strong> in{' '}
              <strong>{load.invite.householdName}</strong>.
            </p>
            {household.status === 'ready' && (
              <p className="text-sm text-ink-muted">
                Joining will switch you away from {household.household.name}.
              </p>
            )}
            {error ? <ErrorNote>{error}</ErrorNote> : null}
            <Button disabled={busy} onClick={() => void accept(load.invite)}>
              {busy ? 'Joining…' : `Join ${load.invite.dogName}'s household`}
            </Button>
          </>
        )}
      </Card>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SignedInOnly>
        <HouseholdProvider>
          <Join />
        </HouseholdProvider>
      </SignedInOnly>
    </Suspense>
  );
}

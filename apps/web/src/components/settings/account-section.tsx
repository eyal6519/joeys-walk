'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signOut } from '@/lib/firebase/auth';
import { leaveHousehold } from '@/lib/data/household';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

import { Button, Card } from '../ui';

export function AccountSection() {
  const router = useRouter();
  const { household, actor, isOwner } = useHousehold();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function leave() {
    if (!window.confirm(`Leave ${household.name}? You can re-join with a new invite.`))
      return;
    setBusy(true);
    try {
      await leaveHousehold(actor, household.id);
      router.replace('/');
    } catch (e) {
      toast(`Could not leave: ${e instanceof Error ? e.message : 'try again'}`, 'error');
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="account-heading" className="flex flex-col gap-3">
      <h2 id="account-heading" className="text-sm font-semibold uppercase tracking-wide">
        Account
      </h2>
      <Card className="flex flex-col gap-3">
        <Button
          variant="secondary"
          className="self-start"
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </Button>

        {isOwner ? (
          <p className="text-sm text-ink-muted">
            You own {household.name}, so you cannot leave it. Transfer is not supported
            yet.
          </p>
        ) : (
          <Button
            variant="ghost"
            disabled={busy}
            className="self-start text-danger"
            onClick={() => void leave()}
          >
            {busy ? 'Leaving…' : `Leave ${household.name}`}
          </Button>
        )}
      </Card>
    </section>
  );
}

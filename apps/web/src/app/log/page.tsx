'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/app-shell';
import { LogForm } from '@/components/log-form';
import { PageHeader, Spinner } from '@/components/ui';
import { createLog } from '@/lib/data/logs';
import { clearWalkTimer } from '@/lib/walk-timer';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

function NewLog() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { household, actor } = useHousehold();

  const type = params.get('type') === 'home' ? 'home' : 'walk';
  const startedAt = Number(params.get('start'));
  const hasStart = Number.isFinite(startedAt) && startedAt > 0 && startedAt <= Date.now();

  // Computed once so the form's defaults do not shift while the user is typing.
  const [initial] = useState(() => ({
    type: type as 'walk' | 'home',
    occurredAt: hasStart && type === 'walk' ? new Date(startedAt) : new Date(),
    durationMin: hasStart && type === 'walk' ? Math.max(1, Math.round((Date.now() - startedAt) / 60_000)) : null,
  }));

  return (
    <>
      <PageHeader title="Log an entry" subtitle={`For ${household.dogName}`} />
      <LogForm
        initial={initial}
        submitLabel="Save entry"
        onCancel={() => router.back()}
        onSubmit={(input) => {
          // Do not await: offline, this resolves only after reconnecting.
          createLog(household.id, actor, input).catch((e: Error) =>
            toast(`Could not save the entry: ${e.message}`, 'error'),
          );
          if (input.type === 'walk') clearWalkTimer();
          toast('Saved', 'info');
          router.replace('/');
        }}
      />
    </>
  );
}

export default function NewLogPage() {
  return (
    <AppShell hideNav>
      <Suspense fallback={<Spinner />}>
        <NewLog />
      </Suspense>
    </AppShell>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { LogForm } from '@/components/log-form';
import { Card, PageHeader, Spinner } from '@/components/ui';
import { createLog } from '@/lib/data/logs';
import { clearWalkTimer } from '@/lib/walk-timer';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

function NewLog() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { household, actor } = useHousehold();

  // Computed once so the form's defaults do not shift while the user is typing.
  const [initial] = useState(() => {
    const type = params.get('type') === 'home' ? 'home' : 'walk';
    const startedAt = Number(params.get('start'));
    const now = new Date().getTime();
    const useStart =
      type === 'walk' && Number.isFinite(startedAt) && startedAt > 0 && startedAt <= now;
    return {
      type: type as 'walk' | 'home',
      occurredAt: useStart ? new Date(startedAt) : new Date(now),
      durationMin: useStart ? Math.max(1, Math.round((now - startedAt) / 60_000)) : null,
    };
  });

  return (
    <>
      <PageHeader title="Log an entry" subtitle={`For ${household.dogName}`} />
      <Card>
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
      </Card>
    </>
  );
}

export default function NewLogPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewLog />
    </Suspense>
  );
}

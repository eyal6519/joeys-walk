'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { AppShell } from '@/components/app-shell';
import { LogForm } from '@/components/log-form';
import { Button, EmptyState, PageHeader, Spinner } from '@/components/ui';
import { deleteLog, updateLog } from '@/lib/data/logs';
import { useHousehold } from '@/providers/household-provider';
import { useToast } from '@/providers/toast-provider';

function EditLog() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const toast = useToast();
  const { household, logs, actor, isOwner } = useHousehold();

  const log = logs.find((l) => l.id === id);
  if (!log) {
    return (
      <EmptyState
        title="Entry not found"
        hint="It may have been deleted, or it is older than the history we keep loaded."
        action={
          <Button onClick={() => router.replace('/history')}>Back to history</Button>
        }
      />
    );
  }
  const canDelete = log.createdBy === actor.uid || isOwner;

  return (
    <>
      <PageHeader title="Edit entry" subtitle={`Logged by ${log.createdByName}`} />
      <LogForm
        initial={{
          type: log.type,
          occurredAt: log.occurredAt,
          durationMin: log.durationMin,
          existing: log,
        }}
        submitLabel="Save changes"
        onCancel={() => router.back()}
        onSubmit={(input) => {
          updateLog(household.id, log.id, input).catch((e: Error) =>
            toast(`Could not save changes: ${e.message}`, 'error'),
          );
          toast('Saved', 'info');
          router.replace('/history');
        }}
      />
      {canDelete && (
        <Button
          variant="danger"
          onClick={() => {
            if (!window.confirm('Delete this entry? This cannot be undone.')) return;
            deleteLog(household.id, log.id).catch((e: Error) =>
              toast(`Could not delete: ${e.message}`, 'error'),
            );
            toast('Deleted', 'info');
            router.replace('/history');
          }}
        >
          Delete entry
        </Button>
      )}
    </>
  );
}

export default function EditLogPage() {
  return (
    <AppShell hideNav>
      <Suspense fallback={<Spinner />}>
        <EditLog />
      </Suspense>
    </AppShell>
  );
}

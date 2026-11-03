'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SignedInOnly } from '@/components/app-shell';
import { HouseholdForm } from '@/components/household-form';
import { Card, PageHeader, Spinner } from '@/components/ui';
import { createHousehold } from '@/lib/data/household';
import { HouseholdProvider, useHouseholdState } from '@/providers/household-provider';
import { useSignedIn } from '@/providers/auth-provider';

function Onboarding() {
  const router = useRouter();
  const auth = useSignedIn();
  const state = useHouseholdState();

  // Someone who already has a household has nothing to do here.
  useEffect(() => {
    if (state.status === 'ready') router.replace('/');
  }, [state.status, router]);

  if (state.status === 'loading' || state.status === 'ready') return <Spinner />;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
      <PageHeader
        title="Let’s meet your dog"
        subtitle="This takes a minute. You can change everything later."
      />
      <Card>
        <HouseholdForm
          initial={{
            dogName: 'Joey',
            dogBreed: 'Toy Poodle',
            name: `${auth.name}’s home`,
          }}
          submitLabel="Create household"
          onSubmit={async (input) => {
            await createHousehold({ uid: auth.user.uid, name: auth.name }, input);
            router.replace('/');
          }}
        />
      </Card>
      <p className="text-center text-sm text-ink-muted">
        Someone already set this up?{' '}
        <Link href="/join" className="font-medium text-brand-strong underline">
          Join with an invite
        </Link>
      </p>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <SignedInOnly>
      <HouseholdProvider>
        <Onboarding />
      </HouseholdProvider>
    </SignedInOnly>
  );
}

'use client';

import { AccountSection } from '@/components/settings/account-section';
import { DogSection } from '@/components/settings/dog-section';
import { InviteSection } from '@/components/settings/invite-section';
import { MembersSection } from '@/components/settings/members-section';
import { PlacesSection } from '@/components/settings/places-section';
import { PageHeader } from '@/components/ui';

function Settings() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Dog, places, people and your account" />
      <DogSection />
      <PlacesSection />
      <MembersSection />
      <InviteSection />
      <AccountSection />
    </>
  );
}

export default function SettingsPage() {
  return <Settings />;
}

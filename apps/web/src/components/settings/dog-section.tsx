'use client';

import { updateHousehold } from '@/lib/data/household';
import { useHousehold } from '@/providers/household-provider';

import { HouseholdForm } from '../household-form';
import { Card, cx } from '../ui';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <dt className="text-sm text-ink-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function DogSection() {
  const { household, isOwner } = useHousehold();

  return (
    <section aria-labelledby="dog-heading" className="flex flex-col gap-3">
      <h2
        id="dog-heading"
        className={cx('text-sm font-semibold uppercase tracking-wide')}
      >
        Dog &amp; household
      </h2>
      <Card>
        {isOwner ? (
          <HouseholdForm
            initial={{
              name: household.name,
              dogName: household.dogName,
              dogBreed: household.dogBreed,
              dogBirthDate: household.dogBirthDate,
            }}
            submitLabel="Save changes"
            onSubmit={(input) => updateHousehold(household.id, input)}
          />
        ) : (
          <dl className="flex flex-col">
            <Row label="Dog" value={household.dogName} />
            <Row label="Breed" value={household.dogBreed ?? '—'} />
            <Row label="Household" value={household.name} />
            <Row
              label="Birthday"
              value={
                household.dogBirthDate ? household.dogBirthDate.toLocaleDateString() : '—'
              }
            />
            <p className="pt-3 text-sm text-ink-muted">
              Only the household owner can change these.
            </p>
          </dl>
        )}
      </Card>
    </section>
  );
}

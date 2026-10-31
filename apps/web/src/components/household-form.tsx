'use client';

import { useState, type FormEvent } from 'react';

import { householdInputSchema, type HouseholdInput } from '@walklogger/shared';

import { toLocalInputValue } from '@/lib/utils/datetime';

import { TextField } from './form';
import { Button, ErrorNote } from './ui';

type Props = {
  initial?: Partial<HouseholdInput>;
  submitLabel: string;
  onSubmit: (input: HouseholdInput) => Promise<void>;
};

export function HouseholdForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [dogName, setDogName] = useState(initial?.dogName ?? '');
  const [breed, setBreed] = useState(initial?.dogBreed ?? '');
  const [birth, setBirth] = useState(
    initial?.dogBirthDate ? toLocalInputValue(initial.dogBirthDate).slice(0, 10) : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const birthDate = birth ? new Date(`${birth}T12:00`) : null;
    const parsed = householdInputSchema.safeParse({
      name,
      dogName,
      dogBreed: breed.trim() || null,
      dogBirthDate: birthDate,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    if (birthDate && birthDate.getTime() > Date.now()) {
      setErrors({ dogBirthDate: 'Birthday cannot be in the future' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await onSubmit(parsed.data);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not save. Try again.');
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <TextField
        label="Dog's name"
        value={dogName}
        onChange={(e) => setDogName(e.target.value)}
        error={errors.dogName}
        autoComplete="off"
        maxLength={40}
      />
      <TextField
        label="Breed (optional)"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
        error={errors.dogBreed}
        autoComplete="off"
        maxLength={60}
      />
      <TextField
        label="Birthday (optional)"
        type="date"
        value={birth}
        max={toLocalInputValue(new Date()).slice(0, 10)}
        onChange={(e) => setBirth(e.target.value)}
        error={errors.dogBirthDate}
      />
      <TextField
        label="Household name"
        hint="Shown to people you invite, e.g. “The Cohens”."
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        autoComplete="off"
        maxLength={60}
      />
      {formError ? <ErrorNote>{formError}</ErrorNote> : null}
      <Button type="submit" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}

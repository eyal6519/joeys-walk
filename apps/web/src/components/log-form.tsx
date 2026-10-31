'use client';

import { useState, type FormEvent } from 'react';

import { flagsToPotty, type LogInput, type LogRecord, type LogType, type Potty } from '@walklogger/shared';

import { buildLogInput, OTHER } from '@/lib/log-form-model';
import { fromLocalInputValue, toLocalInputValue } from '@/lib/utils/datetime';
import { useHousehold } from '@/providers/household-provider';

import { ChoiceGroup, TextArea, TextField, type Option } from './form';
import { LogTypeToggle } from './log-type-toggle';
import { Button, ErrorNote } from './ui';

const WALK_OPTIONS: readonly Option<Potty>[] = [
  { value: 'pee', label: 'Pee', icon: '💧' },
  { value: 'poop', label: 'Poop', icon: '💩' },
  { value: 'both', label: 'Both', icon: '💧💩' },
  { value: 'neither', label: 'Neither', icon: '➖' },
];
const HOME_OPTIONS = WALK_OPTIONS.filter((o) => o.value !== 'neither');

export type LogFormInitial = {
  type: LogType;
  occurredAt: Date;
  durationMin: number | null;
  existing?: LogRecord;
};

type Props = {
  initial: LogFormInitial;
  submitLabel: string;
  /** Callers must not await server acknowledgement: this has to work offline. */
  onSubmit: (input: LogInput) => void;
  onCancel: () => void;
};

export function LogForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const { places, members, actor } = useHousehold();
  const existing = initial.existing;
  const selectable = places.filter((p) => !p.archived || p.id === existing?.placeId);

  const [type, setType] = useState<LogType>(initial.type);
  const [when, setWhen] = useState(toLocalInputValue(initial.occurredAt));
  const [potty, setPotty] = useState<Potty | null>(existing ? flagsToPotty(existing.pee, existing.poop) : null);
  const [duration, setDuration] = useState(initial.durationMin === null ? '' : String(initial.durationMin));
  const [note, setNote] = useState(existing?.note ?? '');
  const [walker, setWalker] = useState<string>(existing ? (existing.walkerUid ?? OTHER) : actor.uid);
  const [walkerOther, setWalkerOther] = useState(existing && !existing.walkerUid ? (existing.walkerName ?? '') : '');
  const [place, setPlace] = useState<string>(existing ? (existing.placeId ?? OTHER) : (selectable[0]?.id ?? OTHER));
  const [placeOther, setPlaceOther] = useState(existing && !existing.placeId ? (existing.placeLabel ?? '') : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const walkerOptions: Option<string>[] = [
    ...members.map((m) => ({
      value: m.uid,
      label: m.uid === actor.uid ? `${m.displayName} (me)` : m.displayName,
    })),
    { value: OTHER, label: 'Someone else' },
  ];
  const placeOptions: Option<string>[] = [
    ...selectable.map((p) => ({ value: p.id, label: p.label, icon: p.icon ?? undefined })),
    { value: OTHER, label: 'Somewhere else', icon: '✏️' },
  ];

  function changeType(next: LogType) {
    setType(next);
    if (next === 'home' && potty === 'neither') setPotty(null);
    setErrors({});
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const values = { type, when: fromLocalInputValue(when), potty, note, walker, walkerOther, duration, place, placeOther };
    const result = buildLogInput(values, members, places);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      {!existing && <LogTypeToggle value={type} onChange={changeType} />}

      <ChoiceGroup
        legend={type === 'walk' ? 'What did Joey do?' : 'What was found?'}
        name="potty"
        value={potty}
        onChange={setPotty}
        options={type === 'walk' ? WALK_OPTIONS : HOME_OPTIONS}
        error={errors.potty}
      />

      {type === 'walk' ? (
        <>
          <ChoiceGroup legend="Who took him?" name="walker" value={walker} onChange={setWalker} options={walkerOptions} />
          {walker === OTHER && (
            <TextField
              label="Their name"
              value={walkerOther}
              onChange={(e) => setWalkerOther(e.target.value)}
              error={errors.walkerName}
              maxLength={60}
              autoComplete="off"
            />
          )}
          <TextField
            label="How long (minutes)"
            type="number"
            inputMode="numeric"
            min={0}
            max={1440}
            step={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            error={errors.durationMin}
          />
        </>
      ) : (
        <>
          <ChoiceGroup legend="Where?" name="place" value={place} onChange={setPlace} options={placeOptions} />
          {place === OTHER && (
            <TextField
              label="Where exactly?"
              value={placeOther}
              onChange={(e) => setPlaceOther(e.target.value)}
              error={errors.placeLabel}
              maxLength={60}
              autoComplete="off"
              placeholder="e.g. behind the sofa"
            />
          )}
        </>
      )}

      <TextField
        label={type === 'walk' ? 'When did the walk start?' : 'When was it found?'}
        type="datetime-local"
        value={when}
        onChange={(e) => setWhen(e.target.value)}
        error={errors.occurredAt}
      />

      <TextArea label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} error={errors.note} maxLength={500} />

      {errors.form ? <ErrorNote>{errors.form}</ErrorNote> : null}

      <div className="flex gap-3">
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

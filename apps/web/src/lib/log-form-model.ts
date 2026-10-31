import {
  logInputSchema,
  pottyToFlags,
  type LogInput,
  type LogType,
  type Member,
  type Place,
  type Potty,
} from '@walklogger/shared';

/** Sentinel select value meaning "none of the listed options, I will type it". */
export const OTHER = '__other__';

export type LogFormValues = {
  type: LogType;
  when: Date;
  potty: Potty | null;
  note: string;
  walker: string;
  walkerOther: string;
  duration: string;
  place: string;
  placeOther: string;
};

export type BuildResult =
  | { ok: true; input: LogInput }
  | { ok: false; errors: Record<string, string> };

/**
 * Turns raw form state into a validated LogInput, or per-field error messages.
 * Kept pure so every branch is unit-testable without rendering anything.
 */
export function buildLogInput(
  values: LogFormValues,
  members: readonly Member[],
  places: readonly Place[],
): BuildResult {
  const flags = values.potty ? pottyToFlags(values.potty) : { pee: false, poop: false };
  const note = values.note.trim() || null;

  let candidate: unknown;
  if (values.type === 'walk') {
    const member = members.find((m) => m.uid === values.walker);
    candidate = {
      type: 'walk',
      occurredAt: values.when,
      ...flags,
      walkerUid: member ? member.uid : null,
      walkerName: member ? member.displayName : values.walkerOther,
      durationMin: values.duration.trim() === '' ? null : Number(values.duration),
      note,
    };
  } else {
    const place = places.find((p) => p.id === values.place);
    candidate = {
      type: 'home',
      occurredAt: values.when,
      ...flags,
      placeId: place ? place.id : null,
      placeLabel: place ? place.label : values.placeOther,
      note,
    };
  }

  const errors: Record<string, string> = {};
  if (!values.potty) errors.potty = values.type === 'walk' ? 'What did Joey do?' : 'What was found?';

  const parsed = logInputSchema.safeParse(candidate);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      errors[key === 'pee' || key === 'poop' ? 'potty' : key] ??= issue.message;
    }
  }
  if (!parsed.success || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, input: parsed.data };
}

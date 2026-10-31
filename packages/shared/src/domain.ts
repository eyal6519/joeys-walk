import { z } from 'zod';

/** What Joey did. `neither` is only meaningful for walks ("went out, nothing happened"). */
export const POTTY_VALUES = ['pee', 'poop', 'both', 'neither'] as const;
export type Potty = (typeof POTTY_VALUES)[number];

export const LOG_TYPES = ['home', 'walk'] as const;
export type LogType = (typeof LOG_TYPES)[number];

export function pottyToFlags(potty: Potty): { pee: boolean; poop: boolean } {
  return {
    pee: potty === 'pee' || potty === 'both',
    poop: potty === 'poop' || potty === 'both',
  };
}

export function flagsToPotty(pee: boolean, poop: boolean): Potty {
  if (pee && poop) return 'both';
  if (pee) return 'pee';
  if (poop) return 'poop';
  return 'neither';
}

/** Clock skew allowance: a log may be at most this far in the future. */
export const MAX_FUTURE_MS = 10 * 60 * 1000;

const occurredAt = z
  .date()
  .refine((d) => !Number.isNaN(d.getTime()), { message: 'Pick a valid date and time' })
  .refine((d) => d.getTime() <= Date.now() + MAX_FUTURE_MS, {
    message: 'That time is in the future',
  });

const note = z
  .string()
  .trim()
  .max(500, 'Keep notes under 500 characters')
  .nullable()
  .transform((value) => (value === '' ? null : value));

export const homeLogInputSchema = z
  .object({
    type: z.literal('home'),
    occurredAt,
    pee: z.boolean(),
    poop: z.boolean(),
    placeId: z.string().min(1).nullable(),
    placeLabel: z
      .string()
      .trim()
      .min(1, 'Say where it was found')
      .max(60, 'Keep the place under 60 characters'),
    note,
  })
  .refine((value) => value.pee || value.poop, {
    message: 'Pick what was found',
    path: ['pee'],
  });

export const walkLogInputSchema = z.object({
  type: z.literal('walk'),
  occurredAt,
  pee: z.boolean(),
  poop: z.boolean(),
  walkerUid: z.string().min(1).nullable(),
  walkerName: z
    .string()
    .trim()
    .min(1, 'Say who took Joey out')
    .max(60, 'Keep the name under 60 characters'),
  durationMin: z
    .number('Duration must be a number')
    .int('Use whole minutes')
    .min(0, 'Duration cannot be negative')
    .max(1440, 'A walk cannot last more than 24 hours')
    .nullable(),
  note,
});

export const logInputSchema = z.discriminatedUnion('type', [
  homeLogInputSchema,
  walkLogInputSchema,
]);

export type HomeLogInput = z.infer<typeof homeLogInputSchema>;
export type WalkLogInput = z.infer<typeof walkLogInputSchema>;
export type LogInput = z.infer<typeof logInputSchema>;

/** A log as read back from storage. Fields not relevant to the type are `null`. */
export type LogRecord = {
  id: string;
  type: LogType;
  occurredAt: Date;
  pee: boolean;
  poop: boolean;
  note: string | null;
  placeId: string | null;
  placeLabel: string | null;
  walkerUid: string | null;
  walkerName: string | null;
  durationMin: number | null;
  createdBy: string;
  createdByName: string;
};

export const placeInputSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Give the place a name')
    .max(40, 'Keep it under 40 characters'),
  icon: z.string().trim().max(8).nullable(),
});
export type PlaceInput = z.infer<typeof placeInputSchema>;

export type Place = {
  id: string;
  label: string;
  icon: string | null;
  order: number;
  archived: boolean;
};

export const DEFAULT_PLACES: readonly { label: string; icon: string }[] = [
  { label: 'Living room', icon: '🛋️' },
  { label: 'Kitchen', icon: '🍳' },
  { label: 'Bedroom', icon: '🛏️' },
  { label: 'Bathroom', icon: '🚿' },
  { label: 'Hallway', icon: '🚪' },
  { label: 'Balcony', icon: '🌿' },
];

export const householdInputSchema = z.object({
  name: z.string().trim().min(1, 'Name your household').max(60),
  dogName: z.string().trim().min(1, "What is the dog's name?").max(40),
  dogBreed: z.string().trim().max(60).nullable(),
  dogBirthDate: z.date().nullable(),
});
export type HouseholdInput = z.infer<typeof householdInputSchema>;

export type Household = {
  id: string;
  name: string;
  ownerUid: string;
  dogName: string;
  dogBreed: string | null;
  dogBirthDate: Date | null;
};

export type Member = {
  uid: string;
  displayName: string;
  role: 'owner' | 'member';
};

export const INVITE_TTL_DAYS = 7;

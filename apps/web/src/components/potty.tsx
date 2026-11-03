import { lastPottyAt, type LogRecord, type Potty } from '@walklogger/shared';

import { BothIcon, NoneIcon, PeeIcon, PoopIcon } from './icons';

/**
 * Single source of truth for how a potty result is presented: its key, label,
 * icon and tint. The composer, the entry row and the Today summary all read
 * from here, so a result can never look different in two places.
 */
export const POTTY_ORDER = ['pee', 'poop', 'both', 'neither'] as const;

export const POTTY_ICON = {
  pee: PeeIcon,
  poop: PoopIcon,
  both: BothIcon,
  neither: NoneIcon,
} as const;

export const POTTY_LABEL: Record<Potty, string> = {
  pee: 'Pee',
  poop: 'Poop',
  both: 'Both',
  neither: 'Neither',
};

export const POTTY_TONE: Record<Potty, string> = {
  pee: 'text-pee bg-[color-mix(in_oklab,var(--color-pee)_14%,transparent)]',
  poop: 'text-poop bg-[color-mix(in_oklab,var(--color-poop)_14%,transparent)]',
  both: 'text-brand-strong bg-brand-soft',
  neither: 'text-ink-muted bg-surface-sunken',
};

/** The icon-only tint for a result, for places the badge background does not belong. */
export const POTTY_ICON_COLOR: Record<Potty, string> = {
  pee: 'text-pee',
  poop: 'text-poop',
  both: 'text-brand-strong',
  neither: '',
};

export function pottyKey(log: Pick<LogRecord, 'pee' | 'poop'>): Potty {
  if (log.pee && log.poop) return 'both';
  if (log.pee) return 'pee';
  if (log.poop) return 'poop';
  return 'neither';
}

export function describePotty(log: Pick<LogRecord, 'pee' | 'poop'>): string {
  const key = pottyKey(log);
  return key === 'neither' ? 'Nothing this time' : POTTY_LABEL[key];
}

/** The last entry that recorded a pee or a poop, as a record (not just its time). */
export function lastPottyLog(logs: readonly LogRecord[]): LogRecord | null {
  const at = lastPottyAt(logs);
  if (!at) return null;
  const time = at.getTime();
  return (
    logs.find((log) => (log.pee || log.poop) && log.occurredAt.getTime() === time) ?? null
  );
}

export function describeLast(log: LogRecord): string {
  const where =
    log.type === 'walk'
      ? `Walk with ${log.walkerName ?? 'someone'}`
      : (log.placeLabel ?? 'at home');
  return `${describePotty(log)} · ${where}`;
}

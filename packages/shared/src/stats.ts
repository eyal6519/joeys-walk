import type { LogRecord } from './domain';

export type StatLog = Pick<
  LogRecord,
  | 'type'
  | 'occurredAt'
  | 'pee'
  | 'poop'
  | 'walkerUid'
  | 'walkerName'
  | 'durationMin'
  | 'placeLabel'
>;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export type Summary = {
  walks: number;
  homeFinds: number;
  pee: number;
  poop: number;
};

export function summarize(logs: readonly StatLog[]): Summary {
  const summary: Summary = { walks: 0, homeFinds: 0, pee: 0, poop: 0 };
  for (const log of logs) {
    if (log.type === 'walk') summary.walks += 1;
    else summary.homeFinds += 1;
    if (log.pee) summary.pee += 1;
    if (log.poop) summary.poop += 1;
  }
  return summary;
}

export type DayBucket = Summary & { key: string; date: Date };

/** One bucket per calendar day, oldest first, ending on the day of `now`. Empty days are kept. */
export function dailyBuckets(
  logs: readonly StatLog[],
  days: number,
  now: Date,
): DayBucket[] {
  const today = startOfDay(now);
  const buckets = new Map<string, DayBucket>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    buckets.set(dayKey(date), {
      key: dayKey(date),
      date,
      walks: 0,
      homeFinds: 0,
      pee: 0,
      poop: 0,
    });
  }
  for (const log of logs) {
    const bucket = buckets.get(dayKey(log.occurredAt));
    if (!bucket) continue;
    if (log.type === 'walk') bucket.walks += 1;
    else bucket.homeFinds += 1;
    if (log.pee) bucket.pee += 1;
    if (log.poop) bucket.poop += 1;
  }
  return [...buckets.values()];
}

/** Longest stretch between two consecutive potty events (pee or poop), in ms. */
export function longestGapMs(logs: readonly StatLog[]): number | null {
  const times = logs
    .filter((log) => log.pee || log.poop)
    .map((log) => log.occurredAt.getTime())
    .sort((a, b) => a - b);
  if (times.length < 2) return null;
  let longest = 0;
  for (let i = 1; i < times.length; i += 1) {
    longest = Math.max(longest, (times[i] as number) - (times[i - 1] as number));
  }
  return longest;
}

export function lastPottyAt(logs: readonly StatLog[]): Date | null {
  let latest: Date | null = null;
  for (const log of logs) {
    if (!(log.pee || log.poop)) continue;
    if (!latest || log.occurredAt > latest) latest = log.occurredAt;
  }
  return latest;
}

export type WalkerStat = { name: string; walks: number; totalMin: number };

export function walkerBreakdown(logs: readonly StatLog[]): WalkerStat[] {
  const byKey = new Map<string, WalkerStat>();
  for (const log of logs) {
    if (log.type !== 'walk') continue;
    const name = log.walkerName?.trim() || 'Unknown';
    const key = log.walkerUid ?? `name:${name.toLowerCase()}`;
    const entry = byKey.get(key) ?? { name, walks: 0, totalMin: 0 };
    entry.walks += 1;
    entry.totalMin += log.durationMin ?? 0;
    byKey.set(key, entry);
  }
  return [...byKey.values()].sort(
    (a, b) =>
      b.walks - a.walks || b.totalMin - a.totalMin || a.name.localeCompare(b.name),
  );
}

export type PlaceStat = { label: string; count: number };

export function placeBreakdown(logs: readonly StatLog[]): PlaceStat[] {
  const byLabel = new Map<string, PlaceStat>();
  for (const log of logs) {
    if (log.type !== 'home' || !log.placeLabel) continue;
    const key = log.placeLabel.trim().toLowerCase();
    const entry = byLabel.get(key) ?? { label: log.placeLabel.trim(), count: 0 };
    entry.count += 1;
    byLabel.set(key, entry);
  }
  return [...byLabel.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

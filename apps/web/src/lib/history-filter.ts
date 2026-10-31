import { dayKey, type LogRecord, type LogType } from '@walklogger/shared';

export type HistoryFilter = {
  type: LogType | 'all';
  /** Account uid, or 'all'. Matches walker for walks and author for home finds. */
  person: string;
  days: 7 | 30 | 90 | 0;
};

export const DEFAULT_FILTER: HistoryFilter = { type: 'all', person: 'all', days: 30 };

export function applyFilter(
  logs: readonly LogRecord[],
  filter: HistoryFilter,
  now: Date,
): LogRecord[] {
  const cutoff = filter.days === 0 ? null : now.getTime() - filter.days * 86_400_000;
  return logs.filter((log) => {
    if (filter.type !== 'all' && log.type !== filter.type) return false;
    if (cutoff !== null && log.occurredAt.getTime() < cutoff) return false;
    if (filter.person !== 'all') {
      const who = log.type === 'walk' ? (log.walkerUid ?? log.createdBy) : log.createdBy;
      if (who !== filter.person) return false;
    }
    return true;
  });
}

export type DayGroup = { key: string; date: Date; logs: LogRecord[] };

/** Groups newest-first logs by local calendar day, preserving order. */
export function groupByDay(logs: readonly LogRecord[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const log of logs) {
    const key = dayKey(log.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.logs.push(log);
    else groups.push({ key, date: log.occurredAt, logs: [log] });
  }
  return groups;
}

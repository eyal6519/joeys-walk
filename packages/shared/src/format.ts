/** "12 min", "1 h 05 min", "2 d 3 h". Input in milliseconds. */
export function formatSpan(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60_000));
  if (totalMin < 60) return `${totalMin} min`;
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (hours < 24)
    return minutes === 0
      ? `${hours} h`
      : `${hours} h ${String(minutes).padStart(2, '0')} min`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours === 0 ? `${days} d` : `${days} d ${remHours} h`;
}

/** "just now", "12 min ago", "3 h 05 min ago". */
export function formatAgo(then: Date, now: Date): string {
  const diff = now.getTime() - then.getTime();
  if (diff < 60_000) return 'just now';
  return `${formatSpan(diff)} ago`;
}

/** Whole minutes for a stopwatch-style label: "07:42" or "1:07:42". */
export function formatStopwatch(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

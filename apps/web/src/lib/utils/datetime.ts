const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date for `<input type="datetime-local">` in the user's local time zone. */
export function toLocalInputValue(date: Date): string {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Parses a `datetime-local` value as local time. Returns an Invalid Date for bad input. */
export function fromLocalInputValue(value: string): Date {
  return new Date(value);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDayHeading(date: Date, now: Date): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

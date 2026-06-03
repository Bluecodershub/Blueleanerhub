export function getUTCDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));
}

export function toUTCISOString(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString();
}

export function formatDateForUser(date: Date | string | number, timezone?: string): string {
  const d = new Date(date);
  if (timezone) {
    return d.toLocaleString('en-US', { timeZone: timezone });
  }
  return d.toLocaleString('en-US', { timeZone: 'UTC' });
}

export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
}

export function getMonthStart(date: Date = new Date()): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
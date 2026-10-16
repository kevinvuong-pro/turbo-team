export type EventImpact = 'positive' | 'negative' | null;

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);

  next.setUTCDate(next.getUTCDate() + days);

  return next;
}

export function getMondayOfWeek(reference = new Date()): Date {
  const date = new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()),
  );
  const day = date.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diffToMonday);

  return date;
}

export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addUtcDays(monday, index));
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function toNumber(value: { toString(): string } | number | null | undefined): number {
  if (value === null || value === undefined) return 0;

  return Number(value);
}

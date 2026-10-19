/** Formats an ISO timestamp for display; non-date strings are shown unchanged. */
export function formatDateTime(value: string | undefined, locale = 'en-GB'): string {
  if (!value) return '';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDate(value: string | undefined, locale = 'en-GB'): string {
  if (!value) return '';
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString(locale, { dateStyle: 'medium' });
}

export function formatXaf(amount: number, locale = 'en-US'): string {
  return `${Math.round(amount).toLocaleString(locale)} XAF`;
}

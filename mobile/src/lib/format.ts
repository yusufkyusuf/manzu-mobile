const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 });

export function formatNaira(amount: number | null | undefined): string {
  return naira.format(Number(amount ?? 0));
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatTime(value: number | Date): string {
  return new Date(value).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

/** Web-style amount: `₦${n.toLocaleString()}` (no forced decimals), as the dashboard renders it. */
export function formatNairaShort(amount: number | null | undefined): string {
  return `₦${Number(amount ?? 0).toLocaleString('en-US')}`;
}

/** e.g. "Nov 4, 07:33 PM", the web dashboard's mobile activity format. */
export function formatShortDateTime(value: string | number | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

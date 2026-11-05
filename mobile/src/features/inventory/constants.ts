import { colors } from '@/theme';

import type { CatalogMedication, CatalogStatus, MedicationIngredientInfo, PrescriptionFilter, StockFilter } from './types';

/** inventory/page.jsx statusMap. */
export const STOCK_FILTER_STATUS: Record<StockFilter, CatalogStatus> = {
  stocked: 'stocked',
  not_stocked: 'not_stocked',
  low: 'low_stock',
  out: 'out_of_stock',
  expiring: 'expiring_soon',
};

/** The web select: placeholder "In Stock" (= stocked) plus these options. */
export const STOCK_FILTER_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'stocked', label: 'In Stock' },
  { value: 'not_stocked', label: 'Not Stocked' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'expiring', label: 'Expiring Soon (30 days)' },
];

export const PRESCRIPTION_FILTER_OPTIONS: { value: PrescriptionFilter; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'true', label: 'Prescription Required' },
  { value: 'false', label: 'OTC' },
];

/** Backend thresholds: low = 0 < stock < 10, out = 0. */
export const LOW_STOCK_THRESHOLD = 10;

/** inventory/page.jsx getStockBadge(item). */
export function stockBadge(item: Pick<CatalogMedication, 'isStocked' | 'stock'>): { label: string; bg: string; fg: string } {
  if (!item.isStocked) return { label: 'Not Stocked', bg: colors.gray100, fg: colors.gray600 };
  if (item.stock === 0) return { label: 'Out of Stock', bg: colors.red100, fg: colors.red800 };
  if ((item.stock ?? 0) < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', bg: colors.yellow100, fg: colors.yellow800 };
  return { label: 'In Stock', bg: colors.green100, fg: colors.green800 };
}

export function daysUntil(date: string | Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/** inventory/page.jsx formatExpiryDate. */
export function expiryDisplay(date: string | null): { text: string; color: string; bold: boolean } {
  if (!date) return { text: 'Not set', color: colors.gray900, bold: false };
  const days = daysUntil(date);
  if (days < 0) return { text: 'Expired', color: colors.red600, bold: true };
  const text = new Date(date).toLocaleDateString();
  return days < 30 ? { text, color: colors.orange600, bold: true } : { text, color: colors.gray900, bold: false };
}

/** inventory/page.jsx formatIngredients (fallback when activeSubstances is empty). */
export function formatIngredientNames(ingredients: MedicationIngredientInfo[] | null | undefined): string {
  const names = (ingredients ?? []).map((i) => i.activeSubstanceName).filter((n): n is string => !!n);
  if (names.length === 0) return 'Not specified';
  if (names.length <= 2) return names.join(' / ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

/** UTC calendar date, as the web's toISOString().split('T')[0]. */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

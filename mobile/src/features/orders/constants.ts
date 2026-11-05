import { CheckCircle, CheckSquare, Clock, Package, Truck, XCircle, type LucideIcon } from 'lucide-react-native';

import { colors } from '@/theme';

import type { DeliveryMethod, DeliveryMethodFilter, OrderStatusFilter, UpdatableOrderStatus } from './types';

type DeliveryKey = 'courier' | 'pickup';

/** OrderDetailsDialog.jsx allStatusOptions: offered by delivery method regardless of current status (PLAN D1). */
export const STATUS_OPTIONS: { value: UpdatableOrderStatus; label: string; color: string; icon: LucideIcon; forDelivery: DeliveryKey[] }[] = [
  { value: 'PROCESSING', label: 'Processing', color: '#3B82F6', icon: Package, forDelivery: ['courier', 'pickup'] },
  { value: 'SHIPPED', label: 'Shipped', color: '#06B6D4', icon: Truck, forDelivery: ['courier'] },
  { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup', color: '#8B5CF6', icon: CheckCircle, forDelivery: ['pickup'] },
  { value: 'DELIVERED', label: 'Delivered', color: '#10B981', icon: CheckCircle, forDelivery: ['courier'] },
  { value: 'COMPLETED', label: 'Completed', color: '#10B981', icon: CheckCircle, forDelivery: ['courier', 'pickup'] },
  { value: 'CANCELLED', label: 'Cancelled', color: '#EF4444', icon: XCircle, forDelivery: ['courier', 'pickup'] },
];

export const STATUS_LABELS: Record<UpdatableOrderStatus, string> = {
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  READY_FOR_PICKUP: 'Ready for Pickup',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function statusOptionsFor(deliveryMethod: DeliveryMethod | null | undefined) {
  const key = deliveryMethod?.toLowerCase();
  return STATUS_OPTIONS.filter((opt) => opt.forDelivery.includes(key as DeliveryKey));
}

/** OrderDetailsDialog.jsx CANCEL_REASONS. */
export const DETAIL_CANCEL_REASONS = [
  'Out of stock',
  'Medication unavailable',
  'Expired prescription',
  'Customer request',
  'Pricing error',
  'Unable to verify prescription',
  'Delivery area not covered',
  'Other',
];

/** orders/page.jsx CANCEL_REASONS (bulk). */
export const BULK_CANCEL_REASONS = [
  'Out of stock',
  'Medication unavailable',
  'Expired prescription',
  'Customer request',
  'Pricing error',
  'Unable to verify prescription',
  'Other',
];

/** validateBulkUpdateOrders: orderIds max 50. */
export const MAX_BULK_ORDERS = 50;

/** orders/page.jsx capitalizeWords (lowercases first). */
export function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/_/g, ' ');
}

/** OrderDetailsDialog.jsx capitalizeWords (no lowercasing, so enum values stay upper case). */
export function dialogCapitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/_/g, ' ');
}

/** orders/page.jsx getStatusBadge colours (CONFIRMED shown as PENDING). */
export function listStatusBadge(status: string): { label: string; bg: string; fg: string; border: string; icon: LucideIcon } {
  const display = status === 'CONFIRMED' ? 'PENDING' : status;
  const label = titleCase(display);
  switch (display.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return { label, bg: colors.green100, fg: colors.green800, border: colors.green300, icon: CheckCircle };
    case 'ready_for_pickup':
      return { label, bg: colors.purple100, fg: colors.purple800, border: colors.purple300, icon: CheckSquare };
    case 'shipped':
      return { label, bg: colors.blue100, fg: colors.blue800, border: colors.blue300, icon: Truck };
    case 'processing':
      return { label, bg: colors.cyan100, fg: colors.cyan800, border: colors.cyan300, icon: Package };
    case 'pending':
    case 'confirmed':
      return { label, bg: colors.yellow100, fg: colors.yellow800, border: colors.yellow300, icon: Clock };
    case 'cancelled':
      return { label, bg: colors.red100, fg: colors.red800, border: colors.red300, icon: XCircle };
    default:
      return { label, bg: colors.gray100, fg: colors.gray800, border: colors.gray300, icon: Clock };
  }
}

export const STATUS_FILTER_OPTIONS: { value: OrderStatusFilter; label: string }[] = [
  { value: 'CONFIRMED', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const DELIVERY_FILTER_OPTIONS: { value: DeliveryMethodFilter; label: string }[] = [
  { value: 'COURIER', label: 'Delivery' },
  { value: 'PICKUP', label: 'Pickup' },
];

/** orders/page.jsx BulkActionBar: availability depends on the selected orders' delivery methods. */
export function bulkActionsFor(deliveryMethods: (DeliveryMethod | null)[]) {
  const unique = [...new Set(deliveryMethods.map((m) => m?.toLowerCase()))];
  const isMixed = unique.length > 1;
  const allPickup = unique.length === 1 && unique[0] === 'pickup';
  const allCourier = unique.length === 1 && unique[0] === 'courier';
  const actions: { value: UpdatableOrderStatus; label: string; icon: LucideIcon; color: string; available: boolean }[] = [
    { value: 'PROCESSING', label: 'Mark as Processing', icon: Package, color: colors.blue600, available: true },
    { value: 'SHIPPED', label: 'Mark as Shipped', icon: Truck, color: '#0891B2', available: allCourier },
    { value: 'READY_FOR_PICKUP', label: 'Mark as Ready for Pickup', icon: CheckSquare, color: colors.purple600, available: allPickup },
    { value: 'DELIVERED', label: 'Mark as Delivered', icon: CheckCircle, color: colors.green600, available: allCourier },
    { value: 'COMPLETED', label: 'Mark as Completed', icon: CheckCircle, color: colors.green600, available: true },
    { value: 'CANCELLED', label: 'Cancel Orders', icon: XCircle, color: colors.red600, available: true },
  ];
  return { isMixed, actions: actions.filter((a) => a.available) };
}

/** The web's quick date filters use toISOString(), i.e. the UTC calendar day (matches the backend's UTC day filter). */
export function utcDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0] ?? '';
}

export const EMPTY_FILTERS = { search: '', status: '', deliveryMethod: '', date: '' } as const;

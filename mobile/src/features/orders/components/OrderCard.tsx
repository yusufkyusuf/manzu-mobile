import { Calendar, CheckSquare, DollarSign, FileText, ShoppingCart, Square, User } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import type { OrderSummary } from '../types';
import { DeliveryBadge, OrderStatusBadge } from './Badges';

interface OrderCardProps {
  order: OrderSummary;
  selected: boolean;
  selectionMode: boolean;
  selectable: boolean;
  onPress: (order: OrderSummary) => void;
  onToggleSelect: (order: OrderSummary) => void;
}

// orders/page.jsx renderMobileCard. Tap opens details; long-press (or the checkbox) selects for bulk actions.
export const OrderCard = memo(function OrderCard({ order, selected, selectionMode, selectable, onPress, onToggleSelect }: OrderCardProps) {
  const CheckIcon = selected ? CheckSquare : Square;
  return (
    <Pressable
      onPress={() => (selectionMode ? onToggleSelect(order) : onPress(order))}
      onLongPress={selectable ? () => onToggleSelect(order) : undefined}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.sn ?? ''}, ${order.name ?? ''}`}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.card, shadows.sm, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        {selectable ? (
          <Pressable onPress={() => onToggleSelect(order)} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} accessibilityLabel="Select order">
            <CheckIcon size={20} color={selected ? colors.primary : colors.gray400} />
          </Pressable>
        ) : null}
        <View style={styles.flex}>
          <View style={styles.inline}>
            <ShoppingCart size={14} color={colors.brandBlue} />
            <Text weight="bold" color={colors.gray900}>
              Order #{order.sn ?? '—'}
            </Text>
          </View>
          <View style={styles.inline}>
            <User size={12} color={colors.gray600} />
            <Text size="xs" color={colors.gray600} numberOfLines={1} style={styles.flex}>
              {order.name}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={[styles.inline, styles.flex]}>
          <Calendar size={12} color={colors.gray500} />
          <Text size="xs" color={colors.gray700}>
            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={[styles.inline, styles.flex]}>
          <DollarSign size={12} color={colors.gray500} />
          <Text size="xs" weight="semibold" color={colors.gray900}>
            {formatNairaShort(order.totalPrice)}
          </Text>
        </View>
      </View>

      <View style={styles.badges}>
        <OrderStatusBadge status={order.status} />
        <DeliveryBadge method={order.deliveryMethod} />
      </View>

      {order.prescription ? (
        <View style={styles.rxRow}>
          <View style={styles.rx}>
            <FileText size={12} color={colors.orange600} />
            <Text size="xs" weight="medium" color={colors.orange600}>
              Prescription Required
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg, padding: 12, gap: 12 },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  grid: { flexDirection: 'row', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
  rxRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
  rx: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.orange50, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.lg },
});

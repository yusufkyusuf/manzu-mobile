import { MapPin, Truck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import { listStatusBadge, titleCase } from '../constants';
import type { DeliveryMethod } from '../types';

export function OrderStatusBadge({ status }: { status: string }) {
  const { label, bg, fg, border, icon: Icon } = listStatusBadge(status);
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
      <Icon size={12} color={fg} />
      <Text size="xs" weight="semibold" color={fg}>
        {label}
      </Text>
    </View>
  );
}

export function DeliveryBadge({ method }: { method: DeliveryMethod | null }) {
  const isPickup = method?.toLowerCase() === 'pickup';
  const bg = isPickup ? colors.blue50 : colors.green50;
  const fg = isPickup ? colors.blue700 : colors.green700;
  const border = isPickup ? colors.blue200 : colors.green200;
  const Icon = isPickup ? MapPin : Truck;
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
      <Icon size={12} color={fg} />
      <Text size="xs" weight="medium" color={fg}>
        {titleCase(method)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1, alignSelf: 'flex-start' },
});

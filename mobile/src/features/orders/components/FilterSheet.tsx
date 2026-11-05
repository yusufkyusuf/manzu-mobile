import { StyleSheet, View } from 'react-native';

import { Button, RadioRow, Sheet, Text } from '@/components/ui';
import { colors } from '@/theme';

import { DELIVERY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '../constants';
import type { OrderFilters } from '../types';

interface FilterSheetProps {
  visible: boolean;
  filters: OrderFilters;
  onChange: (patch: Partial<OrderFilters>) => void;
  onClose: () => void;
}

// The web DataTableView's two filter selects ("All Statuses", "All Delivery Methods").
export function FilterSheet({ visible, filters, onChange, onClose }: FilterSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Filters">
      <View style={styles.group}>
        <Text weight="semibold" color={colors.gray700}>
          Status
        </Text>
        <RadioRow label="All Statuses" selected={!filters.status} onPress={() => onChange({ status: '' })} />
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <RadioRow key={opt.value} label={opt.label} selected={filters.status === opt.value} onPress={() => onChange({ status: opt.value })} />
        ))}
      </View>
      <View style={styles.group}>
        <Text weight="semibold" color={colors.gray700}>
          Delivery Method
        </Text>
        <RadioRow label="All Delivery Methods" selected={!filters.deliveryMethod} onPress={() => onChange({ deliveryMethod: '' })} />
        {DELIVERY_FILTER_OPTIONS.map((opt) => (
          <RadioRow key={opt.value} label={opt.label} selected={filters.deliveryMethod === opt.value} onPress={() => onChange({ deliveryMethod: opt.value })} />
        ))}
      </View>
      <Button title="Done" variant="gradient" fullWidth onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
});

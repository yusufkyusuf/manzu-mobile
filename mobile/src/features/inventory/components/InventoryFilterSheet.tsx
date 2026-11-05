import { StyleSheet, View } from 'react-native';

import { Button, RadioRow, Sheet, Text } from '@/components/ui';
import { colors } from '@/theme';

import { PRESCRIPTION_FILTER_OPTIONS, STOCK_FILTER_OPTIONS } from '../constants';
import type { InventoryFilters } from '../types';

interface Props {
  visible: boolean;
  filters: InventoryFilters;
  onChange: (patch: Partial<InventoryFilters>) => void;
  onClose: () => void;
}

export function InventoryFilterSheet({ visible, filters, onChange, onClose }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Filters">
      <View style={styles.group}>
        <Text weight="semibold" color={colors.gray700}>
          Stock
        </Text>
        {STOCK_FILTER_OPTIONS.map((opt) => (
          <RadioRow key={opt.value} label={opt.label} selected={filters.stock === opt.value} onPress={() => onChange({ stock: opt.value })} />
        ))}
      </View>
      <View style={styles.group}>
        <Text weight="semibold" color={colors.gray700}>
          Type
        </Text>
        {PRESCRIPTION_FILTER_OPTIONS.map((opt) => (
          <RadioRow key={opt.label} label={opt.label} selected={filters.prescription === opt.value} onPress={() => onChange({ prescription: opt.value })} />
        ))}
      </View>
      <Button title="Done" variant="gradient" fullWidth onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
});

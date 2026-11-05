import { CheckSquare, List, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Sheet, Text } from '@/components/ui';
import { colors, radius, shadows } from '@/theme';

import { bulkActionsFor } from '../constants';
import type { DeliveryMethod, UpdatableOrderStatus } from '../types';

interface BulkActionBarProps {
  selectedCount: number;
  deliveryMethods: (DeliveryMethod | null)[];
  disabled: boolean;
  onAction: (status: UpdatableOrderStatus) => void;
  onClear: () => void;
}

// orders/page.jsx BulkActionBar, pinned above the tab bar.
export function BulkActionBar({ selectedCount, deliveryMethods, disabled, onAction, onClear }: BulkActionBarProps) {
  const [open, setOpen] = useState(false);
  if (selectedCount === 0) return null;
  const { isMixed, actions } = bulkActionsFor(deliveryMethods);

  return (
    <>
      <View style={[styles.bar, shadows.xl]}>
        <CheckSquare size={18} color={colors.white} />
        <View style={styles.flex}>
          <Text weight="semibold" color={colors.white}>
            {selectedCount} selected
          </Text>
          {isMixed ? (
            <View style={styles.mixed}>
              <Text size="xs" weight="medium" color={colors.white}>
                Mixed delivery methods
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={() => setOpen(true)} disabled={disabled} accessibilityRole="button" style={[styles.actionsButton, disabled && styles.disabled]}>
          <List size={16} color={colors.brandBlue} />
          <Text weight="semibold" color={colors.brandBlue}>
            Bulk Actions
          </Text>
        </Pressable>
        <Pressable onPress={onClear} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear selection" style={styles.clear}>
          <X size={20} color={colors.white} />
        </Pressable>
      </View>
      <Sheet visible={open} onClose={() => setOpen(false)} title="Bulk Actions">
        {actions.map(({ value, label, icon: Icon, color }) => (
          <Pressable
            key={value}
            onPress={() => {
              setOpen(false);
              onAction(value);
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Icon size={18} color={color} />
            <Text size="base" weight="medium" color={colors.gray700}>
              {label}
            </Text>
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  bar: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.brandBlue, borderRadius: radius.xl, paddingHorizontal: 16, paddingVertical: 12 },
  mixed: { alignSelf: 'flex-start', backgroundColor: '#EAB308', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  actionsButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: radius.lg, paddingHorizontal: 12, minHeight: 40 },
  disabled: { opacity: 0.5 },
  clear: { padding: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 4 },
  pressed: { opacity: 0.6 },
});

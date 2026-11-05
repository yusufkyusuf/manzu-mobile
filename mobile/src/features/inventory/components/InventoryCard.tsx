import { Edit, Package } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import { expiryDisplay, formatIngredientNames, stockBadge } from '../constants';
import type { CatalogMedication } from '../types';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text size="xs" weight="medium" color={colors.gray500}>
        {label}
      </Text>
      {children}
    </View>
  );
}

// inventory/page.jsx renderMobileCard. The badge uses getStockBadge(item) (the table version);
// the web's mobile card passes item.stock instead, which always renders "Not Stocked".
export const InventoryCard = memo(function InventoryCard({ item, onOpen }: { item: CatalogMedication; onOpen: (item: CatalogMedication) => void }) {
  const badge = stockBadge(item);
  const expiry = expiryDisplay(item.expiryDate);
  return (
    <Pressable onPress={() => onOpen(item)} accessibilityRole="button" accessibilityLabel={`${item.brandName}, ${badge.label}`} style={({ pressed }) => [styles.card, shadows.sm, pressed && styles.pressed]}>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text weight="semibold" color={colors.gray900} numberOfLines={1}>
            {item.brandName || 'Unknown'}
          </Text>
          <Text size="xs" color={colors.gray600} numberOfLines={1}>
            {item.activeSubstances || formatIngredientNames(item.ingredients)}
          </Text>
          <Text size="xs" color={colors.gray500} numberOfLines={1}>
            {item.manufacturerName || 'Unknown Manufacturer'}
          </Text>
        </View>
        {item.isStocked ? (
          <View style={styles.editIcon}>
            <Edit size={16} color={colors.primary} />
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        <Field label="Stock:">
          <Text weight="semibold" color={colors.gray900}>
            {item.stock || 0} units
          </Text>
        </Field>
        <Field label="Price:">
          <Text weight="semibold" color={colors.gray900}>
            {formatNairaShort(item.price)}
          </Text>
        </Field>
        <Field label="Batch:">
          <Text color={colors.gray900} numberOfLines={1}>
            {item.batchNumber || 'N/A'}
          </Text>
        </Field>
        <Field label="Expiry:">
          <Text weight={expiry.bold ? 'medium' : 'regular'} color={expiry.color}>
            {expiry.text}
          </Text>
        </Field>
      </View>

      <View style={styles.statusRow}>
        <Text size="xs" weight="medium" color={colors.gray500}>
          Status:
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text size="xs" weight="medium" color={badge.fg}>
            {badge.label}
          </Text>
        </View>
      </View>

      {!item.isStocked ? (
        <View style={styles.stockButton}>
          <Package size={14} color={colors.white} />
          <Text size="xs" weight="semibold" color={colors.white}>
            Stock This Medication
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg, padding: 12, gap: 10 },
  pressed: { opacity: 0.9 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  editIcon: { padding: 6, borderRadius: radius.full, backgroundColor: colors.primarySoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  field: { width: '50%', paddingRight: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  stockButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, borderRadius: radius.lg, backgroundColor: colors.blue600 },
});

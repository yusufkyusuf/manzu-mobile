import { DollarSign, Package } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors } from '@/theme';

import { DashCard } from './DashCard';

export function RevenueTodayCard({ revenue, transactions }: { revenue: number; transactions: number }) {
  return (
    <DashCard gradient={[colors.blue50, colors.green50]} borderColor={colors.blue200}>
      <View style={styles.header}>
        <Text size="base" weight="semibold" color={colors.gray900}>
          Total Revenue Today
        </Text>
        <DollarSign size={20} color={colors.blue600} />
      </View>
      <Text size="2xl" weight="bold" color={colors.blue600}>
        {formatNairaShort(revenue)}
      </Text>
      <Text size="xs" color={colors.gray500} style={styles.footnote}>
        From {transactions} total transactions
      </Text>
    </DashCard>
  );
}

export function InventoryStatusCard({ lowStock, expiring, onPress }: { lowStock: number; expiring: number; onPress?: () => void }) {
  return (
    <DashCard gradient={[colors.purple50, colors.pink50]} borderColor={colors.purple200} onPress={onPress} accessibilityLabel="Inventory status">
      <View style={styles.header}>
        <Text size="base" weight="semibold" color={colors.gray900}>
          Inventory Status
        </Text>
        <Package size={20} color={colors.purple600} />
      </View>
      <View style={styles.rows}>
        <View style={styles.row}>
          <Text size="xs" color={colors.gray600}>
            Low Stock Items
          </Text>
          <Text size="xl" weight="bold" color={colors.red600}>
            {lowStock}
          </Text>
        </View>
        <View style={styles.row}>
          <Text size="xs" color={colors.gray600}>
            Expiring Soon (30d)
          </Text>
          <Text size="xl" weight="bold" color={colors.orange600}>
            {expiring}
          </Text>
        </View>
      </View>
    </DashCard>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  footnote: { marginTop: 8 },
  rows: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});

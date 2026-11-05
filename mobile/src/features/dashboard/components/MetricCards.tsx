import { CheckCircle, Clock, Package, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import { DashCard } from './DashCard';

function IconTile({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  // linear-gradient(135deg, color15, color25)
  return (
    <View style={[styles.iconTile, { backgroundColor: `${color}20` }]}>
      <Icon size={20} color={color} />
    </View>
  );
}

function Trend({ value }: { value: number }) {
  const up = value > 0;
  const color = up ? colors.success : colors.danger;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <View style={styles.trend} accessibilityLabel={`${up ? 'Up' : 'Down'} ${Math.abs(value)} percent versus yesterday`}>
      <Icon size={14} color={color} />
      <Text size="xs" weight="medium" color={color}>
        {Math.abs(value)}%
      </Text>
    </View>
  );
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  trend: number;
  subtitle?: string;
  onPress?: () => void;
}

// Web MetricCard: trend shown only when non-zero.
export function MetricCard({ icon, label, value, color, trend, subtitle, onPress }: MetricCardProps) {
  return (
    <DashCard onPress={onPress} accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.top}>
        <IconTile icon={icon} color={color} />
        {trend ? <Trend value={trend} /> : null}
      </View>
      <Text size="2xl" weight="bold" color={colors.gray900}>
        {value}
      </Text>
      <Text size="xs" weight="medium" color={colors.gray600}>
        {label}
      </Text>
      {subtitle ? (
        <Text size="xs" color={colors.gray500}>
          {subtitle}
        </Text>
      ) : null}
    </DashCard>
  );
}

interface OnlineOrdersCardProps {
  ordersToday: number;
  /** The web card shows revenueTrend (not ordersTrend); copied as-is. */
  trend: number;
  pending: number;
  processing: number;
  completed: number;
  onPress: () => void;
}

export function OnlineOrdersCard({ ordersToday, trend, pending, processing, completed, onPress }: OnlineOrdersCardProps) {
  const stats = [
    { label: 'Pending', value: pending, icon: Clock, iconColor: colors.orange500, color: colors.orange600 },
    { label: 'Processing', value: processing, icon: Package, iconColor: colors.blue500, color: colors.blue600 },
    { label: 'Completed', value: completed, icon: CheckCircle, iconColor: colors.green500, color: colors.green600 },
  ];
  return (
    <DashCard onPress={onPress} accessibilityLabel={`Online orders today: ${ordersToday}`}>
      <View style={styles.top}>
        <IconTile icon={Package} color={colors.primary} />
        {trend ? <Trend value={trend} /> : null}
      </View>
      <Text size="2xl" weight="bold" color={colors.gray900}>
        {ordersToday}
      </Text>
      <Text size="xs" weight="medium" color={colors.gray600}>
        Online Orders Today
      </Text>
      <View style={styles.statusRow}>
        {stats.map(({ label, value, icon: Icon, iconColor, color }) => (
          <View key={label} style={styles.flex}>
            <View style={styles.statusLabel}>
              <Icon size={12} color={iconColor} />
              <Text size="xs" color={colors.gray500}>
                {label}
              </Text>
            </View>
            <Text size="lg" weight="bold" color={color}>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </DashCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  iconTile: { padding: 8, borderRadius: radius.lg },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusRow: { flexDirection: 'row', gap: 12, paddingTop: 8, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.gray100 },
  statusLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

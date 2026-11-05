import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowRight, CheckCircle, Clock, DollarSign } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Skeleton, Text } from '@/components/ui';
import { formatNairaShort } from '@/lib/format';
import { colors, radius, shadows } from '@/theme';

import { payoutSummaryQueryOptions } from '../api';

// Mirrors manzu-f dashboard/components/PayoutSummaryWidget.jsx: renders nothing if the summary fails to load.
export function PayoutSummaryWidget() {
  const router = useRouter();
  const { data: summary, isPending } = useQuery(payoutSummaryQueryOptions);

  if (isPending) {
    return (
      <View style={[styles.skeletonCard, shadows.sm]}>
        <Skeleton width="33%" height={16} />
        <Skeleton width="66%" height={32} />
      </View>
    );
  }
  if (!summary) return null;

  const hasPendingPayouts = summary.pending.amount > 0;
  const needsBankingSetup = summary.pending.amount > 0 && summary.bankingConfigured === false;
  const openPayment = () => router.push('/payment');

  return (
    <View style={[styles.card, shadows.lg]}>
      <View style={styles.header}>
        <View style={styles.inline}>
          <DollarSign size={20} color={colors.green600} />
          <Text size="base" weight="semibold" color={colors.gray900}>
            Payout Status
          </Text>
        </View>
        <Pressable onPress={openPayment} accessibilityRole="link" hitSlop={12} style={styles.inline}>
          <Text weight="medium" color={colors.blue600}>
            View All
          </Text>
          <ArrowRight size={16} color={colors.blue600} />
        </Pressable>
      </View>

      {needsBankingSetup ? (
        <View style={styles.setup}>
          <AlertCircle size={20} color={colors.yellow700} />
          <View style={styles.flex}>
            <Text weight="semibold" color={colors.yellow900}>
              Banking Setup Required
            </Text>
            <Text size="xs" color={colors.yellow800}>
              Configure your bank account to receive payouts
            </Text>
            <Pressable onPress={openPayment} accessibilityRole="link" hitSlop={8}>
              <Text size="xs" weight="semibold" color={colors.yellow900} style={styles.underline}>
                Setup Now
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.grid}>
        <View style={[styles.tile, { borderColor: colors.orange200 }]}>
          <View style={styles.inline}>
            <Clock size={16} color={colors.orange600} />
            <Text size="xs" color={colors.gray600}>
              Pending
            </Text>
          </View>
          <Text size="xl" weight="bold" color={colors.orange600}>
            {formatNairaShort(summary.pending.amount)}
          </Text>
          <Text size="xs" color={colors.gray500}>
            {summary.pending.count} order{summary.pending.count !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={[styles.tile, { borderColor: colors.green200 }]}>
          <View style={styles.inline}>
            <CheckCircle size={16} color={colors.green600} />
            <Text size="xs" color={colors.gray600}>
              Paid
            </Text>
          </View>
          <Text size="xl" weight="bold" color={colors.green600}>
            {formatNairaShort(summary.completed.amount)}
          </Text>
          <Text size="xs" color={colors.gray500}>
            {summary.completed.count} payout{summary.completed.count !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {hasPendingPayouts ? (
        <View style={styles.next}>
          <Text size="xs" color={colors.blue900}>
            <Text size="xs" weight="semibold" color={colors.blue900}>
              Next payout:
            </Text>{' '}
            Tonight at 11 PM
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 4 },
  skeletonCard: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.gray200 },
  card: { backgroundColor: colors.green50, borderRadius: radius['2xl'], padding: 16, borderWidth: 2, borderColor: colors.green200, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setup: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.yellow100, borderWidth: 1, borderColor: colors.yellow300 },
  underline: { textDecorationLine: 'underline', marginTop: 4 },
  grid: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, borderWidth: 1, gap: 4 },
  next: { padding: 8, borderRadius: radius.lg, backgroundColor: colors.blue50 },
});

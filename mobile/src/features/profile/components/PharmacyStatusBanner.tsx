import { AlertTriangle, Clock, XCircle, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import type { PharmacyStatus } from '@/features/auth/types';
import { colors, radius } from '@/theme';

interface BannerConfig {
  icon: LucideIcon;
  bg: string;
  border: string;
  fg: string;
  title: string;
  body: string;
}

// PLAN D4: non-VERIFIED pharmacies keep full access (like the web); we only warn.
const CONFIG: Partial<Record<PharmacyStatus, BannerConfig>> = {
  PENDING: { icon: Clock, bg: colors.yellow50, border: colors.yellow300, fg: colors.yellow800, title: 'Verification pending', body: 'Your pharmacy is awaiting verification by Manzu.' },
  REJECTED: { icon: XCircle, bg: colors.red50, border: colors.red100, fg: colors.red700, title: 'Verification rejected', body: 'Your pharmacy verification was rejected. Contact Manzu support for details.' },
  SUSPENDED: { icon: AlertTriangle, bg: colors.red50, border: colors.red100, fg: colors.red700, title: 'Pharmacy suspended', body: 'Your pharmacy account is suspended. Contact Manzu support for details.' },
  CLOSED: { icon: AlertTriangle, bg: colors.gray100, border: colors.gray200, fg: colors.gray700, title: 'Pharmacy closed', body: 'Your pharmacy is marked as closed.' },
};

export function PharmacyStatusBanner({ status }: { status: PharmacyStatus | null | undefined }) {
  const config = status ? CONFIG[status] : undefined;
  if (!config) return null;
  const Icon = config.icon;
  return (
    <View style={[styles.banner, { backgroundColor: config.bg, borderColor: config.border }]} accessibilityRole="alert">
      <Icon size={20} color={config.fg} />
      <View style={styles.flex}>
        <Text weight="semibold" color={config.fg}>
          {config.title}
        </Text>
        <Text size="xs" color={config.fg}>
          {config.body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1 },
  flex: { flex: 1, gap: 2 },
});

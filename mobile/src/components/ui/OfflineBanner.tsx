import { WifiOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useIsOnline } from '@/lib/network';
import { formatTime } from '@/lib/format';
import { colors } from '@/theme';

import { Text } from './Text';

export function OfflineBanner({ dataUpdatedAt }: { dataUpdatedAt?: number }) {
  const online = useIsOnline();
  if (online) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <WifiOff size={16} color={colors.orange600} />
      <Text size="xs" weight="medium" color={colors.orange600} style={styles.text}>
        {dataUpdatedAt ? `Offline — showing data from ${formatTime(dataUpdatedAt)}. Changes are disabled.` : 'Offline — changes are disabled until you reconnect.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.orange50,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  text: { flex: 1 },
});

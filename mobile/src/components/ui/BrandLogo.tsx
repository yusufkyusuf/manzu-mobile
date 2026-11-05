import { LinearGradient } from 'expo-linear-gradient';
import { Pill } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, gradients, radius } from '@/theme';

import { Text } from './Text';

// SidebarNav header: gradient tile with Pill icon + "Manzu Pharmacy".
// Web clips a gradient onto the text; mobile uses solid brand blue (no masked-view dependency).
export function BrandLogo({ showName = true }: { showName?: boolean }) {
  return (
    <View style={styles.row}>
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tile}>
        <Pill size={20} color={colors.white} />
      </LinearGradient>
      {showName ? (
        <Text size="xl" weight="bold" color={colors.brandBlue}>
          Manzu Pharmacy
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});

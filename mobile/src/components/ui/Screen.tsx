import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, gradients } from '@/theme';

import { OfflineBanner } from './OfflineBanner';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Epoch ms of the data on screen, for the offline banner. */
  dataUpdatedAt?: number;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  background?: readonly [string, string, ...string[]];
}

// Dashboard layout: bg-gradient-to-br from-gray-50 to-gray-100, content p-4.
export function Screen({ children, scroll = true, refreshing = false, onRefresh, dataUpdatedAt, edges = ['top'], contentStyle, background = gradients.appBackground }: ScreenProps) {
  return (
    <LinearGradient colors={background} style={styles.flex}>
      <SafeAreaView edges={edges} style={styles.flex}>
        <OfflineBanner dataUpdatedAt={dataUpdatedAt} />
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, flexGrow: 1 },
});

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radius, shadows } from '@/theme';

import { Text } from './Text';

// components/ui/card.jsx: rounded-xl border bg-card py-6 shadow-sm; header/content px-6.
export function Card({ children, style, elevated }: { children: ReactNode; style?: StyleProp<ViewStyle>; elevated?: boolean }) {
  return <View style={[styles.card, elevated ? shadows.xl : shadows.sm, elevated && styles.elevated, style]}>{children}</View>;
}

export function CardHeader({ children, tinted, style }: { children: ReactNode; tinted?: boolean; style?: StyleProp<ViewStyle> }) {
  if (tinted) {
    return (
      <LinearGradient colors={gradients.cardHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.header, style]}>
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, color = colors.gray900 }: { children: ReactNode; color?: string }) {
  return (
    <Text size="lg" weight="bold" color={color}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  elevated: { borderWidth: 0, borderRadius: radius['2xl'] },
  header: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { padding: 16, gap: 16 },
});

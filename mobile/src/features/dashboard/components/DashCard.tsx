import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '@/theme';

interface DashCardProps {
  children: ReactNode;
  /** Tailwind bg-gradient-to-br stops; defaults to from-white to-gray-50. */
  gradient?: readonly [string, string, ...string[]];
  borderColor?: string;
  borderWidth?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

// Dashboard cards: rounded-2xl shadow-lg bg-gradient-to-br border border-gray-200/50 p-4.
export function DashCard({ children, gradient = [colors.white, colors.gray50], borderColor = colors.borderSoft, borderWidth = 1, onPress, accessibilityLabel, style }: DashCardProps) {
  const body = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.inner, { borderColor, borderWidth }, style]}>
      {children}
    </LinearGradient>
  );
  if (!onPress) return <View style={[styles.outer, shadows.lg]}>{body}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.outer, shadows.lg, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: radius['2xl'] },
  inner: { borderRadius: radius['2xl'], padding: 16, overflow: 'hidden' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});

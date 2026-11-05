import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

import { Text } from './Text';

// components/ui/badge.jsx: rounded-md px-2 py-0.5 text-xs font-medium.
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

const STYLE: Record<BadgeVariant, { bg: string; fg: string; border?: string }> = {
  default: { bg: colors.primary, fg: colors.white },
  secondary: { bg: colors.gray100, fg: colors.gray700 },
  destructive: { bg: colors.red50, fg: colors.red600 },
  outline: { bg: 'transparent', fg: colors.gray700, border: colors.border },
  success: { bg: colors.green100, fg: colors.green800 },
  warning: { bg: colors.yellow50, fg: colors.yellow600 },
  info: { bg: colors.blue50, fg: colors.blue600 },
};

export function Badge({ label, variant = 'default', color }: { label: string; variant?: BadgeVariant; color?: string }) {
  const s = STYLE[variant];
  const bg = color ? `${color}1A` : s.bg;
  const fg = color ?? s.fg;
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: s.border ?? 'transparent' }]}>
      <Text size="xs" weight="medium" color={fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1 },
});

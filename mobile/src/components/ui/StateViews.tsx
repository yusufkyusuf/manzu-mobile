import { AlertCircle, Inbox, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { errorMessage, toApiError } from '@/api/errors';
import { colors, radius } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text color={colors.gray500}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, description, icon: Icon = Inbox, actionTitle, onAction }: { title: string; description?: string; icon?: LucideIcon; actionTitle?: string; onAction?: () => void }) {
  return (
    <View style={styles.center}>
      <View style={styles.iconWrap}>
        <Icon size={28} color={colors.gray400} />
      </View>
      <Text size="base" weight="semibold" color={colors.gray900} align="center">
        {title}
      </Text>
      {description ? (
        <Text color={colors.gray500} align="center">
          {description}
        </Text>
      ) : null}
      {actionTitle && onAction ? <Button title={actionTitle} onPress={onAction} variant="outline" /> : null}
    </View>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }: { error: unknown; onRetry?: () => void; title?: string }) {
  const apiError = toApiError(error);
  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={[styles.iconWrap, { backgroundColor: colors.red50 }]}>
        <AlertCircle size={28} color={colors.red500} />
      </View>
      <Text size="base" weight="semibold" color={colors.gray900} align="center">
        {apiError.isNetwork ? "You're offline" : title}
      </Text>
      <Text color={colors.gray500} align="center">
        {errorMessage(error)}
      </Text>
      {onRetry ? <Button title="Try again" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}

export function Skeleton({ width = '100%', height = 16, style }: { width?: DimensionValue; height?: number; style?: StyleProp<ViewStyle> }) {
  const [opacity] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[{ width, height, borderRadius: radius.md, backgroundColor: colors.gray200, opacity }, style]} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, minHeight: 240 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
});

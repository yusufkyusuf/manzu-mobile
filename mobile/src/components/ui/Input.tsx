import { useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, radius, touchTarget } from '@/theme';

import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label?: string;
  required?: boolean;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

// Login/forms on the web: h-12 rounded-lg border-2 border-gray-200 focus:border-[#1ABA7F].
export function Input({ label, required, error, style, onFocus, onBlur, ref, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      {label ? (
        <Text size="sm" weight="semibold" color={colors.gray700}>
          {label}
          {required ? <Text color={colors.red500}> *</Text> : null}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.gray400}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, focused && styles.focused, !!error && styles.invalid, style]}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? (
        <Text size="xs" color={colors.red600}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: {
    minHeight: Math.max(48, touchTarget),
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.gray900,
    backgroundColor: colors.white,
  },
  focused: { borderColor: colors.primary },
  invalid: { borderColor: colors.red500 },
});

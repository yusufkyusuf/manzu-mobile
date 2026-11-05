import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface DateFieldProps {
  label: string;
  required?: boolean;
  /** YYYY-MM-DD or ''. */
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  error?: string;
  disabled?: boolean;
}

function toIso(d: Date): string {
  return d.toISOString().split('T')[0] ?? '';
}

// Native replacement for <input type="date">. Values are YYYY-MM-DD like the web form.
export function DateField({ label, required, value, onChange, minimumDate, error, disabled }: DateFieldProps) {
  const [iosOpen, setIosOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ? new Date(value) : new Date());
  // Noon UTC avoids the picked day shifting across time zones when serialised.
  const pick = (d: Date) => onChange(toIso(new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12))));

  const open = () => {
    const current = value ? new Date(value) : new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        minimumDate,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          if (event.type === 'set' && date) pick(date);
        },
      });
    } else {
      setDraft(current);
      setIosOpen(true);
    }
  };

  return (
    <View style={styles.field}>
      <Text weight="medium" color={colors.gray900}>
        {label} {required ? <Text color={colors.danger}>*</Text> : null}
      </Text>
      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}
        style={[styles.input, !!error && styles.inputError, disabled && styles.disabled]}
      >
        <Text style={styles.value} color={value ? colors.gray900 : colors.gray400}>
          {value ? new Date(value).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'Select date'}
        </Text>
        <Calendar size={16} color={colors.gray500} />
      </Pressable>
      {error ? (
        <Text size="xs" color={colors.red600}>
          {error}
        </Text>
      ) : null}
      {Platform.OS !== 'android' ? (
        <Sheet visible={iosOpen} onClose={() => setIosOpen(false)} title={label}>
          <DateTimePicker value={draft} mode="date" display="inline" minimumDate={minimumDate} onChange={(_e, d) => d && setDraft(d)} accentColor={colors.primary} />
          <Button
            title="Done"
            variant="gradient"
            fullWidth
            onPress={() => {
              pick(draft);
              setIosOpen(false);
            }}
          />
        </Sheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  input: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.gray300, borderRadius: radius.lg, backgroundColor: colors.white },
  inputError: { borderColor: colors.red300, backgroundColor: colors.red50 },
  disabled: { opacity: 0.6 },
  value: { fontFamily: fonts.regular },
});

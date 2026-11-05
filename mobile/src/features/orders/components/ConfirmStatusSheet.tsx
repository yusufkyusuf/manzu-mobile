import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Input, RadioRow, Sheet, Text } from '@/components/ui';
import { colors } from '@/theme';

import type { UpdatableOrderStatus } from '../types';

interface ConfirmStatusSheetProps {
  visible: boolean;
  title: string;
  message: string;
  status: UpdatableOrderStatus | null;
  /** Shown (and required) when status is CANCELLED. */
  reasons: string[];
  loading: boolean;
  disabled?: boolean;
  onClose: () => void;
  onConfirm: (cancelReason?: string) => void;
}

// Web ConfirmationDialog: reason defaults to the first option; "Other" needs a non-empty custom reason.
export function ConfirmStatusSheet(props: ConfirmStatusSheetProps) {
  // Remount on open so the reason resets like the web dialog's fresh state.
  return props.visible ? <ConfirmStatusSheetBody key={`${props.status}-${props.title}`} {...props} /> : null;
}

function ConfirmStatusSheetBody({ visible, title, message, status, reasons, loading, disabled, onClose, onConfirm }: ConfirmStatusSheetProps) {
  const isCancel = status === 'CANCELLED';
  const [reason, setReason] = useState(reasons[0] ?? '');
  const [customReason, setCustomReason] = useState('');
  const needsCustom = isCancel && reason === 'Other';

  const confirm = () => {
    if (!isCancel) return onConfirm();
    onConfirm(needsCustom ? customReason.trim() : reason);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title} locked={loading}>
      <Text size="base" color={colors.gray600}>
        {message}
      </Text>
      {isCancel ? (
        <View style={styles.reasons}>
          <Text weight="medium" color={colors.gray700}>
            Cancellation Reason <Text color={colors.danger}>*</Text>
          </Text>
          {reasons.map((r) => (
            <RadioRow key={r} label={r} selected={reason === r} onPress={() => setReason(r)} color={colors.red600} disabled={loading} />
          ))}
          {needsCustom ? <Input value={customReason} onChangeText={setCustomReason} placeholder="Enter custom reason..." editable={!loading} autoFocus maxLength={500} /> : null}
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button title="Cancel" variant="outline" onPress={onClose} disabled={loading} style={styles.flex} />
        <Button
          title="Confirm"
          loadingTitle="Processing..."
          variant={isCancel ? 'destructive' : 'default'}
          onPress={confirm}
          loading={loading}
          disabled={disabled || (needsCustom && !customReason.trim())}
          style={styles.flex}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  reasons: { gap: 8 },
  actions: { flexDirection: 'row', gap: 12 },
});

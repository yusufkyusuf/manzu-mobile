import { useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Calendar, CheckCircle, DollarSign, Info, Package, Trash2, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, DateField, EmptyState, Input, Screen, Sheet, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { inventoryKeys } from '../api';
import { LOW_STOCK_THRESHOLD, daysUntil, isoDate } from '../constants';
import { useDeleteInventoryItem, useUpsertInventoryItem } from '../hooks';
import type { CatalogMedication } from '../types';

type FieldName = 'stock' | 'price' | 'batchNumber' | 'expiryDate';
interface FormState {
  stock: string;
  price: string;
  batchNumber: string;
  expiryDate: string;
}

/** InventoryForm.jsx validateField. */
function validate(name: FieldName, form: FormState): string | undefined {
  switch (name) {
    case 'stock':
      return form.stock === '' || Number(form.stock) < 0 ? 'Stock must be 0 or greater' : undefined;
    case 'price':
      return !form.price || !(Number(form.price) > 0) ? 'Price must be greater than 0' : undefined;
    case 'batchNumber':
      return !form.batchNumber.trim() ? 'Batch number is required' : undefined;
    case 'expiryDate': {
      if (!form.expiryDate) return 'Expiry date is required';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(form.expiryDate) < today ? 'Expiry date cannot be in the past' : undefined;
    }
  }
}

function FormSection({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon size={16} color={colors.brandBlue} />
        <View style={styles.flex}>
          <Text size="base" weight="semibold" color={colors.brandBlue}>
            {title}
          </Text>
          {description ? (
            <Text size="xs" color={colors.gray600}>
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export function InventoryFormScreen() {
  const { medicationId } = useLocalSearchParams<{ medicationId: string }>();
  const id = Number(medicationId);
  const queryClient = useQueryClient();
  const item = queryClient.getQueryData<CatalogMedication>(inventoryKeys.item(id));
  const router = useRouter();

  if (!item) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: 'Inventory' }} />
        <EmptyState icon={Package} title="Medication not loaded" description="Open this medication from the Inventory list." actionTitle="Back to Inventory" onAction={() => router.back()} />
      </Screen>
    );
  }
  return <InventoryForm item={item} />;
}

// InventoryForm.jsx in "edit" mode (the web always opens it with a catalog row and saves via PATCH upsert).
function InventoryForm({ item }: { item: CatalogMedication }) {
  const router = useRouter();
  const online = useIsOnline();
  const upsert = useUpsertInventoryItem();
  const remove = useDeleteInventoryItem();
  const [form, setForm] = useState<FormState>({
    stock: item.stock != null ? String(item.stock) : '',
    price: item.price != null ? String(item.price) : '',
    batchNumber: item.batchNumber ?? '',
    expiryDate: item.expiryDate ? isoDate(new Date(item.expiryDate)) : '',
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setField = (name: FieldName, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors((e) => ({ ...e, [name]: validate(name, next) }));
  };

  const stockNum = form.stock === '' ? null : Number(form.stock);
  const days = form.expiryDate ? daysUntil(form.expiryDate) : null;
  const showValue = !!Number(form.stock) && !!Number(form.price);

  const submit = () => {
    setSubmitError(null);
    const fields: FieldName[] = ['stock', 'price', 'batchNumber', 'expiryDate'];
    const nextErrors = Object.fromEntries(fields.map((f) => [f, validate(f, form)])) as Partial<Record<FieldName, string>>;
    setErrors(nextErrors);
    if (fields.some((f) => nextErrors[f])) {
      setSubmitError('Please fix the form errors before submitting');
      return;
    }
    upsert.mutate(
      {
        medicationId: item.medicationId,
        body: { stock: parseInt(form.stock, 10), price: parseFloat(form.price), batchNumber: form.batchNumber.trim(), expiryDate: form.expiryDate },
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Inventory updated successfully' });
          router.back();
        },
        // 403 "Your pharmacy type (...) cannot stock this medication" is shown inline.
        onError: (err) => setSubmitError(errorMessage(err)),
      },
    );
  };

  const doDelete = () =>
    remove.mutate(item.medicationId, {
      onSuccess: () => {
        setConfirmDelete(false);
        Toast.show({ type: 'success', text1: 'Inventory item deleted successfully' });
        router.back();
      },
      onError: (err) => {
        setConfirmDelete(false);
        Toast.show({ type: 'error', text1: errorMessage(err) || 'Failed to delete inventory item' });
      },
    });

  const expiryTone =
    days === null
      ? null
      : days < 0
        ? { bg: colors.red50, border: colors.red300, fg: colors.red800, icon: AlertTriangle, title: 'This medication has expired!', body: `Expired ${Math.abs(days)} days ago` }
        : days < 30
          ? { bg: colors.orange50, border: '#FDBA74', fg: '#7C2D12', icon: AlertTriangle, title: 'Expiring soon!', body: `Expires in ${days} days` }
          : days < 90
            ? { bg: colors.yellow50, border: colors.yellow300, fg: colors.yellow900, icon: Info, title: 'Approaching expiry', body: `Expires in ${days} days` }
            : { bg: colors.green50, border: colors.green300, fg: colors.green800, icon: CheckCircle, title: 'Good expiry date', body: `Expires in ${days} days` };

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: item.isStocked ? 'Update Inventory' : 'Stock Medication' }} />

      <FormSection icon={Package} title="Medication Information" description="Select the medication to add to inventory">
        <View style={styles.medBox}>
          <Text weight="medium" color={colors.gray900}>
            {item.brandName || 'Unknown'}
          </Text>
          <Text size="xs" color={colors.gray600}>
            <Text size="xs" weight="bold" color={colors.gray600}>
              Active Substances:
            </Text>{' '}
            {item.activeSubstances}
          </Text>
          <Text size="xs" color={colors.gray600}>
            <Text size="xs" weight="bold" color={colors.gray600}>
              Manufacturer:
            </Text>{' '}
            {item.manufacturerName || 'Unknown'}
          </Text>
          <Text size="xs" color={colors.gray600}>
            <Text size="xs" weight="bold" color={colors.gray600}>
              Form:
            </Text>{' '}
            {item.form || 'Not specified'}
          </Text>
          <View style={styles.inline}>
            <Text size="xs" weight="bold" color={colors.gray600}>
              Regulatory Class:
            </Text>
            <View style={styles.classPill}>
              <Text size="xs" color={colors.blue800}>
                {item.regulatoryClass || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </FormSection>

      <FormSection icon={DollarSign} title="Stock & Pricing">
        <View>
          <Input
            label="Stock Quantity"
            required
            value={form.stock}
            onChangeText={(v) => setField('stock', v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            placeholder="0"
            error={errors.stock}
            editable={!upsert.isPending}
          />
          {stockNum !== null ? (
            <Text size="xs" weight="medium" color={stockNum === 0 ? colors.red600 : stockNum < LOW_STOCK_THRESHOLD ? colors.yellow600 : colors.green600} style={styles.stockHint}>
              {stockNum === 0 ? 'Out of Stock' : stockNum < LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock'}
            </Text>
          ) : null}
        </View>
        <Input
          label="Price per Unit (₦)"
          required
          value={form.price}
          onChangeText={(v) => setField('price', v.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
          keyboardType="decimal-pad"
          placeholder="0.00"
          error={errors.price}
          editable={!upsert.isPending}
        />
        {showValue ? (
          <View style={styles.valueBox}>
            <Text size="xs" weight="medium" color={colors.gray700}>
              Total Stock Value:
            </Text>
            <Text size="xl" weight="bold" color={colors.green600}>
              ₦{(parseFloat(form.stock) * parseFloat(form.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        ) : null}
      </FormSection>

      <FormSection icon={Calendar} title="Batch & Expiry Information">
        <Input
          label="Batch Number"
          required
          value={form.batchNumber}
          onChangeText={(v) => setField('batchNumber', v)}
          placeholder="e.g., LOT-2024-001"
          autoCapitalize="characters"
          error={errors.batchNumber}
          editable={!upsert.isPending}
        />
        <DateField label="Expiry Date" required value={form.expiryDate} onChange={(v) => setField('expiryDate', v)} minimumDate={new Date()} error={errors.expiryDate} disabled={upsert.isPending} />
        {expiryTone ? (
          <View style={[styles.expiryBox, { backgroundColor: expiryTone.bg, borderColor: expiryTone.border }]}>
            <expiryTone.icon size={16} color={expiryTone.fg} />
            <View style={styles.flex}>
              <Text weight="medium" color={expiryTone.fg}>
                {expiryTone.title}
              </Text>
              <Text size="xs" color={expiryTone.fg}>
                {expiryTone.body}
              </Text>
            </View>
          </View>
        ) : null}
      </FormSection>

      {submitError ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <AlertTriangle size={16} color={colors.red600} />
          <Text color={colors.red600} style={styles.flex}>
            {submitError}
          </Text>
        </View>
      ) : null}

      <Button title="Update Inventory" loadingTitle="Saving inventory item..." fullWidth size="lg" loading={upsert.isPending} disabled={!online} onPress={submit} />
      {item.isStocked ? (
        <Button title="Delete from Inventory" icon={Trash2} variant="ghost" fullWidth disabled={!online || upsert.isPending} onPress={() => setConfirmDelete(true)} />
      ) : null}
      {!online ? (
        <Text size="xs" color={colors.orange600} align="center">
          {"You're offline. Inventory changes are disabled."}
        </Text>
      ) : null}

      <Sheet visible={confirmDelete} onClose={() => setConfirmDelete(false)} title="Confirm Delete" locked={remove.isPending}>
        <View style={styles.deleteWarn}>
          <AlertTriangle size={20} color={colors.red600} />
          <View style={styles.flex}>
            <Text weight="medium" color={colors.red800}>
              Are you sure you want to delete this inventory item?
            </Text>
            <Text size="xs" color={colors.red600}>
              This action cannot be undone.
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button title="Cancel" variant="secondary" style={styles.flex} disabled={remove.isPending} onPress={() => setConfirmDelete(false)} />
          <Button title="Delete" loadingTitle="Deleting..." variant="destructive" style={styles.flex} loading={remove.isPending} disabled={!online} onPress={doDelete} />
        </View>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  section: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.lg, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.gray50, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  sectionBody: { padding: 16, gap: 16 },
  medBox: { gap: 4, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.gray300, backgroundColor: colors.gray50 },
  classPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: colors.blue100 },
  stockHint: { position: 'absolute', right: 12, top: 38 },
  valueBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.green200, backgroundColor: colors.green50 },
  expiryBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.red200, backgroundColor: colors.red50 },
  deleteWarn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.red200, backgroundColor: colors.red50 },
  actions: { flexDirection: 'row', gap: 12 },
});

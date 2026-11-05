import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, Calendar, CheckCircle, DollarSign, Download, Eye, FileText, Home, Mail, MapPin, MessageCircle, Package, Phone, Truck, User, type LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Image, Linking, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { Button, ErrorState, RadioRow, Screen, Sheet, Skeleton, Text } from '@/components/ui';
import { formatDateTime, formatNairaShort } from '@/lib/format';
import { useIsOnline } from '@/lib/network';
import { colors, radius, shadows } from '@/theme';

import { ConfirmStatusSheet } from '../components/ConfirmStatusSheet';
import { DETAIL_CANCEL_REASONS, STATUS_LABELS, STATUS_OPTIONS, dialogCapitalize, statusOptionsFor } from '../constants';
import { useOrder, useUpdateOrderStatus } from '../hooks';
import type { OrderDetail, UpdatableOrderStatus } from '../types';

function isImageFile(url: string | null | undefined): boolean {
  return !!url && /\.(jpe?g|png|gif|webp)$/i.test(url);
}

/** wa.me needs international digits; Nigerian local numbers (0XXXXXXXXXX) become 234XXXXXXXXXX. */
function whatsappUrl(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `234${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

function Section({ icon: Icon, title, children, style }: { icon: LucideIcon; title: string; children: ReactNode; style?: object }) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionTitle}>
        <Icon size={16} color={colors.brandBlue} />
        <Text weight="semibold" color={colors.gray900}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function InfoRow({ icon: Icon, label, value, onPress }: { icon: LucideIcon; label: string; value: string; onPress?: () => void }) {
  const body = (
    <View style={styles.infoRow}>
      <Icon size={14} color={colors.gray500} style={styles.infoIcon} />
      <View style={styles.flex}>
        <Text size="xs" color={colors.gray500}>
          {label}
        </Text>
        <Text weight="medium" color={onPress ? colors.blue600 : colors.gray900}>
          {value}
        </Text>
      </View>
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="link">
      {body}
    </Pressable>
  ) : (
    body
  );
}

export function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const query = useOrder(orderId);

  return (
    <>
      <Stack.Screen options={{ title: query.data?.sn ? `Order #${query.data.sn}` : 'Order Details' }} />
      {query.data ? (
        <OrderDetailBody order={query.data} dataUpdatedAt={query.dataUpdatedAt} refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />
      ) : (
        <Screen edges={[]}>
          {query.isError ? (
            <ErrorState error={query.error} title="Failed to fetch order" onRetry={() => void query.refetch()} />
          ) : (
            <View style={styles.skeletons}>
              {[96, 200, 160, 180].map((h, i) => (
                <Skeleton key={i} height={h} style={styles.skeleton} />
              ))}
            </View>
          )}
        </Screen>
      )}
    </>
  );
}

function OrderDetailBody({ order, dataUpdatedAt, refreshing, onRefresh }: { order: OrderDetail; dataUpdatedAt: number; refreshing: boolean; onRefresh: () => void }) {
  const router = useRouter();
  const online = useIsOnline();
  const mutation = useUpdateOrderStatus();
  // Web: placeholder for CONFIRMED orders, otherwise preselect the current status.
  const [status, setStatus] = useState<UpdatableOrderStatus | ''>(order.status === 'CONFIRMED' ? '' : (order.status as UpdatableOrderStatus));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPrescription, setShowPrescription] = useState(false);

  const deliveryMethod = order.deliveryMethod?.toLowerCase();
  const options = statusOptionsFor(order.deliveryMethod);
  const original = STATUS_OPTIONS.find((opt) => opt.value === order.status);
  const OriginalIcon = original?.icon;
  const badgeColor = original?.color ?? colors.warning;
  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const confirmTitle = `${status === 'CANCELLED' ? 'Cancel' : 'Update'} Order`;
  const confirmMessage =
    status === 'CANCELLED'
      ? `Are you sure you want to cancel order #${order.sn}? This action cannot be undone. If the order was paid, it will be automatically refunded.`
      : status
        ? `Update order #${order.sn} to "${STATUS_LABELS[status]}" status?`
        : '';

  const confirm = (cancelReason?: string) => {
    if (!status) return;
    setSubmitError(null);
    mutation.mutate(
      { orderId: order.id, status, cancelReason },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          Toast.show({ type: 'success', text1: 'Order status updated successfully' });
          router.back();
        },
        onError: (err) => {
          const message = errorMessage(err) || 'Failed to update order status';
          setConfirmOpen(false);
          setSubmitError(message);
          Toast.show({ type: 'error', text1: message });
        },
      },
    );
  };

  return (
    <Screen edges={[]} dataUpdatedAt={dataUpdatedAt} refreshing={refreshing} onRefresh={onRefresh}>
      <LinearGradient colors={[colors.brandBlue, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Package size={20} color={colors.white} />
        </View>
        <View>
          <Text size="lg" weight="bold" color={colors.white}>
            Order Details
          </Text>
          <Text size="xs" color="rgba(255,255,255,0.8)">
            #{order.sn ?? '—'}
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.statusCard]}>
        <View style={styles.statusHeader}>
          <View style={styles.inline}>
            {OriginalIcon ? <OriginalIcon size={20} color={original.color} /> : null}
            <View>
              <Text weight="semibold" color={colors.gray900}>
                Current Status
              </Text>
              <Text size="xs" color={colors.gray600}>
                Track order progress
              </Text>
            </View>
          </View>
          <View style={[styles.statusPill, shadows.sm, { backgroundColor: badgeColor }]}>
            <Text size="xs" weight="bold" color={colors.white}>
              {order.status === 'CONFIRMED' ? 'PENDING' : dialogCapitalize(order.status)}
            </Text>
          </View>
        </View>

        {order.status === 'CANCELLED' && order.cancelReason ? (
          <View style={styles.cancelBox}>
            <AlertCircle size={16} color={colors.red600} />
            <View style={styles.flex}>
              <Text size="xs" weight="semibold" color={colors.red800}>
                Cancellation Reason
              </Text>
              <Text color={colors.red700}>{order.cancelReason}</Text>
            </View>
          </View>
        ) : null}

        <Text weight="medium" color={colors.gray700}>
          Update Order Status
        </Text>
        {options.length === 0 ? (
          <Text size="xs" color={colors.gray500}>
            No status changes are available for this delivery method.
          </Text>
        ) : (
          <View style={styles.options}>
            {options.map((opt) => (
              <RadioRow key={opt.value} label={opt.label} icon={opt.icon} color={opt.color} selected={status === opt.value} onPress={() => setStatus(opt.value)} disabled={mutation.isPending} />
            ))}
          </View>
        )}
        {submitError ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color={colors.red700} />
            <Text size="xs" color={colors.red700} style={styles.flex}>
              {submitError}
            </Text>
          </View>
        ) : null}
        <Button
          title="Update Order Status"
          loadingTitle="Updating Status..."
          icon={CheckCircle}
          fullWidth
          loading={mutation.isPending}
          disabled={!online || !status || status === order.status}
          onPress={() => setConfirmOpen(true)}
        />
        {!online ? (
          <Text size="xs" color={colors.orange600} align="center">
            {"You're offline. Status changes are disabled."}
          </Text>
        ) : null}
      </View>

      <Section icon={User} title="Customer Information">
        <InfoRow icon={User} label="Name" value={order.name || 'N/A'} />
        {order.phone ? (
          <>
            <InfoRow icon={Phone} label="Phone" value={order.phone} />
            <View style={styles.contactRow}>
              <Button title="Call" icon={Phone} variant="outline" size="sm" style={styles.flex} onPress={() => void Linking.openURL(`tel:${order.phone}`)} />
              <Button title="WhatsApp" icon={MessageCircle} variant="outline" size="sm" style={styles.flex} onPress={() => void Linking.openURL(whatsappUrl(order.phone ?? ''))} />
            </View>
          </>
        ) : null}
        {order.email ? <InfoRow icon={Mail} label="Email" value={order.email} onPress={() => void Linking.openURL(`mailto:${order.email}`)} /> : null}
      </Section>

      <Section icon={deliveryMethod === 'pickup' ? Home : Truck} title="Delivery Information">
        <InfoRow icon={MapPin} label="Method" value={dialogCapitalize(order.deliveryMethod)} />
        {deliveryMethod !== 'pickup' && order.address ? <InfoRow icon={MapPin} label="Delivery Address" value={order.address} /> : null}
        <InfoRow icon={Calendar} label="Order Date" value={formatDateTime(order.createdAt)} />
      </Section>

      {order.prescription?.fileUrl ? (
        <View style={styles.rxCard}>
          <View style={styles.rxIcon}>
            <FileText size={20} color={colors.orange600} />
          </View>
          <View style={styles.flex}>
            <Text weight="semibold" color={colors.gray900}>
              Prescription Attached
            </Text>
            <Text size="xs" color={colors.gray600}>
              View prescription document
            </Text>
          </View>
          <Pressable onPress={() => setShowPrescription(true)} accessibilityRole="button" style={styles.rxButton}>
            <Eye size={14} color={colors.white} />
            <Text weight="semibold" color={colors.white}>
              View
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Section icon={Package} title="Order Items">
        <View style={styles.productsPill}>
          <Text size="xs" weight="semibold" color={colors.blue700}>
            {order.items?.length || 0} Products
          </Text>
        </View>
        {order.items?.map((item, idx) => (
          <View key={item.id ?? idx} style={styles.item}>
            <View style={styles.flex}>
              <Text weight="medium" color={colors.gray900}>
                {item.medication?.displayName || item.medication?.brandName || 'Unknown Medication'}
              </Text>
              <Text size="xs" color={colors.gray600}>
                Quantity: <Text size="xs" weight="semibold" color={colors.gray600}>{item.quantity}</Text> • Price:{' '}
                <Text size="xs" weight="semibold" color={colors.gray600}>
                  {formatNairaShort(item.price)}
                </Text>
              </Text>
            </View>
            <View style={styles.right}>
              <Text size="base" weight="bold" color={colors.primary}>
                {formatNairaShort((item.quantity || 0) * (item.price || 0))}
              </Text>
              <Text size="xs" color={colors.gray500}>
                Subtotal
              </Text>
            </View>
          </View>
        ))}
      </Section>

      <LinearGradient colors={[colors.green50, colors.blue50]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}>
        <View style={styles.sectionTitle}>
          <DollarSign size={16} color={colors.green600} />
          <Text weight="semibold" color={colors.gray900}>
            Order Summary
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text color={colors.gray600}>Subtotal</Text>
          <Text weight="semibold" color={colors.gray900}>
            {formatNairaShort(order.totalPrice)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text color={colors.gray600}>Delivery Fee</Text>
          <Text weight="semibold" color={colors.gray900}>
            ₦0
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text size="base" weight="semibold" color={colors.gray900}>
            Total
          </Text>
          <Text size="xl" weight="bold" color={colors.green600}>
            {formatNairaShort(order.totalPrice)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.quickStats}>
        <View style={[styles.quickStat, { backgroundColor: colors.blue50, borderColor: colors.blue200 }]}>
          <Text size="xs" color={colors.gray600}>
            Total Items
          </Text>
          <Text size="xl" weight="bold" color={colors.blue600}>
            {totalItems}
          </Text>
        </View>
        <View style={[styles.quickStat, { backgroundColor: colors.purple50, borderColor: colors.purple200 }]}>
          <Text size="xs" color={colors.gray600}>
            Products
          </Text>
          <Text size="xl" weight="bold" color={colors.purple600}>
            {order.items?.length || 0}
          </Text>
        </View>
        <View style={[styles.quickStat, { backgroundColor: colors.green50, borderColor: colors.green200 }]}>
          <Text size="xs" color={colors.gray600}>
            Revenue
          </Text>
          <Text size="lg" weight="bold" color={colors.green600} numberOfLines={1} adjustsFontSizeToFit>
            {formatNairaShort(order.pharmacyAmount)}
          </Text>
        </View>
      </View>

      <ConfirmStatusSheet
        visible={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        status={status || null}
        reasons={DETAIL_CANCEL_REASONS}
        loading={mutation.isPending}
        disabled={!online}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirm}
      />

      <Sheet visible={showPrescription} onClose={() => setShowPrescription(false)} title="Prescription Document">
        {isImageFile(order.prescription?.fileUrl) ? (
          <Image source={{ uri: order.prescription?.fileUrl }} style={styles.rxImage} resizeMode="contain" accessibilityLabel="Prescription file" />
        ) : (
          <View style={styles.rxFallback}>
            <FileText size={48} color={colors.gray400} />
            <Text color={colors.gray600}>This prescription is not an image file</Text>
            <Button title="Download Prescription" icon={Download} variant="logout" onPress={() => order.prescription && void Linking.openURL(order.prescription.fileUrl)} />
          </View>
        )}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  skeletons: { gap: 16 },
  skeleton: { borderRadius: radius.lg },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: radius['2xl'] },
  heroIcon: { padding: 6, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.2)' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusCard: { gap: 12, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.blue200, backgroundColor: colors.blue50 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  cancelBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.red50, borderWidth: 1, borderColor: colors.red200 },
  options: { gap: 8 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: radius.lg, backgroundColor: colors.red50, borderWidth: 1, borderColor: colors.red200 },
  section: { gap: 10, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.gray200, backgroundColor: colors.white },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoIcon: { marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 8, paddingLeft: 22 },
  rxCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.orange200, backgroundColor: colors.orange50 },
  rxIcon: { padding: 6, borderRadius: radius.lg, backgroundColor: colors.orange100 },
  rxButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, minHeight: 36, borderRadius: radius.lg, backgroundColor: colors.orange600 },
  rxImage: { width: '100%', height: 420, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.gray200 },
  rxFallback: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  productsPill: { position: 'absolute', top: 14, right: 16, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full, backgroundColor: colors.blue100 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: colors.gray50 },
  right: { alignItems: 'flex-end' },
  summary: { gap: 8, padding: 16, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.green300 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  summaryTotal: { borderTopWidth: 2, borderTopColor: colors.gray300, paddingTop: 8 },
  quickStats: { flexDirection: 'row', gap: 8 },
  quickStat: { flex: 1, alignItems: 'center', padding: 12, borderRadius: radius.lg, borderWidth: 1, gap: 2 },
});

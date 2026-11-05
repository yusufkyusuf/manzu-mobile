import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { errorMessage } from '@/api/errors';
import { EmptyState, ErrorState, Screen, Skeleton, Text } from '@/components/ui';
import { useIsOnline } from '@/lib/network';
import { colors, radius } from '@/theme';

import { BulkActionBar } from '../components/BulkActionBar';
import { ConfirmStatusSheet } from '../components/ConfirmStatusSheet';
import { FilterSheet } from '../components/FilterSheet';
import { OrderCard } from '../components/OrderCard';
import { OrdersHeader, type OrderStats } from '../components/OrdersHeader';
import { BULK_CANCEL_REASONS, EMPTY_FILTERS, MAX_BULK_ORDERS, STATUS_LABELS } from '../constants';
import { useBulkUpdateOrders, useOrders } from '../hooks';
import type { OrderFilters, OrderSummary, UpdatableOrderStatus } from '../types';

const plural = (n: number) => (n > 1 ? 's' : '');

// Stats are computed client-side from the orders on screen, like the web (which uses the current page).
function computeStats(orders: OrderSummary[]): OrderStats {
  const total = orders.length;
  const orderValue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  return {
    totalOrders: total,
    pendingOrders: orders.filter((o) => o.status === 'CONFIRMED').length,
    processingOrders: orders.filter((o) => o.status === 'PROCESSING').length,
    completedOrders: orders.filter((o) => o.status === 'COMPLETED').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.pharmacyAmount || 0), 0),
    avgOrderValue: total > 0 ? orderValue / total : 0,
  };
}

export function OrdersScreen() {
  const router = useRouter();
  const online = useIsOnline();
  const [filters, setFilters] = useState<OrderFilters>({ ...EMPTY_FILTERS });
  const [searchText, setSearchText] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmStatus, setConfirmStatus] = useState<UpdatableOrderStatus | null>(null);

  const query = useOrders(filters);
  const bulk = useBulkUpdateOrders();

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchText ? f : { ...f, search: searchText })), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const orders = useMemo(() => query.data?.pages.flatMap((p) => p.orders) ?? [], [query.data]);
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const stats = useMemo(() => computeStats(orders), [orders]);
  const selectedOrders = useMemo(() => orders.filter((o) => selectedIds.includes(o.id)), [orders, selectedIds]);

  const changeFilters = useCallback((patch: Partial<OrderFilters>) => {
    setSelectedIds([]);
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  const toggleSelect = useCallback((order: OrderSummary) => {
    setSelectedIds((prev) => {
      if (prev.includes(order.id)) return prev.filter((id) => id !== order.id);
      if (prev.length >= MAX_BULK_ORDERS) {
        Toast.show({ type: 'info', text1: `You can update up to ${MAX_BULK_ORDERS} orders at once` });
        return prev;
      }
      return [...prev, order.id];
    });
  }, []);

  const openOrder = useCallback((order: OrderSummary) => router.push({ pathname: '/orders/[id]', params: { id: String(order.id) } }), [router]);

  const count = selectedIds.length;
  const confirmTitle = confirmStatus ? `${confirmStatus === 'CANCELLED' ? 'Cancel' : 'Update'} ${count} Order${plural(count)}` : '';
  const confirmMessage = confirmStatus
    ? confirmStatus === 'CANCELLED'
      ? `Are you sure you want to cancel ${count} order${plural(count)}? This action cannot be undone. Paid orders will be automatically refunded.`
      : `Update ${count} order${plural(count)} to "${STATUS_LABELS[confirmStatus]}" status?`
    : '';

  const runBulk = (cancelReason?: string) => {
    if (!confirmStatus) return;
    const snById = new Map(orders.map((o) => [o.id, o.sn]));
    bulk.mutate(
      { orderIds: selectedIds, status: confirmStatus, cancelReason: confirmStatus === 'CANCELLED' ? cancelReason : null },
      {
        onSuccess: ({ results: { successful, failed } }) => {
          const failures = failed
            .slice(0, 3)
            .map((f) => `#${snById.get(f.orderId) ?? f.orderId}: ${f.reason}`)
            .join('\n');
          if (failed.length === 0) Toast.show({ type: 'success', text1: `Successfully updated ${successful.length} order${plural(successful.length)}` });
          else if (successful.length === 0) Toast.show({ type: 'error', text1: 'Failed to update all orders', text2: failures, visibilityTime: 6000 });
          else Toast.show({ type: 'info', text1: `Updated ${successful.length} order${plural(successful.length)}, ${failed.length} failed`, text2: failures, visibilityTime: 6000 });
          setSelectedIds([]);
        },
        onError: (err) => Toast.show({ type: 'error', text1: 'Failed to perform bulk action', text2: errorMessage(err) }),
        onSettled: () => setConfirmStatus(null),
      },
    );
  };

  const activeFilterCount = (filters.status ? 1 : 0) + (filters.deliveryMethod ? 1 : 0);

  const header = (
    <OrdersHeader
      stats={stats}
      filters={filters}
      searchText={searchText}
      onSearchText={setSearchText}
      onChange={changeFilters}
      onOpenFilters={() => setFilterSheetOpen(true)}
      activeFilterCount={activeFilterCount}
    />
  );

  const listEmpty = query.isPending ? (
    <View style={styles.skeletons}>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} height={132} style={styles.skeleton} />
      ))}
    </View>
  ) : query.isError ? (
    <ErrorState error={query.error} title="Failed to load orders." onRetry={() => void query.refetch()} />
  ) : (
    <EmptyState icon={Package} title="No orders found" description="Orders from the Manzu platform will appear here" />
  );

  return (
    <Screen scroll={false} dataUpdatedAt={query.dataUpdatedAt || undefined} contentStyle={styles.screen}>
      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        renderItem={({ item }) => (
          <OrderCard order={item} selected={selectedIds.includes(item.id)} selectionMode={count > 0} selectable={online} onPress={openOrder} onToggleSelect={toggleSelect} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          orders.length > 0 ? (
            <View style={styles.footer}>
              {query.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text size="xs" color={colors.gray500}>
                  Showing {orders.length} of {total} orders
                </Text>
              )}
            </View>
          ) : undefined
        }
        contentContainerStyle={[styles.list, count > 0 && styles.listWithBar]}
        ItemSeparatorComponent={Separator}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        keyboardShouldPersistTaps="handled"
      />

      <BulkActionBar
        selectedCount={count}
        deliveryMethods={selectedOrders.map((o) => o.deliveryMethod)}
        disabled={!online || bulk.isPending}
        onAction={setConfirmStatus}
        onClear={() => setSelectedIds([])}
      />

      <FilterSheet visible={filterSheetOpen} filters={filters} onChange={changeFilters} onClose={() => setFilterSheetOpen(false)} />

      <ConfirmStatusSheet
        visible={!!confirmStatus}
        title={confirmTitle}
        message={confirmMessage}
        status={confirmStatus}
        reasons={BULK_CANCEL_REASONS}
        loading={bulk.isPending}
        disabled={!online}
        onClose={() => setConfirmStatus(null)}
        onConfirm={runBulk}
      />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { padding: 0, gap: 0 },
  list: { padding: 16, flexGrow: 1 },
  listWithBar: { paddingBottom: 112 },
  separator: { height: 12 },
  skeletons: { gap: 12 },
  skeleton: { borderRadius: radius.lg },
  footer: { alignItems: 'center', paddingVertical: 16 },
});

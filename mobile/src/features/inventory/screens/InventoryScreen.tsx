import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Package } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, Screen, Skeleton, Text } from '@/components/ui';
import { colors, radius } from '@/theme';

import { inventoryKeys } from '../api';
import { InventoryCard } from '../components/InventoryCard';
import { InventoryFilterSheet } from '../components/InventoryFilterSheet';
import { InventoryHeader } from '../components/InventoryHeader';
import { useInventory } from '../hooks';
import type { CatalogMedication, InventoryFilters, StockFilter } from '../types';

export function InventoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Web default: stockFilter "stocked", no prescription filter.
  const [filters, setFilters] = useState<InventoryFilters>({ search: '', stock: 'stocked', prescription: '' });
  const [searchText, setSearchText] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const query = useInventory(filters);

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === searchText ? f : { ...f, search: searchText })), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.medications) ?? [], [query.data]);
  const firstPage = query.data?.pages[0];

  const changeFilters = useCallback((patch: Partial<InventoryFilters>) => setFilters((f) => ({ ...f, ...patch })), []);
  const setStock = useCallback((stock: StockFilter) => changeFilters({ stock }), [changeFilters]);

  const openItem = useCallback(
    (item: CatalogMedication) => {
      queryClient.setQueryData(inventoryKeys.item(item.medicationId), item);
      router.push({ pathname: '/inventory/[medicationId]', params: { medicationId: String(item.medicationId) } });
    },
    [queryClient, router],
  );

  const activeFilterCount = (filters.stock !== 'stocked' ? 1 : 0) + (filters.prescription ? 1 : 0);

  const listEmpty = query.isPending ? (
    <View style={styles.skeletons}>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} height={150} style={styles.skeleton} />
      ))}
    </View>
  ) : query.isError ? (
    <ErrorState error={query.error} title="Failed to load inventory." onRetry={() => void query.refetch()} />
  ) : (
    <EmptyState
      icon={Package}
      title="No inventory items found"
      description="Start by adding your first medication to inventory"
      actionTitle={filters.stock !== 'not_stocked' ? 'Browse medications to stock' : undefined}
      onAction={filters.stock !== 'not_stocked' ? () => changeFilters({ stock: 'not_stocked', search: '' }) : undefined}
    />
  );

  return (
    <Screen scroll={false} dataUpdatedAt={query.dataUpdatedAt || undefined} contentStyle={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(m) => String(m.medicationId)}
        renderItem={({ item }) => <InventoryCard item={item} onOpen={openItem} />}
        ListHeaderComponent={
          <InventoryHeader
            summary={firstPage?.summary}
            filters={filters}
            searchText={searchText}
            onSearchText={setSearchText}
            onStockFilter={setStock}
            onOpenFilters={() => setFilterSheetOpen(true)}
            activeFilterCount={activeFilterCount}
          />
        }
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          items.length > 0 ? (
            <View style={styles.footer}>
              {query.isFetchingNextPage ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text size="xs" color={colors.gray500}>
                  Showing {items.length} of {firstPage?.pagination.total ?? items.length} medications
                </Text>
              )}
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshing={query.isRefetching && !query.isFetchingNextPage}
        onRefresh={() => void query.refetch()}
        keyboardShouldPersistTaps="handled"
      />
      <InventoryFilterSheet visible={filterSheetOpen} filters={filters} onChange={changeFilters} onClose={() => setFilterSheetOpen(false)} />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { padding: 0, gap: 0 },
  list: { padding: 16, flexGrow: 1 },
  separator: { height: 12 },
  skeletons: { gap: 12 },
  skeleton: { borderRadius: radius.lg },
  footer: { alignItems: 'center', paddingVertical: 16 },
});

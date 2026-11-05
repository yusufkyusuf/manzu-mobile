import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { dashboardKeys } from '@/features/dashboard/api';

import { deleteInventoryItem, fetchCatalog, inventoryKeys, upsertInventoryItem } from './api';
import { STOCK_FILTER_STATUS } from './constants';
import type { InventoryFilters, UpsertInventoryRequest } from './types';

export const INVENTORY_PAGE_SIZE = 20;

export function useInventory(filters: InventoryFilters) {
  return useInfiniteQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      fetchCatalog(
        {
          page: pageParam,
          limit: INVENTORY_PAGE_SIZE,
          search: filters.search.trim() || undefined,
          status: STOCK_FILTER_STATUS[filters.stock] ?? 'stocked',
          prescriptionRequired: filters.prescription || undefined,
        },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.pages ? last.pagination.page + 1 : undefined),
  });
}

function useInvalidateInventory() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useUpsertInventoryItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ medicationId, body }: { medicationId: number; body: UpsertInventoryRequest }) => upsertInventoryItem(medicationId, body),
    onSettled: invalidate,
  });
}

export function useDeleteInventoryItem() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: (medicationId: number) => deleteInventoryItem(medicationId),
    onSettled: invalidate,
  });
}

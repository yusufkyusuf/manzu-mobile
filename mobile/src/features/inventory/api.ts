import { apiRequest } from '@/api/client';

import type { CatalogQuery, CatalogResponse, DeleteInventoryResponse, InventoryFilters, UpsertInventoryRequest, UpsertInventoryResponse } from './types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryFilters) => [...inventoryKeys.lists(), filters] as const,
  /** Catalog row handed from the list to the form screen (the web passes the row to the dialog). */
  item: (medicationId: number) => [...inventoryKeys.all, 'item', medicationId] as const,
};

export function fetchCatalog(query: CatalogQuery, signal?: AbortSignal): Promise<CatalogResponse> {
  return apiRequest<CatalogResponse>('/api/pharmacy/medications/catalog', { query: { ...query }, signal });
}

/** Upsert, exactly as the web's updateOrCreateInventoryItem. */
export function upsertInventoryItem(medicationId: number, body: UpsertInventoryRequest): Promise<UpsertInventoryResponse> {
  return apiRequest<UpsertInventoryResponse>(`/api/pharmacy/medications/${medicationId}`, { method: 'PATCH', body });
}

export function deleteInventoryItem(medicationId: number): Promise<DeleteInventoryResponse> {
  return apiRequest<DeleteInventoryResponse>(`/api/pharmacy/medications/${medicationId}`, { method: 'DELETE' });
}

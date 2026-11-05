import { apiRequest } from '@/api/client';

import type {
  BulkUpdateOrdersRequest,
  BulkUpdateOrdersResponse,
  OrderDetail,
  OrderFilters,
  OrdersQuery,
  OrdersResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from './types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
};

export function fetchOrders(query: OrdersQuery, signal?: AbortSignal): Promise<OrdersResponse> {
  return apiRequest<OrdersResponse>('/api/pharmacy/orders', { query: { ...query }, signal });
}

export function getOrder(orderId: number, signal?: AbortSignal): Promise<OrderDetail> {
  return apiRequest<OrderDetail>(`/api/pharmacy/orders/${orderId}`, { signal });
}

export function updateOrderStatus(orderId: number, body: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResponse> {
  return apiRequest<UpdateOrderStatusResponse>(`/api/pharmacy/orders/${orderId}`, { method: 'PATCH', body });
}

export function bulkUpdateOrders(body: BulkUpdateOrdersRequest): Promise<BulkUpdateOrdersResponse> {
  return apiRequest<BulkUpdateOrdersResponse>('/api/pharmacy/orders/bulk', { method: 'PATCH', body });
}

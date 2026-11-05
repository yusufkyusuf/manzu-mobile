import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/client';

import type { DashboardResponse } from './types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
};

export function getDashboard(signal?: AbortSignal): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>('/api/pharmacy/dashboard', { signal });
}

export const dashboardQueryOptions = queryOptions({
  queryKey: dashboardKeys.all,
  queryFn: ({ signal }) => getDashboard(signal),
});

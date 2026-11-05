import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/client';

import type { PayoutSummaryResponse } from './types';

export const payoutKeys = {
  all: ['payouts'] as const,
  summary: () => [...payoutKeys.all, 'summary'] as const,
};

export function getPayoutSummary(signal?: AbortSignal): Promise<PayoutSummaryResponse> {
  return apiRequest<PayoutSummaryResponse>('/api/pharmacy/payouts/summary', { signal });
}

export const payoutSummaryQueryOptions = queryOptions({
  queryKey: payoutKeys.summary(),
  queryFn: ({ signal }) => getPayoutSummary(signal),
});

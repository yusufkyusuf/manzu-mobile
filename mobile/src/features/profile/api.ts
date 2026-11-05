import { queryOptions } from '@tanstack/react-query';

import { apiRequest } from '@/api/client';

import type { ProfileResponse } from './types';

export const profileKeys = {
  all: ['profile'] as const,
};

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/pharmacy/profile', { signal });
}

export const profileQueryOptions = queryOptions({
  queryKey: profileKeys.all,
  queryFn: ({ signal }) => getProfile(signal),
  staleTime: 5 * 60_000,
});

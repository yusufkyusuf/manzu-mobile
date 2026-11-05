import { apiRequest } from '@/api/client';

import type { ProfileResponse } from './types';

export const profileKeys = {
  all: ['profile'] as const,
};

export function getProfile(signal?: AbortSignal): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/api/pharmacy/profile', { signal });
}

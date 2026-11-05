import { apiRequest } from '@/api/client';

import type { LoginRequest, LoginResponse } from './types';

export function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Same sanitising as manzu-f pharmacyAuthAPI.login.
  const body: LoginRequest = {
    email: String(credentials.email).trim().toLowerCase().slice(0, 200),
    pin: String(credentials.pin).trim(),
  };
  return apiRequest<LoginResponse>('/api/auth/login', { method: 'POST', body, auth: false });
}

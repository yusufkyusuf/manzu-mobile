import type { ApiError } from '@/api/errors';

// Same copy as manzu-f handlePharmacyAuthError.
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please log in again.';
export const AUTH_FAILED_MESSAGE = 'Authentication failed. Please log in again.';

export function authMessageFor(error: ApiError): string {
  return error.code === 'TOKEN_EXPIRED' ? SESSION_EXPIRED_MESSAGE : AUTH_FAILED_MESSAGE;
}

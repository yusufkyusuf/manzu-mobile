import { jwtDecode } from 'jwt-decode';

// Shape signed in manzu-b src/domains/auth/pharmacy/pharmacy-auth.service.js (expiresIn: '1d').
export interface PharmacyJwtPayload {
  userId: number;
  pharmacyId: number;
  role: string;
  iat?: number;
  exp?: number;
}

/** Decodes without verifying (the server verifies). Returns null if malformed. */
export function decodePharmacyToken(token: string): PharmacyJwtPayload | null {
  try {
    const payload = jwtDecode<PharmacyJwtPayload>(token);
    if (!payload || typeof payload.userId !== 'number' || typeof payload.pharmacyId !== 'number') return null;
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload: PharmacyJwtPayload, skewSeconds = 30): boolean {
  if (!payload.exp) return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function tokenExpiresAt(payload: PharmacyJwtPayload): number | null {
  return payload.exp ? payload.exp * 1000 : null;
}

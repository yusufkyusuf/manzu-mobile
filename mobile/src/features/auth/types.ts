// Prisma enums (manzu-b prisma/schema.prisma).
export type PharmacyUserRole = 'MANAGER' | 'PHARMACIST' | 'ADMIN' | 'STAFF' | 'OWNER' | 'TECHNICIAN';
export type PharmacyStatus = 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED' | 'CLOSED';
export type PharmacyType = 'COMMUNITY' | 'HOSPITAL' | 'SPECIALTY' | 'PMV';

// POST /api/auth/login — manzu-b routes/auth.js (loginSchema in utils/adminValidation.js).
export interface LoginRequest {
  email: string;
  pin: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: { id: number; email: string; name: string; role: PharmacyUserRole };
  pharmacy: { id: number; name: string };
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: PharmacyUserRole;
}

export interface SessionPharmacy {
  id: number;
  name: string;
  status?: PharmacyStatus;
  isActive?: boolean;
  logoUrl?: string | null;
}

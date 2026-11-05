export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 20_000;

// Never call these (PLAN.md §4): POST /api/pharmacy/change-password corrupts PINs;
// /api/auth/verify and GET /api/pharmacy/sales/:saleId have no backend route.
export const FORBIDDEN_PATHS: RegExp[] = [
  /^\/api\/pharmacy\/change-password\b/,
  /^\/api\/auth\/verify\b/,
  /^\/api\/pharmacy\/sales\/(?!export\b)[^/?]+/,
];

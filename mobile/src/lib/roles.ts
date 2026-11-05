// Backend authorizeRoles('MANAGER') compares req.user.role === 'MANAGER'.
export function isManager(role: string | null | undefined): boolean {
  return role === 'MANAGER';
}

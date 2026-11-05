import { Redirect } from 'expo-router';

import { ComingSoon } from '@/components/ui';
import { useIsManager } from '@/features/auth/hooks';

export default function StaffRoute() {
  const manager = useIsManager();
  if (!manager) return <Redirect href="/more" />;
  return <ComingSoon title="Staff" milestone={7} />;
}

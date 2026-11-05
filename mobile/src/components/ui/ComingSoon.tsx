import { Construction } from 'lucide-react-native';

import { EmptyState } from './StateViews';
import { Screen } from './Screen';
import { Text } from './Text';
import { colors } from '@/theme';

/** Placeholder for screens scheduled in later milestones (PLAN.md §5). */
export function ComingSoon({ title, milestone }: { title: string; milestone: number }) {
  return (
    <Screen>
      <Text size="2xl" weight="bold" color={colors.gray900}>
        {title}
      </Text>
      <EmptyState icon={Construction} title="Coming soon" description={`This screen is built in milestone ${milestone}.`} />
    </Screen>
  );
}

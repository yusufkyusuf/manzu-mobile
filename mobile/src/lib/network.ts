import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/** Mirrors React Query's onlineManager (fed by NetInfo in api/queryClient.ts). */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (cb) => onlineManager.subscribe(cb),
    () => onlineManager.isOnline(),
    () => true,
  );
}

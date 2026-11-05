import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { focusManager, onlineManager, QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { AppState, Platform } from 'react-native';

import { ApiError } from './errors';

const DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: DAY,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Offline is read-only: mutations fail immediately instead of pausing and replaying later.
      networkMode: 'always',
      retry: false,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'manzu-pharmacy-query-cache',
  throttleTime: 1000,
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: DAY,
  buster: 'v1',
  dehydrateOptions: {
    shouldDehydrateMutation: () => false,
    shouldDehydrateQuery: (query) => query.state.status === 'success' && query.meta?.persist !== false,
  },
};

let listenersBound = false;

export function bindReactQueryNativeListeners(): void {
  if (listenersBound) return;
  listenersBound = true;

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    }),
  );

  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
  }
}

export async function clearQueryCache(): Promise<void> {
  queryClient.clear();
  await queryPersister.removeClient();
}

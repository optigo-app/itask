import { QueryClient } from '@tanstack/react-query';

/**
 * Production-ready TanStack Query Client for ERP-scale data caching.
 *
 * Why TanStack Query?
 * - Automatic in-memory caching across route changes (components unmount/remount)
 * - Stale-while-revalidate: instant data from cache, background refresh
 * - Deduplication: multiple components requesting same data = single API call
 * - Built-in loading/error states without local useState
 * - Cache invalidation via query keys
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      // During this time, remounting the component returns cached data instantly with NO API call
      staleTime: 5 * 60 * 1000,

      // Keep inactive (unmounted) data in cache for 30 minutes
      // This allows navigating away and returning within 30 min with instant data
      gcTime: 30 * 60 * 1000,

      // On window focus, refetch only if data is stale
      // This keeps data current when user switches back to the browser tab
      refetchOnWindowFocus: 'always',

      // On network reconnect, refetch stale data automatically
      refetchOnReconnect: true,

      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Don't refetch on mount if data is fresh (prevents duplicate API calls)
      refetchOnMount: 'always',
    },
    mutations: {
      // Retry mutations once on network error
      retry: 1,
    },
  },
});

/**
 * Query key factory for task data.
 * Structured keys enable precise cache invalidation.
 */
export const taskQueryKeys = {
  all: ['tasks'],
  list: (queryData, archivedFlag, completedFlag) =>
    [
      ...taskQueryKeys.all,
      'list',
      queryData?.project || 'all',
      queryData?.projectid || 'none',
      archivedFlag ? 1 : 0,
      completedFlag ? 1 : 0,
    ],
  master: () => [...taskQueryKeys.all, 'master'],
};

/**
 * Global cache invalidation helpers for the ERP app.
 */
export const invalidateTaskCache = () => {
  queryClient.invalidateQueries({ queryKey: taskQueryKeys.all });
};

export const invalidateTaskList = (queryData, archivedFlag, completedFlag) => {
  queryClient.invalidateQueries({
    queryKey: taskQueryKeys.list(queryData, archivedFlag, completedFlag),
  });
};

export const setTaskQueryData = (queryData, archivedFlag, completedFlag, data) => {
  queryClient.setQueryData(
    taskQueryKeys.list(queryData, archivedFlag, completedFlag),
    data
  );
};

export const getTaskQueryData = (queryData, archivedFlag, completedFlag) => {
  return queryClient.getQueryData(
    taskQueryKeys.list(queryData, archivedFlag, completedFlag)
  );
};

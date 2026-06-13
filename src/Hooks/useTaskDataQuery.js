import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generateCacheKey,
  getTabDataCache,
  setTabDataCache,
} from '../Utils/IndexedDB/taskDataCache';
import { taskQueryKeys } from '../Utils/QueryClient/queryClient';
import { fetchTaskDataFullApi } from '../Api/TaskApi/TaskDataFullApi';
import { fetchModuleDataApi } from '../Api/TaskApi/ModuleDataApi';
import { fetchMasterGlFunc } from '../Utils/globalfun';

/**
 * Production-ready data fetching hook for Task tabs.
 *
 * Combines:
 * 1. TanStack Query (in-memory cache across route changes)
 * 2. IndexedDB (persistent storage across browser refreshes)
 * 3. Background refetching (stale-while-revalidate)
 *
 * Why this architecture?
 * - React Query provides instant data when remounting after route navigation
 *   (data stays in memory even when component unmounts)
 * - IndexedDB provides instant data after browser refresh/hard reload
 *   (survives full page reloads, up to 24-hour cache)
 * - Together they eliminate ALL unnecessary API calls while keeping data fresh.
 */

/**
 * Fetch and format master data (status, priority, departments, etc.)
 * Master data changes rarely, so we cache it aggressively.
 */
const fetchMasterDataForQuery = async () => {
  let storedStructuredData = localStorage.getItem('structuredMasterData');
  let structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;

  if (!structuredData) {
    await fetchMasterGlFunc();
    storedStructuredData = localStorage.getItem('structuredMasterData');
    structuredData = storedStructuredData ? JSON.parse(storedStructuredData) : null;
  }

  const getSessionData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  return {
    statusData: getSessionData('taskstatusData'),
    secStatusData: getSessionData('tasksecstatusData'),
    priorityData: getSessionData('taskpriorityData'),
    taskDepartment: getSessionData('taskdepartmentData'),
    taskProject: getSessionData('taskprojectData'),
    taskCategory: getSessionData('taskworkcategoryData'),
    taskAssigneeData: getSessionData('taskAssigneeData'),
    taskBugStatusData: getSessionData('taskbugstatusData'),
    taskBugPriorityData: getSessionData('taskbugpriorityData'),
  };
};

/**
 * Fetch raw task data from API.
 */
const fetchTaskList = async (queryData, externalFilters, archivedFlag, completedFlag) => {
  let parsedData = null;
  if (queryData) {
    parsedData = queryData;
  }

  // Don't call treelist without taskid — use taskmodulelist instead
  const taskid = parsedData?.taskid;
  const hasTaskId = taskid !== undefined && taskid !== '' && taskid !== '0' && taskid !== 0;

  let response;
  if (!hasTaskId) {
    response = await fetchModuleDataApi({ taskid: 0, moduleid: 0 });
  } else {
    response = await fetchTaskDataFullApi({
      ...(parsedData || {}),
      ...externalFilters,
      isarchive: archivedFlag ? 1 : 0,
      iscompleted: completedFlag ? 1 : 0,
    });
  }

  return response || [];
};

/**
 * Main hook: useTaskDataQuery
 *
 * @param {Object} queryData - The tab's queryDataOverride (project, module, etc.)
 * @param {Object} options - { archivedFlag, completedFlag, enabled, refreshKey, silent, tabId }
 */
export const useTaskDataQuery = (queryData, options = {}) => {
  const {
    archivedFlag = false,
    completedFlag = false,
    enabled = true,
    refreshKey = 0,
    silent = false,
    tabId,
  } = options;

  const queryClient = useQueryClient();
  const cacheKeyRef = useRef(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Generate deterministic cache key for this tab's data configuration
  const cacheKey = generateCacheKey(queryData, archivedFlag, completedFlag);
  cacheKeyRef.current = cacheKey;

  // TanStack Query key for this specific tab configuration
  const queryKey = taskQueryKeys.list(queryData, archivedFlag, completedFlag);

  // ───────────────────────────────────────────────
  // 1. MASTER DATA QUERY (cached globally, refetched rarely)
  // ───────────────────────────────────────────────
  const {
    data: masterData,
    isLoading: isMasterLoading,
  } = useQuery({
    queryKey: taskQueryKeys.master(),
    queryFn: fetchMasterDataForQuery,
    staleTime: 30 * 60 * 1000, // 30 minutes - master data rarely changes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled,
  });

  // ───────────────────────────────────────────────
  // 2. TASK LIST QUERY (the main heavy dataset)
  // ───────────────────────────────────────────────
  const {
    data: taskListData,
    isLoading: isTaskListLoading,
    isFetching: isTaskListFetching,
    isError: isTaskListError,
    error: taskListError,
    refetch: refetchTaskList,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const rawData = await fetchTaskList(queryData, {}, archivedFlag, completedFlag);

      // Store successful fetch in IndexedDB for persistence across refreshes
      if (tabId && cacheKeyRef.current) {
        await setTabDataCache(tabId, cacheKeyRef.current, {
          rawData,
          fetchedAt: Date.now(),
        });
      }

      return rawData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in inactive cache
    enabled: false, // NEVER auto-fetch — only explicit refetch via refreshKey
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });

  // ───────────────────────────────────────────────
  // 3. INDEXEDDB HYDRATION (on mount / after refresh)
  // If React Query cache is cold (e.g., after browser refresh),
  // try to populate it from IndexedDB instantly.
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !tabId) return;

    const hydrateFromIndexedDB = async () => {
      // Check if React Query already has data (from memory or previous session)
      const existingData = queryClient.getQueryData(queryKey);
      if (existingData) {
        setIsInitialLoading(false);
        return;
      }

      // Try IndexedDB fallback
      const cached = await getTabDataCache(cacheKey);
      if (cached?.data?.rawData) {
        // Seed React Query cache with IndexedDB data
        queryClient.setQueryData(queryKey, cached.data.rawData);
        // NOTE: We do NOT auto-refetch here. The user explicitly requested
        // that data only refreshes when the refresh button is pressed.
        // Tab switches must NOT trigger API calls.
        setIsInitialLoading(false);
        return;
      }

      // No data anywhere (React Query cache empty, IndexedDB empty).
      // This happens on first visit or after cache cleared.
      // Trigger an initial fetch.
      if (!silent) {
        refetchTaskList();
      }

      setIsInitialLoading(false);
    };

    hydrateFromIndexedDB();
  }, [enabled, tabId, cacheKey, queryKey, queryClient, refetchTaskList, silent]);

  // ───────────────────────────────────────────────
  // 4. MANUAL REFRESH VIA refreshKey
  // The parent component increments refreshKey to force a refetch.
  // ───────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || refreshKey === 0) return;

    // Invalidate and refetch this specific tab's data
    refetchTaskList({ cancelRefetch: true });
  }, [refreshKey, enabled, refetchTaskList]);

  // ───────────────────────────────────────────────
  // 5. DERIVED LOADING STATE
  // Show loading only on initial load OR explicit refresh.
  // Background refetches don't show loading UI.
  // ───────────────────────────────────────────────
  const showLoading =
    isInitialLoading || (isTaskListLoading && !taskListData) || isMasterLoading;

  const showFetching = isTaskListFetching && !isTaskListLoading; // Background refetch indicator

  return {
    // Data
    taskRawData: taskListData || [],
    masterData: masterData || {},

    // Loading states
    isLoading: showLoading,
    isFetching: showFetching,
    isError: isTaskListError,
    error: taskListError,

    // Actions
    refetch: refetchTaskList,

    // Master data arrays (for compatibility with existing code)
    priorityData: masterData?.priorityData || [],
    statusData: masterData?.statusData || [],
    secStatusData: masterData?.secStatusData || [],
    taskDepartment: masterData?.taskDepartment || [],
    taskProject: masterData?.taskProject || [],
    taskCategory: masterData?.taskCategory || [],
    taskAssigneeData: masterData?.taskAssigneeData || [],
    taskBugStatusData: masterData?.taskBugStatusData || [],
    taskBugPriorityData: masterData?.taskBugPriorityData || [],
  };
};

export default useTaskDataQuery;

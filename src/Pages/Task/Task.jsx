import React, { Suspense, useEffect, useRef, useState } from "react";
import "./Task.scss";
import HeaderButtons from "../../Components/Task/FilterComponent/HeaderButtons";
import Filters from "../../Components/Task/FilterComponent/Filters";
import { Box, Chip, Typography, useMediaQuery, Dialog, DialogContent, CircularProgress } from "@mui/material";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { actualTaskData, Advfilters, archivedTask, completedTask, copyRowData, fetchlistApiCall, filterDrawer, masterDataValue, openFormDrawer, selectedCategoryAtom, selectedRowData, TaskData, taskLength, viewMode } from "../../Recoil/atom";
import { filterNestedTasksByView, filterTasksByValidTaskNo, flattenTasks, formatDate2, getCategoryTaskSummary, getUserProfileData, handleAddApicall, isTaskDue, isTaskToday, removeTaskRecursively } from "../../Utils/globalfun";
import { useLocation, useNavigate } from "react-router-dom";
import FiltersDrawer from "../../Components/Task/FilterComponent/FilterModal";
import FilterChips from "../../Components/Task/FilterComponent/FilterChip";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";
import { useTaskDataQuery } from "../../Hooks/useTaskDataQuery";
import { MoveTaskApi } from "../../Api/TaskApi/MoveTaskApi";
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import CloseIcon from '@mui/icons-material/Close';
import { fetchArchiveTaskDataApi } from "../../Api/TaskApi/ArchiveTasklistApi";
import { fetchTaskDataFullApi } from "../../Api/TaskApi/TaskDataFullApi";
import { fetchModuleDataApi } from "../../Api/TaskApi/ModuleDataApi";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { AddPrintSheetCountApi } from "../../Api/TaskApi/PrintSheetApi";
import { TaskFrezzeApi } from "../../Api/TaskApi/TasKFrezzeAPI";
import { useTabStore } from "../../Store/useTabStore";
import { generateCacheKey, setTabDataCache, clearAllTabDataCache } from "../../Utils/IndexedDB/taskDataCache";
import { queryClient, taskQueryKeys, invalidateTaskCache } from "../../Utils/QueryClient/queryClient";


const TaskTable = React.lazy(() => import("../../Components/Task/ListView/TaskTableList"));
const ArchiveTable = React.lazy(() => import("../../Components/Task/ListView/ArchiveTable"));
const KanbanView = React.lazy(() => import("../../Components/Task/KanbanView/KanbanView"));
const CardView = React.lazy(() => import("../../Components/Task/CardView/CardView"));
const DynamicFilterReport = React.lazy(() => import("../../Components/Task/DynamicReport/DynamicFilterReport"))

const Task = ({ tabId, queryDataOverride, isActive }) => {
  const isTabMode = !!tabId;
  const initialTabState = isTabMode ? useTabStore.getState().getTabState(tabId) : null;

  // Only run data fetching/processing for the currently active tab.
  // Inactive tabs stay frozen with their existing state (no background API calls).
  const shouldRun = !isTabMode || isActive;
  const date = new Date();
  const isLaptop = useMediaQuery("(max-width:1150px)");
  const location = useLocation();
  const navigate = useNavigate();
  const userProfile = getUserProfileData();

  // Check if the path is exactly /tasks
  const isRedirectPath = !isTabMode && location.pathname === '/tasks';
  const [order, setOrder] = useState(initialTabState?.order || "asc");
  const [orderBy, setOrderBy] = useState(initialTabState?.orderBy || "entrydate");
  const [page, setPage] = useState(initialTabState?.page || 1);
  const [rowsPerPage, setRowsPerPage] = useState(initialTabState?.rowsPerPage || 100);
  const searchParams = new URLSearchParams(location.search);
  const masterData = useRecoilValue(masterDataValue);
  const [activeButton, setActiveButton] = useState(initialTabState?.activeButton || "table");
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom);

  // ── Tab-scoped state ──
  const [localFilters, setLocalFilters] = useState(() => {
    if (initialTabState?.dataLoaded && initialTabState?.filters) {
      return initialTabState.filters;
    }
    const defaultFilters = {
      category: [], searchTerm: '', status: '', priority: '', department: '',
      assignee: '', project: '', dueDate: null, startDate: null,
    };
    if (queryDataOverride?.fromFullTaskView && queryDataOverride?.module) {
      defaultFilters.searchTerm = queryDataOverride.module;
    }
    return defaultFilters;
  });
  const [globalFilters, setGlobalFilters] = useRecoilState(Advfilters);
  const filters = isTabMode ? localFilters : globalFilters;
  const setFilters = isTabMode ? setLocalFilters : setGlobalFilters;

  const showAdvancedFil = useRecoilValue(filterDrawer);

  const [localTasks, setLocalTasks] = useState(initialTabState?.tasks || []);
  const [globalTasks, setGlobalTasks] = useRecoilState(TaskData);
  const tasks = isTabMode ? localTasks : globalTasks;
  const setTasks = isTabMode ? setLocalTasks : setGlobalTasks;

  const setTaskDataLength = useSetRecoilState(taskLength)
  const setActualTaskData = useSetRecoilState(actualTaskData);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const [selectedRow, setSelectedRow] = useRecoilState(selectedRowData);
  const [copiedData, setCopiedData] = useRecoilState(copyRowData);

  // ── Tab-scoped completed / archived flags ──
  const [localCompletedFlag, setLocalCompletedFlag] = useState(initialTabState?.completedFlag || false);
  const [localArchivedFlag, setLocalArchivedFlag] = useState(initialTabState?.archivedFlag || false);
  const [globalCompletedFlag, setGlobalCompletedFlag] = useRecoilState(completedTask);
  const globalArchivedFlag = useRecoilValue(archivedTask);
  const setGlobalArchivedTasks = useSetRecoilState(archivedTask);
  const completedFlag = isTabMode ? localCompletedFlag : globalCompletedFlag;
  const setCompletedFlag = isTabMode ? setLocalCompletedFlag : setGlobalCompletedFlag;
  const archivedFlag = isTabMode ? localArchivedFlag : globalArchivedFlag;
  const setArchivedTasks = isTabMode ? setLocalArchivedFlag : setGlobalArchivedTasks;

  // ── Tab-scoped view mode & drawer ──
  const [localViewMode, setLocalViewMode] = useState(initialTabState?.viewMode || "me");
  const [localFormDrawerOpen, setLocalFormDrawerOpen] = useState(false);
  const [globalViewMode, setGlobalViewMode] = useRecoilState(viewMode);
  const globalFormDrawerOpen = useRecoilValue(openFormDrawer);
  const meTeamView = isTabMode ? localViewMode : globalViewMode;
  const setMeTeamView = isTabMode ? setLocalViewMode : setGlobalViewMode;
  const formDrawerOpen = isTabMode ? localFormDrawerOpen : globalFormDrawerOpen;
  const toggleFormDrawer = () => {
    if (isTabMode) setLocalFormDrawerOpen((p) => !p);
  };
  const [submitRefreshKey, setSubmitRefreshKey] = useState(0);
  const silentRefreshRef = useRef(false);
  const lastValidRawDataRef = useRef(null);
  const handleAfterSubmit = () => {
    if (isTabMode) {
      silentRefreshRef.current = true;
      setSubmitRefreshKey((k) => k + 1);
    }
  };

  useEffect(() => {
    silentRefreshRef.current = false;
  });

  // Track which refreshKey we've already fetched data for.
  // -1 means "never fetched yet" → forces fetch on first active mount.
  // After a successful fetch, this ref is updated to submitRefreshKey.
  // When switching tabs, if the key hasn't changed, enabledForApi stays false → NO API call.
  const lastFetchedRefreshKeyRef = useRef(
    initialTabState?.dataLoaded ? submitRefreshKey : -1
  );

  // enabledForApi = true ONLY when we genuinely need fresh data:
  // 1. Non-tab mode always fetches, OR
  // 2. Tab mode: active AND (never fetched OR refreshKey changed since last fetch)
  const enabledForApi = !isTabMode || (isActive && lastFetchedRefreshKeyRef.current !== submitRefreshKey);

  // ── Tab-scoped drawer form data ──
  const [tabDrawerFormData, setTabDrawerFormData] = useState(null);
  const [tabDrawerRootSubroot, setTabDrawerRootSubroot] = useState(null);

  const handleOpenTabDrawer = (data = null, rootSubroot = null) => {
    setTabDrawerFormData(data);
    setTabDrawerRootSubroot(rootSubroot);
    if (isTabMode) setLocalFormDrawerOpen(true);
  };

  const handleNewTaskInTab = () => {
    setTabDrawerFormData({
      moduleid: queryDataOverride?.moduleid,
      taskid: queryDataOverride?.taskid,
      projectid: queryDataOverride?.projectid,
      taskPr: queryDataOverride?.project,
      maingroupids: queryDataOverride?.maingroupids,
      isLimited: queryDataOverride?.isLimited,
      isreadonly: queryDataOverride?.isreadonly,
    });
    setTabDrawerRootSubroot({ Task: "subroot" });
    if (isTabMode) setLocalFormDrawerOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;

    // 1. Remove from the displayed tasks immediately (tab-scoped or global)
    setTasks((prevTasks) => removeTaskRecursively(prevTasks, taskId));
    // 2. Keep global Recoil atoms in sync so other views (calendar, reports) don't show the deleted task
    setGlobalTasks((prevTasks) => removeTaskRecursively(prevTasks, taskId));
    setActualTaskData((prevTasks) => removeTaskRecursively(prevTasks, taskId));

    // 3. Update the active TanStack Query cache for this tab so it doesn't restore the task on switch
    const queryKey = taskQueryKeys.list(queryDataOverride, archivedFlag, completedFlag);
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData || !Array.isArray(oldData?.rd1)) return oldData;
      return {
        ...oldData,
        rd1: removeTaskRecursively(oldData.rd1, taskId),
      };
    });

    // 4. Update IndexedDB cache for the same tab configuration
    if (isTabMode && tabId) {
      const cacheKey = generateCacheKey(queryDataOverride, archivedFlag, completedFlag);
      const updatedRawData = queryClient.getQueryData(queryKey);
      if (updatedRawData) {
        setTabDataCache(tabId, cacheKey, {
          rawData: updatedRawData,
          fetchedAt: Date.now(),
        }).catch(() => {});
      }
    }

    // 5. Call the delete API
    try {
      const response = await deleteTaskDataApi({ taskid: taskId });
      if (response?.rd?.[0]?.stat == 1) {
        toast.success("Task deleted successfully!");
        // Clear all IndexedDB + React Query caches so every tab/project view is consistent
        clearAllTabDataCache().catch(() => {});
        invalidateTaskCache();
        setOpenChildTask(Date.now());
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please refresh to see the latest state.");
    }
  };

  const encodedData = isTabMode
    ? (queryDataOverride ? encodeURIComponent(btoa(JSON.stringify(queryDataOverride))) : null)
    : searchParams.get("data");

  const [CategoryTSummary, setCategoryTSummary] = useState(initialTabState?.categorySummary || []);
  const [contextMenu, setContextMenu] = useState(null);
  const [parsedDataObj, setParsedDataObj] = useState(queryDataOverride || null);
  const [archiveTasks, setArchiveTasks] = useState(initialTabState?.archiveTasks || []);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [pendingCompleteChange, setPendingCompleteChange] = useState(null);
  const [completedFilterLoading, setCompletedFilterLoading] = useState(false);

  // Sync state back to useTabStore when it changes
  useEffect(() => {
    if (!isTabMode) return;
    useTabStore.getState().updateTabState(tabId, {
      order,
      orderBy,
      page,
      rowsPerPage,
      activeButton,
      filters: localFilters,
      tasks: localTasks,
      completedFlag: localCompletedFlag,
      archivedFlag: localArchivedFlag,
      viewMode: localViewMode,
      categorySummary: CategoryTSummary,
      archiveTasks,
      dataLoaded: true,
    });
  }, [
    isTabMode,
    tabId,
    order,
    orderBy,
    page,
    rowsPerPage,
    activeButton,
    localFilters,
    localTasks,
    localCompletedFlag,
    localArchivedFlag,
    localViewMode,
    CategoryTSummary,
    archiveTasks,
  ]);

  const encodedDataOverride = isTabMode && queryDataOverride
    ? encodeURIComponent(btoa(JSON.stringify(queryDataOverride)))
    : undefined;

  // TanStack Query + IndexedDB caching layer for tab data
  // This is the PRIMARY data source for tab mode.
  // It fetches from API on refresh, or loads from IndexedDB on tab switch.
  const {
    taskRawData,
    isFetching: isBackgroundRefreshing,
    refetch: refetchTaskData,
  } = useTaskDataQuery(queryDataOverride, {
    archivedFlag,
    completedFlag,
    enabled: isTabMode && shouldRun && isActive,
    refreshKey: submitRefreshKey,
    silent: silentRefreshRef.current,
    tabId: isTabMode ? tabId : undefined,
  });

  const {
    iswhMLoading,
    iswhTLoading,
    taskFinalData,
    taskDepartment,
    taskProject,
    taskCategory,
    priorityData,
    statusData,
    secStatusData,
    taskAssigneeData } = useFullTaskFormatFile({}, {
    encodedDataOverride,
    archivedFlagOverride: isTabMode ? archivedFlag : undefined,
    completedFlagOverride: isTabMode ? completedFlag : undefined,
    enabled: !isTabMode && enabledForApi, // NEVER fetch from API in tab mode
    refreshKey: submitRefreshKey,
    silent: silentRefreshRef.current,
    rawDataOverride: isTabMode
      ? (taskRawData?.rd1 ? taskRawData : lastValidRawDataRef.current)
      : undefined,
  });

  // After a successful fetch, record the refreshKey so we don't re-fetch
  // when this tab becomes active again (e.g., switching tabs).
  useEffect(() => {
    if (!iswhTLoading && taskFinalData?.length > 0) {
      lastFetchedRefreshKeyRef.current = submitRefreshKey;
    }
  }, [iswhTLoading, taskFinalData, submitRefreshKey]);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMilestonesOnly, setShowMilestonesOnly] = useState(false);
  const [localTaskEdits, setLocalTaskEdits] = useState({});
  const processingCancelledRef = useRef(false);
  const processingTimerRef = useRef(null);

  // Preserve last valid raw data so tab switches never blank even if
  // taskRawData briefly becomes undefined during background revalidation.
  useEffect(() => {
    if (taskRawData?.rd1) {
      lastValidRawDataRef.current = taskRawData;
    }
  }, [taskRawData]);

  useEffect(() => {
    if (isTabMode) return;
    setTasks([]);
    setArchivedTasks(false);
    if (isRedirectPath) {
      setOpenChildTask(false)
    } else {
      setOpenChildTask(true)
    }
  }, [location.pathname, isTabMode]);

  useEffect(() => {
    if (isTabMode) return;
    // Don't load any data if on redirect path
    if (isRedirectPath) {
      setTasks([]);
      setArchivedTasks(false);
    }
  }, [isRedirectPath, isTabMode]);

  useEffect(() => {
    const cancelCurrentProcessing = () => {
      processingCancelledRef.current = true;
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
      if (!isTabMode) {
        setTasks([]);
        setCategoryTSummary([]);
        setArchiveTasks([]);
      }
    };
    window.addEventListener("app:route-change-start", cancelCurrentProcessing);
    return () => {
      window.removeEventListener("app:route-change-start", cancelCurrentProcessing);
    };
  }, [setTasks, isTabMode]);

  useEffect(() => {
    if (!shouldRun) return;
    processingCancelledRef.current = false;
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    const activeTab = localStorage?.getItem('activeTaskTab');

    const decodeData = () => {
      if (isTabMode) return queryDataOverride || null;
      if (!encodedData) return null;
      try {
        const decoded = decodeURIComponent(encodedData);
        return JSON.parse(atob(decoded));
      } catch (error) {
        console.error("Error decoding or parsing encodedData:", error);
        return null;
      }
    };

    const parsedData = decodeData();
    setParsedDataObj(parsedData);
    const userId = userProfile?.id;
    const hasLocalEdits = Object.keys(localTaskEdits || {}).length > 0;

    const applyLocalEditsRecursively = (task) => {
      const edits = localTaskEdits[task.taskid] || {};
      const nextSubtasks = task.subtasks?.map(applyLocalEditsRecursively) || [];
      const hasSubtaskChanges = nextSubtasks.some((sub, idx) => sub !== task.subtasks?.[idx]);
      if (!hasSubtaskChanges && Object.keys(edits).length === 0) {
        return task;
      }
      return {
        ...task,
        ...edits,
        subtasks: nextSubtasks,
      };
    };

    const processTasks = (tasks) => {
      const run = () => {
        if (processingCancelledRef.current) return;

        let output = tasks || [];
        if (activeTab === "bugview") {
          output = filterTasksByValidTaskNo(output);
        }

        if (hasLocalEdits) {
          output = output.map(applyLocalEditsRecursively);
        }

        const summary = getCategoryTaskSummary(output, taskCategory);
        if (processingCancelledRef.current) return;

        setCategoryTSummary(summary);
        setTasks(activeTab === "bugview" ? flattenTasks(output) : output);
      };

      // In tab mode, always defer to next tick so tab switch feels instant.
      // In non-tab mode, only defer for large datasets (>300 tasks).
      const shouldDefer = isTabMode || (tasks?.length || 0) > 300;
      if (shouldDefer) {
        processingTimerRef.current = setTimeout(run, 0);
      } else {
        run();
      }
    };

    const rawTaskData = activeTab !== "bugview"
      ? taskFinalData?.TaskData
      : filterTasksByValidTaskNo(taskFinalData?.TaskData);

    if (!parsedData) {
      processTasks(rawTaskData);
    } else if (parsedData?.taskid) {
      const matchedTask = rawTaskData?.find(t => t.taskid === parsedData.taskid);

      if (matchedTask) {
        let subtasks = matchedTask.subtasks || [];
        subtasks = filterNestedTasksByView(subtasks, meTeamView, userId);
        processTasks(subtasks);
      } else {
        let filteredTasks = rawTaskData || [];
        if (parsedData?.projectid) {
          filteredTasks = filteredTasks.filter(
            t => t.projectid === parsedData.projectid
          );
        }
        filteredTasks = filterNestedTasksByView(filteredTasks, meTeamView, userId);
        processTasks(filteredTasks);
      }
    } else {
      let filteredTasks = rawTaskData || [];
      if (parsedData?.projectid) {
        filteredTasks = filteredTasks.filter(
          t => t.projectid === parsedData.projectid
        );
      }
      filteredTasks = filterNestedTasksByView(filteredTasks, meTeamView, userId);
      processTasks(filteredTasks);
    }

    return () => {
      processingCancelledRef.current = true;
      if (processingTimerRef.current) {
        clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    };
  }, [encodedData, taskFinalData, meTeamView, localTaskEdits]);

  const normalizeArchiveApiData = (apiData) => {
    const dataObj = apiData?.Data ? apiData.Data : apiData;
    const rd = dataObj?.rd;
    const rd1 = dataObj?.rd1;

    if (!Array.isArray(rd) || rd.length === 0 || !Array.isArray(rd1)) return [];
    const header = rd[0] || {};

    const keyToField = Object.keys(header).reduce((acc, k) => {
      acc[k] = header[k];
      return acc;
    }, {});

    return rd1.map((row) => {
      const out = {};
      Object.keys(keyToField).forEach((k) => {
        const fieldName = keyToField[k];
        out[fieldName] = row?.[k];
      });

      // keep consistent naming with other task UI
      if (out?.taskid != null && out?.taskid !== '') out.taskid = Number(out.taskid);
      if (out?.maintaskid != null && out?.maintaskid !== '') out.maintaskid = Number(out.maintaskid);

      return out;
    });
  };

  const parseIsReadonlyString = (readonlyStr) => {
    const mapping = {};
    if (readonlyStr) {
      readonlyStr.split(",").forEach((item) => {
        const [id, flag] = item.split("#");
        if (id && flag !== undefined) {
          mapping[id] = parseInt(flag);
        }
      });
    }
    return mapping;
  };

  const enhanceArchiveTask = (task) => {
    const priority = priorityData?.find((item) => item?.id == task?.priorityid);
    const department = taskDepartment?.find((item) => item?.id == task?.departmentid);
    const category = taskCategory?.find((item) => item?.id == task?.workcategoryid);
    const project = taskProject?.find((item) => item?.id == task?.projectid);

    const assigneeIdsRaw = task?.assigneeids ?? task?.assigneids;
    const assigneeIdArray = assigneeIdsRaw
      ? String(assigneeIdsRaw)
        ?.split(",")
        ?.map((id) => Number(id))
        ?.filter((n) => !Number.isNaN(n))
      : [];

    const readonlyMapping = parseIsReadonlyString(task?.isreadonly);
    const matchedAssignees = taskAssigneeData
      ?.filter((user) => assigneeIdArray?.includes(user.id))
      ?.map((user) => ({
        ...user,
        isreadonly: readonlyMapping[user.id] ?? 0,
      }));

    return {
      ...task,
      priority: priority ? priority?.labelname : task?.priority,
      taskDpt: department ? department?.labelname : task?.taskDpt,
      taskPr: project ? project?.labelname : task?.taskPr,
      category: category ? category?.labelname : task?.category,
      assignee: matchedAssignees ?? task?.assignee ?? [],
    };
  };

  useEffect(() => {
    if (!shouldRun) return;
    const fetchArchive = async () => {
      if (activeButton !== 'archive') return;
      setArchiveLoading(true);
      try {
        const apiData = await fetchArchiveTaskDataApi(parsedDataObj || {});
        const normalized = normalizeArchiveApiData(apiData);
        const enriched = (normalized || []).map((t) => enhanceArchiveTask(t));
        setArchiveTasks(enriched);
      } catch (e) {
        setArchiveTasks([]);
      } finally {
        setArchiveLoading(false);
      }
    };
    fetchArchive();
  }, [activeButton, parsedDataObj, priorityData, taskDepartment, taskCategory, taskAssigneeData, taskProject]);

  useEffect(() => {
    if (isTabMode) return;
    if (tasks) {
      setFilters({
        category: ['Today'],
        searchTerm: parsedDataObj?.fromFullTaskView ? parsedDataObj?.module : ""
      });
    }
  }, [parsedDataObj])

  // Filter change handler
  const handleFilterChange = (key, value) => {
    if (key === "clearFilter" && value == null) {
      setFilters({});
      return;
    }
    if (typeof value === "string" && value.startsWith("Select ")) {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters[key];
        return updatedFilters;
      });
      return;
    }
    if (key === "category" && Array.isArray(value) && value.length === 0) {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters[key];
        return updatedFilters;
      });
      setPage(1);
      return;
    }
    setFilters((prevFilters) => ({ ...prevFilters, [key]: value }));
    setPage(1);
  };

  const handleClearFilter = (filterKey, value = null) => {
    if (filterKey === 'category') {
      const updatedCategory = value ? filters.category.filter((cat) => cat !== value) : [];
      setFilters((prev) => ({ ...prev, category: updatedCategory }));
      setSelectedCategory(updatedCategory);
    } else if (filterKey === 'dueDate') {
      setFilters((prev) => ({ ...prev, dueDate: null }));
    } else if (filterKey === 'startDate') {
      setFilters((prev) => ({ ...prev, startDate: null }));
    } else if (filterKey === 'assignee') {
      setFilters((prev) => ({ ...prev, assignee: '' }));
      // We also need to clear the 'guest' state in Filters.jsx if we were using it there, 
      // but since it's local to Filters.jsx, we might need a way to sync it.
      // For now, clearing the filter in the atom will update the UI via Recoil.
    } else {
      setFilters((prev) => ({ ...prev, [filterKey]: '' }));
    }
  };

  const handleClearAllFilters = () => {
    setFilters({});
    setFilters({
      category: [],
      searchTerm: '',
      status: '',
      priority: '',
      department: '',
      assignee: '',
      project: '',
      dueDate: null,
      startDate: null,
    })
    setSelectedCategory('');
  };

  function descendingComparator(a, b, orderBy) {
    const valA = a[orderBy];
    const valB = b[orderBy];

    if (typeof valA === "string" && typeof valB === "string") {
      return valB.trim().localeCompare(valA.trim()); // descending
    }

    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
  }

  function recursiveSort(tasks = [], comparator) {
    return [...tasks]
      .sort(comparator)
      .map(task => ({
        ...task,
        subtasks: task.subtasks
          ? recursiveSort(task.subtasks, comparator)
          : []
      }));
  }

  function getComparator(order, orderBy) {
    return order === "asc"
      ? (a, b) => -descendingComparator(a, b, orderBy)
      : (a, b) => descendingComparator(a, b, orderBy);
  }

  // sorting  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = recursiveSort(tasks, getComparator(order, orderBy));

  const filteredData = sortedData
    ?.map((task) => {
      const {
        status,
        priority,
        assignee,
        searchTerm,
        dueDate,
        startDate,
        department,
        project,
        category,
      } = filters;

      const normalizedSearchTerm = searchTerm?.trim()?.toLowerCase();
      const isQuoted =
        (normalizedSearchTerm?.startsWith('"') && normalizedSearchTerm?.endsWith('"')) ||
        (normalizedSearchTerm?.startsWith("'") && normalizedSearchTerm?.endsWith("'"));

      const cleanSearchTerm = isQuoted
        ? normalizedSearchTerm.slice(1, -1)
        : normalizedSearchTerm;

      const resetInvalidFilters = () => {
        Object.keys(filters).forEach((key) => {
          const value = filters[key];
          if (
            value === "Select Department" ||
            value === "Select Status" ||
            value === "Select Priority" ||
            value === "Select Assignee" ||
            value === "Select Project"
          ) {
            filters[key] = "";
          }
        });
      };

      const isUnsetDeadline = (dateStr) => {
        const date = new Date(dateStr);
        return !dateStr || date.toISOString().slice(0, 10) === "1900-01-01";
      };

      resetInvalidFilters();

      const matchesNonSearchFilters = (item) => {
        const matchesCategory =
          !Array.isArray(category) ||
          category.length === 0 ||
          category.some((cat) => {
            const lowerCat = cat.toLowerCase();
            if (lowerCat === "due") {
              return isTaskDue(item?.DeadLineDate) && !isUnsetDeadline(item?.DeadLineDate);
            } else if (lowerCat === "unset deadline") {
              return isUnsetDeadline(item?.DeadLineDate);
            } else if (lowerCat === "today") {
              return isTaskToday(item?.StartDate);
            } else if (lowerCat === "new") {
              return item?.isnew == 1;
            } else if (lowerCat === "archive") {
              return item?.isarchive == 1;
            }
            return (item?.category ?? "").toLowerCase() === lowerCat;
          });

        const isWithinRange = (targetDate, range) => {
          if (!targetDate || !range || typeof range !== 'object' || !range.startDate || !range.endDate) return true;
          const date = new Date(targetDate);
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);

          // Normalize to start/end of day for accurate comparison
          date.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return date >= start && date <= end;
        };

        return (
          matchesCategory &&
          (status ? item?.status?.toLowerCase() === status?.toLowerCase() : true) &&
          (priority ? item?.priority?.toLowerCase() === priority?.toLowerCase() : true) &&
          (department ? item?.taskDpt?.toLowerCase() === department?.toLowerCase() : true) &&
          (project ? item?.taskPr?.toLowerCase() === project?.toLowerCase() : true) &&
          (dueDate ? isWithinRange(item?.DeadLineDate, dueDate) : true) &&
          (startDate ? isWithinRange(item?.StartDate, startDate) : true) &&
          (assignee
            ? item?.assignee?.some((a) => {
              const fullName = `${a?.firstname} ${a?.lastname}`?.toLowerCase();
              return fullName?.includes(assignee?.toLowerCase());
            })
            : true)
        );
      };

      const searchMatchFn = (value) => {
        if (!value) return false;
        const val = value.toLowerCase();

        if (isQuoted) {
          const exactWordRegex = new RegExp(`\\b${cleanSearchTerm}\\b`, "i");
          return exactWordRegex.test(val);
        } else {
          return val.includes(cleanSearchTerm);
        }
      };

      const matchesFilters = (item, parentMatchedByTaskNo = false) => {
        const fieldsToCheck = [
          item?.taskname,
          item?.taskno,
          item?.status,
          item?.priority,
          item?.description,
          item?.DeadLineDate,
          item?.taskPr,
          item?.taskDpt,
        ];

        const assignees = Array.isArray(item?.assignee)
          ? item.assignee.map((a) => `${a?.firstname} ${a?.lastname}`)
          : [item?.assignee];

        const matchesSearch =
          !searchTerm || [...fieldsToCheck, ...assignees].some(searchMatchFn);

        const selfTaskNoMatchesSearch = searchTerm && item?.taskno && searchMatchFn(item.taskno);

        const effectiveSearchMatch = matchesSearch || parentMatchedByTaskNo || selfTaskNoMatchesSearch;

        return matchesNonSearchFilters(item) && effectiveSearchMatch;
      };

      const filterRecursive = (item, parentMatchedByTaskNo = false) => {
        // Check favorites filter first (same as other filters)
        if (showFavoritesOnly) {
          const isTaskOrSubtaskFavorite = (taskItem) => {
            if (taskItem.isfavourite === 1) return true;
            if (taskItem.subtasks && taskItem.subtasks.length > 0) {
              return taskItem.subtasks.some(isTaskOrSubtaskFavorite);
            }
            return false;
          };

          const isFavorite = isTaskOrSubtaskFavorite(item);
          if (!isFavorite) return null;
        }

        // Check milestone filter
        if (showMilestonesOnly) {
          const isTaskOrSubtaskMilestone = (taskItem) => {
            if (taskItem.ismilestone == 1) return true;
            if (taskItem.subtasks && taskItem.subtasks.length > 0) {
              return taskItem.subtasks.some(isTaskOrSubtaskMilestone);
            }
            return false;
          };

          const isMilestone = isTaskOrSubtaskMilestone(item);
          if (!isMilestone) return null;
        }

        const selfTaskNoMatchesSearch = searchTerm && item?.taskno && searchMatchFn(item.taskno);

        const matches = matchesFilters(item, parentMatchedByTaskNo);
        const nextParentMatchedByTaskNo = parentMatchedByTaskNo || selfTaskNoMatchesSearch;

        const filteredSubtasks = item?.subtasks
          ?.map((sub) => filterRecursive(sub, nextParentMatchedByTaskNo))
          .filter(Boolean) || [];

        if (matches || filteredSubtasks.length > 0) {
          return {
            ...item,
            subtasks: filteredSubtasks,
          };
        }
        return null;
      };

      return filterRecursive(task);
    })
    ?.filter(Boolean);


  const handleTabBtnClick = (button) => {
    setActiveButton(button);
  }

  const handleTaskFavorite = (taskToUpdates) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task?.taskid === taskToUpdates?.taskid) {
            const updatedTask = {
              ...task,
              isfavourite: task?.isfavourite ? 0 : 1,
            };
            setLocalTaskEdits((prev) => ({
              ...prev,
              [task.taskid]: {
                ...(prev[task.taskid] || {}),
                isfavourite: task?.isfavourite ? 0 : 1,
              },
            }));
            handleAddApicall(updatedTask);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  };

  const handleFreezeTask = async (taskToUpdate) => {
    const taskId = taskToUpdate?.taskid;
    if (!taskId) return;

    const currentIsFreez = Number(taskToUpdate?.isFreez) === 1 ? 1 : 0;
    const nextIsFreez = currentIsFreez === 1 ? 0 : 1;

    const applyFreezeToSubtree = (subtasks = [], freezeValue) => {
      return subtasks?.map((subtask) => ({
        ...subtask,
        isFreez: freezeValue,
        subtasks: applyFreezeToSubtree(subtask.subtasks || [], freezeValue),
      }));
    };

    const updateTaskFreezeRecursively = (tasks, targetTaskId, freezeValue) => {
      return tasks?.map((task) => {
        if (task.taskid === targetTaskId) {
          return {
            ...task,
            isFreez: freezeValue,
            subtasks: applyFreezeToSubtree(task.subtasks || [], freezeValue),
          };
        }
        if (task.subtasks?.length > 0) {
          return {
            ...task,
            subtasks: updateTaskFreezeRecursively(task.subtasks, targetTaskId, freezeValue),
          };
        }
        return task;
      });
    };

    setTasks((prevTasks) => updateTaskFreezeRecursively(prevTasks, taskId, nextIsFreez));
    setLocalTaskEdits((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        isFreez: nextIsFreez,
      },
    }));

    try {
      const response = await TaskFrezzeApi({ taskid: taskId, isFreez: nextIsFreez });
      if (response?.rd?.[0]?.stat != 1) {
        throw new Error("Failed to update freeze state");
      }
      setOpenChildTask(Date.now());
    } catch (error) {
      setTasks((prevTasks) => updateTaskFreezeRecursively(prevTasks, taskId, currentIsFreez));
      setLocalTaskEdits((prev) => ({
        ...prev,
        [taskId]: {
          ...(prev[taskId] || {}),
          isFreez: currentIsFreez,
        },
      }));
      toast.error("Unable to update freeze state");
      console.error("Error freezing task:", error);
    }
  }

  const handleCompletedTaskFilter = async () => {
    setActiveButton('table');
    setCompletedFilterLoading(true);
    const nextCompleted = !completedFlag;
    setCompletedFlag(nextCompleted);

    if (isTabMode) {
      try {
        const taskid = queryDataOverride?.taskid;
        const hasTaskId = taskid !== undefined && taskid !== '' && taskid !== '0' && taskid !== 0;
        const response = hasTaskId
          ? await fetchTaskDataFullApi({
              ...queryDataOverride,
              isarchive: archivedFlag ? 1 : 0,
              isCompleted: nextCompleted ? 1 : 0,
            })
          : await fetchModuleDataApi({ taskid: 0, moduleid: 0 });

        // Seed the new cache key with the correct isCompleted data so the UI updates instantly
        const nextQueryKey = taskQueryKeys.list(queryDataOverride, archivedFlag, nextCompleted);
        queryClient.setQueryData(nextQueryKey, response);

        if (tabId) {
          const cacheKey = generateCacheKey(queryDataOverride, archivedFlag, nextCompleted);
          await setTabDataCache(tabId, cacheKey, {
            rawData: response,
            fetchedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
        toast.error("Failed to load completed tasks.");
      }
    } else {
      // Non-tab mode: rely on the existing fetch pipeline to re-query with the new completed flag
      setOpenChildTask(Date.now());
    }

    // Hide loader after a short delay to allow UI to settle
    setTimeout(() => {
      setCompletedFilterLoading(false);
    }, 500);
  };

  const handleArchivedTaskFilter = () => {
    setActiveButton('table');
    setArchivedTasks((prev) => !prev);
    if (!isTabMode) setOpenChildTask(Date.now());
  };

  const handleToggleFavoritesOnly = () => {
    setShowFavoritesOnly((prev) => !prev);
  };

  const handleToggleMilestonesOnly = () => {
    setShowMilestonesOnly((prev) => !prev);
  };

  const hasIncompleteSubtasks = (task) => {
    const children = Array.isArray(task?.subtasks) ? task.subtasks : [];
    if (children.length === 0) return false;
    const isCompleted = (t) => (t?.status || '').toString().trim().toLowerCase() === 'completed';
    const check = (t) => {
      const subs = Array.isArray(t?.subtasks) ? t.subtasks : [];
      if (!isCompleted(t)) return true;
      return subs.some(check);
    };
    return children.some(check);
  };

  const applyStatusChange = (taskId, status, flag) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            let updatedTask;
            if (flag == "secondaryStatus") {
              updatedTask = {
                ...task,
                secstatusid: status?.id,
                secStatus: status?.labelname
              };
              setLocalTaskEdits((prev) => ({
                ...prev,
                [task.taskid]: {
                  ...(prev[task.taskid] || {}),
                  secstatusid: status?.id,
                  secStatus: status?.labelname,
                },
              }));
            } else {
              updatedTask = {
                ...task,
                statusid: status?.id,
                status: status?.labelname,
                EndDate: status?.labelname?.toLowerCase() === "completed" ? date.toISOString() : "",
              };
              setLocalTaskEdits((prev) => ({
                ...prev,
                [task.taskid]: {
                  ...(prev[task.taskid] || {}),
                  statusid: status?.id,
                  status: status?.labelname,
                  EndDate: status?.labelname?.toLowerCase() === "completed" ? date.toISOString() : "",
                },
              }));
            }

            handleAddApicall(updatedTask);
            return updatedTask;
          }

          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  };

  const handleStatusChange = (taskId, status, flag) => {
    const isPrimaryStatus = flag !== "secondaryStatus";
    const isCompleting =
      isPrimaryStatus &&
      (status?.labelname || '').toString().trim().toLowerCase() === 'completed';

    if (isCompleting && taskId && hasIncompleteSubtasks(taskId)) {
      setPendingCompleteChange({ taskId, status, flag });
      setConfirmCompleteOpen(true);
      return;
    }

    applyStatusChange(taskId, status, flag);
  };

  const handlePriorityChange = (taskId, priority) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            const updatedTask = {
              ...task,
              priorityid: priority?.id,
              priority: priority?.labelname
            };
            setLocalTaskEdits((prev) => ({
              ...prev,
              [task.taskid]: {
                ...(prev[task.taskid] || {}),
                priorityid: priority?.id,
                priority: priority?.labelname,
              },
            }));
            handleAddApicall(updatedTask);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  };

  const handleDeadlineDateChange = (taskId, DeadLineDate) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === taskId.taskid) {
            const updatedTask = {
              ...task,
              DeadLineDate: DeadLineDate,
            };
            setLocalTaskEdits((prev) => ({
              ...prev,
              [task.taskid]: {
                ...(prev[task.taskid] || {}),
                DeadLineDate: DeadLineDate,
              },
            }));
            handleAddApicall(updatedTask);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  }

  const handleAssigneeShortcutSubmit = (updatedRowData) => {
    const assignees = Object.values(
      updatedRowData?.assignee?.reduce((acc, user) => {
        const dept = user.department;
        if (!acc[dept]) {
          acc[dept] = {
            department: dept,
            assignee: user.id.toString()
          };
        } else {
          acc[dept].assignee += `,${user.id}`;
        }
        return acc;
      }, {})
    );
    // store persistent local edit
    setLocalTaskEdits((prev) => ({
      ...prev,
      [updatedRowData.taskid]: {
        ...(prev[updatedRowData.taskid] || {}),
        departmentid: updatedRowData?.departmentid,
        assigneids: updatedRowData?.assigneids,
        assignee: updatedRowData?.assignee,
        departmentAssigneelist: assignees,
      },
    }));

    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === updatedRowData.taskid) {
            const updatedTask = {
              ...task,
              departmentid: updatedRowData?.departmentid,
              assigneids: updatedRowData?.assigneids,
              assignee: updatedRowData?.assignee,
              departmentAssigneelist: assignees,
            };
            handleAddApicall(updatedRowData);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  }

  const handlePrintCount = (selectedRow) => {
    setTasks((prevTasks) => {
      const updateTasksRecursively = (tasks) => {
        return tasks?.map((task) => {
          if (task.taskid === selectedRow.taskid) {
            const newCount = (task.print_count ?? 0) + 1;
            const updatedTask = {
              ...task,
              print_count: newCount,
            };
            setLocalTaskEdits((prev) => ({
              ...prev,
              [task.taskid]: {
                ...(prev[task.taskid] || {}),
                print_count: newCount,
              },
            }));
            AddPrintSheetCountApi(selectedRow);
            return updatedTask;
          }
          if (task.subtasks?.length > 0) {
            return {
              ...task,
              subtasks: updateTasksRecursively(task.subtasks),
            };
          }
          return task;
        });
      };
      return updateTasksRecursively(prevTasks);
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(event);
  };

  const handlePageSizeChnage = (event) => {
    setRowsPerPage(event ?? rowsPerPage);
    setPage(1);
  };

  const handleOpenRightMenu = (event, task) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      task: task,
    });
    setSelectedRow(task);
  };

  const handleCloseRightClickMenu = () => {
    setContextMenu(null);
  };

  const handleCopyTask = () => {
    if (contextMenu?.task) {
      const copiedTask = {
        ...JSON.parse(JSON.stringify(contextMenu.task)),
        isCopyActive: true
      };
      setCopiedData(copiedTask);
      setTasks((prevTasks) => {
        const markTaskRecursively = (tasks) =>
          tasks.map((task) => {
            if (task.taskid === copiedTask.taskid) {
              return { ...task, isCopyActive: true };
            }
            if (task.subtasks?.length > 0) {
              return {
                ...task,
                subtasks: markTaskRecursively(task.subtasks),
              };
            }
            return task;
          });

        return markTaskRecursively(prevTasks);
      });
      toast.success('Task copied successfully');
    }
    handleCloseRightClickMenu();
  };

  const handlePasteTask = async (parsedData, flag) => {
    const taskId = copiedData?.taskid
    const parentId = flag == "main" ? parsedData?.taskid : selectedRow?.taskid
    if (taskId && parentId) {
      const apiRes = await MoveTaskApi(taskId, parentId);
      if (apiRes) {
        // Build the moved task object with updated parentid
        const movedTask = {
          ...JSON.parse(JSON.stringify(copiedData)),
          parentid: parentId,
          isCopyActive: false,
        };

        const insertTaskUnderParent = (tasks, targetParentId, taskToInsert) => {
          return tasks.map((task) => {
            if (String(task.taskid) === String(targetParentId)) {
              return {
                ...task,
                subtasks: [...(task.subtasks || []), taskToInsert],
              };
            }
            if (task.subtasks?.length > 0) {
              return {
                ...task,
                subtasks: insertTaskUnderParent(task.subtasks, targetParentId, taskToInsert),
              };
            }
            return task;
          });
        };

        // 1. Remove from old location and insert under new parent in all state layers
        setTasks((prevTasks) => {
          const removed = removeTaskRecursively(prevTasks, taskId);
          return insertTaskUnderParent(removed, parentId, movedTask);
        });
        setGlobalTasks((prevTasks) => {
          const removed = removeTaskRecursively(prevTasks, taskId);
          return insertTaskUnderParent(removed, parentId, movedTask);
        });
        setActualTaskData((prevTasks) => {
          const removed = removeTaskRecursively(prevTasks, taskId);
          return insertTaskUnderParent(removed, parentId, movedTask);
        });

        // 2. Update the active TanStack Query cache
        const queryKey = taskQueryKeys.list(queryDataOverride, archivedFlag, completedFlag);
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData || !Array.isArray(oldData?.rd1)) return oldData;
          const removed = removeTaskRecursively(oldData.rd1, taskId);
          return {
            ...oldData,
            rd1: insertTaskUnderParent(removed, parentId, movedTask),
          };
        });

        // 3. Update IndexedDB cache
        if (isTabMode && tabId) {
          const cacheKey = generateCacheKey(queryDataOverride, archivedFlag, completedFlag);
          const updatedRawData = queryClient.getQueryData(queryKey);
          if (updatedRawData) {
            setTabDataCache(tabId, cacheKey, {
              rawData: updatedRawData,
              fetchedAt: Date.now(),
            }).catch(() => {});
          }
        }

        // 4. Clear copied data
        setCopiedData({});

        toast?.success("Task pasted successfully");
      }
    } else {
      toast.error('Please select a task to paste');
    }
    handleCloseRightClickMenu();
  };

  const handleRemoveCopiedData = () => {
    setCopiedData({});
  }

  const handleRefreshTasks = () => {
    if (isTabMode) {
      setSubmitRefreshKey((k) => k + 1);
      if (refetchTaskData) refetchTaskData();
    } else {
      setOpenChildTask(Date.now());
    }
  };

  useEffect(() => {
    if (filteredData) {
      const maxPage = Math.ceil(filteredData.length / rowsPerPage);
      if (page > maxPage && maxPage > 0) {
        setPage(maxPage);
      }
    }
    setTaskDataLength(filteredData?.length);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math?.ceil(filteredData && filteredData?.length / rowsPerPage);

  // Get data for the current page
  const currentData = filteredData?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  return (
    <Box className="task-container">
      {/* Show redirect UI when on /task or /task/ path */}
      {isRedirectPath ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '80vh',
          pt: 25
        }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 3, textAlign: 'center' }}>
            Choose Your Task View
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', maxWidth: '600px' }}>
            This page has been updated. Please select how you would like to view your tasks:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, maxWidth: '800px' }}>
            <Box sx={{
              flex: 1,
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}
              onClick={() => navigate('/projects')}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Project Module
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14px' }}>
                View tasks organized by project with detailed project management features
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              p: 3,
              border: '2px solid #7367f0',
              borderRadius: '12px',
              backgroundColor: '#f0eeff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(115, 103, 240, 0.3)',
                transform: 'translateY(-2px)'
              }
            }}
              onClick={() => navigate('/myTasks')}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: '#7367f0' }}>
                My Task
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '14px' }}>
                View all your assigned tasks in a comprehensive task list view
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          {/* Header Buttons */}
          <HeaderButtons
            activeButton={activeButton}
            onButtonClick={handleTabBtnClick}
            onFilterChange={handleFilterChange}
            isLoading={iswhTLoading}
            masterData={masterData}
            priorityData={priorityData}
            projectData={taskProject}
            statusData={statusData}
            secStatusData={secStatusData}
            taskCategory={taskCategory}
            taskDepartment={taskDepartment}
            taskAssigneeData={taskAssigneeData}
            CategorySummary={CategoryTSummary}
            handlePasteTask={handlePasteTask}
            handleCompletedTaskFilter={handleCompletedTaskFilter}
            handleArchivedTaskFilter={handleArchivedTaskFilter}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={handleToggleFavoritesOnly}
            showMilestonesOnly={showMilestonesOnly}
            onToggleMilestonesOnly={handleToggleMilestonesOnly}
            filters={isTabMode ? filters : undefined}
            queryData={isTabMode ? queryDataOverride : undefined}
            completedFlag={isTabMode ? completedFlag : undefined}
            archivedFlag={isTabMode ? archivedFlag : undefined}
            viewMode={isTabMode ? meTeamView : undefined}
            onViewModeChange={isTabMode ? setMeTeamView : undefined}
            formDrawerOpen={isTabMode ? formDrawerOpen : undefined}
            onToggleFormDrawer={isTabMode ? toggleFormDrawer : undefined}
            onNewTask={isTabMode ? handleNewTaskInTab : undefined}
            formDataOverride={tabDrawerFormData}
            rootSubrootOverride={tabDrawerRootSubroot}
            isActive={isActive}
            onRefresh={() => {
              setSubmitRefreshKey((k) => k + 1);
              if (isTabMode && refetchTaskData) {
                refetchTaskData();
              }
            }}
            onAfterSubmit={isTabMode ? handleAfterSubmit : undefined}
          />

          {/* Divider */}
          {!isLaptop &&
            <AnimatePresence mode="wait">
              {showAdvancedFil && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div
                    style={{
                      margin: "20px 0",
                      border: "1px dashed #7d7f85",
                      opacity: 0.3,
                    }}
                  />

                  {/* Filters Component */}
                  <Filters
                    {...filters}
                    filters={filters}
                    setFilters={setFilters}
                    onFilterChange={handleFilterChange}
                    isLoading={iswhMLoading}
                    masterData={masterData}
                    priorityData={priorityData}
                    statusData={statusData}
                    assigneeData={taskAssigneeData}
                    taskDepartment={taskDepartment}
                    taskProject={taskProject}
                    taskCategory={taskCategory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          }

          {isLaptop &&
            <FiltersDrawer {...filters}
              filters={filters}
              setFilters={setFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
              isLoading={iswhMLoading}
              masterData={masterData}
              priorityData={priorityData}
              statusData={statusData}
              assigneeData={taskAssigneeData}
              taskDepartment={taskDepartment}
              taskProject={taskProject}
              taskCategory={taskCategory}
            />
          }

          {/* Divider */}
          <div
            style={{
              margin: "20px 0",
              border: "1px dashed #7d7f85",
              opacity: 0.3,
            }}
          />
          <Box sx={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {copiedData && Object.keys(copiedData).length > 0 && (
              <Box className="filterCheckedBox">
                <Chip
                  size="small"
                  key={`category-`}
                  label={
                    <Typography>
                      <span className="filterKey">Cut Task:</span>{' '}
                      <span className="filterValue">{copiedData?.taskname}</span>
                    </Typography>
                  }
                  onDelete={handleRemoveCopiedData}
                  deleteIcon={<CloseIcon className="closeIcon" />}
                  className="filterChip"
                />
              </Box>
            )}
            <FilterChips
              filters={filters}
              onClearFilter={handleClearFilter}
              onClearAll={handleClearAllFilters}
            />
          </Box>

          <ConfirmationDialog
            open={confirmCompleteOpen}
            onClose={() => {
              setConfirmCompleteOpen(false);
              setPendingCompleteChange(null);
            }}
            onConfirm={() => {
              const pending = pendingCompleteChange;
              setConfirmCompleteOpen(false);
              setPendingCompleteChange(null);
              if (!pending) return;
              applyStatusChange(pending.taskId, pending.status, pending.flag);
            }}
            title="Complete parent task"
            content="This task has incomplete sub tasks. Completing it will also complete the task tree. Do you want to proceed?"
            confirmLabel="Proceed"
            cancelLabel="Cancel"
          />

          {/* View Components */}
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0, paddingX: 0.2 }}>
            <AnimatePresence mode="wait">
              {activeButton && (
                <motion.div
                  key={activeButton}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: showAdvancedFil ? 0 : 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Suspense fallback={<></>}>
                    {activeButton === "table" && (
                      <TaskTable
                        data={filteredData ?? null}
                        currentData={currentData}
                        page={page}
                        order={order}
                        orderBy={orderBy}
                        rowsPerPage={rowsPerPage}
                        totalPages={totalPages}
                        isLoading={iswhTLoading}
                        masterData={masterData}
                        copiedData={copiedData}
                        contextMenu={contextMenu}
                        handleCopy={handleCopyTask}
                        handlePaste={handlePasteTask}
                        handleContextMenu={handleOpenRightMenu}
                        handleCloseContextMenu={handleOpenRightMenu}
                        handleTaskFavorite={handleTaskFavorite}
                        handleFreezeTask={handleFreezeTask}
                        handleStatusChange={handleStatusChange}
                        handlePriorityChange={handlePriorityChange}
                        handleAssigneeShortcutSubmit={handleAssigneeShortcutSubmit}
                        handleRequestSort={handleRequestSort}
                        handleChangePage={handleChangePage}
                        handleDeadlineDateChange={handleDeadlineDateChange}
                        handlePageSizeChnage={handlePageSizeChnage}
                        handlePrintCount={handlePrintCount}
                        onOpenDrawer={isTabMode ? handleOpenTabDrawer : undefined}
                        onDeleteTask={handleDeleteTask}
                        onRefresh={handleRefreshTasks}
                      />
                    )}

                    {activeButton === "archive" && (
                      <ArchiveTable
                        data={archiveTasks ?? []}
                        isLoading={archiveLoading}
                      />
                    )}

                    {activeButton === "kanban" && (
                      <KanbanView
                        taskdata={filteredData ?? null}
                        isLoading={iswhTLoading}
                        masterData={masterData}
                        statusData={statusData}
                        handleTaskFavorite={handleTaskFavorite}
                        handleFreezeTask={handleFreezeTask}
                        onOpenDrawer={isTabMode ? handleOpenTabDrawer : undefined}
                        onDeleteTask={handleDeleteTask}
                      />
                    )}

                    {activeButton === "card" && (
                      <CardView
                        isLoading={iswhTLoading}
                        masterData={masterData}
                        handleTaskFavorite={handleTaskFavorite}
                        handleFreezeTask={handleFreezeTask}
                        onOpenDrawer={isTabMode ? handleOpenTabDrawer : undefined}
                      />
                    )}
                    {activeButton === "Dynamic-Filter" && (
                      <DynamicFilterReport />
                    )}
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

        </>
      )}

      {/* Loading dialog for completed task filter */}
      <Dialog
        open={completedFilterLoading}
        PaperProps={{
          sx: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <DialogContent sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          minWidth: '300px'
        }}>
          <CircularProgress size={60} sx={{ color: '#7367f0', mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#333', fontWeight: 500, textAlign: 'center' }}>
            {completedFlag ? 'Loading completed tasks...' : 'Hiding completed tasks...'}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default React.memo(Task, (prev, next) => {
  // Only re-render if tab identity, active state, or query data actually changed
  return (
    prev.tabId === next.tabId &&
    prev.isActive === next.isActive &&
    JSON.stringify(prev.queryDataOverride) === JSON.stringify(next.queryDataOverride)
  );
});

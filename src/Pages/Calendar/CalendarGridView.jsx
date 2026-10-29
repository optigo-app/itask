import React, { useState, useRef, useEffect, useCallback } from 'react';
import "./Calendar.scss"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TableSortLabel,
  Box,
  CircularProgress,
  Tooltip,
  Typography,
  Skeleton,
} from '@mui/material';
import { cleanDate, commonTextFieldProps, flattenTasks, formatDate3, getUserProfileData, handleAddApicall, priorityColors, statusColors } from '../../Utils/globalfun';
import { PERMISSIONS } from '../../Components/Auth/Role/permissions';
import useAccess from '../../Components/Auth/Role/useAccess';

// Import dayjs and plugins for date calculations
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isoWeek from "dayjs/plugin/isoWeek";
import SplitTaskModal from '../../Components/Calendar/SplitTaskModal';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import TaskPriority from '../../Components/ShortcutsComponent/TaskPriority';
import { SeparatorHorizontal, Check, AlertTriangle } from 'lucide-react';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { AddTaskDataApi } from '../../Api/TaskApi/AddTaskApi';
import { toast } from 'react-toastify';
import { deleteTaskDataApi } from '../../Api/TaskApi/DeleteTaskApi';
import { clearAllTabDataCache } from '../../Utils/IndexedDB/taskDataCache';
import { invalidateTaskCache } from '../../Utils/QueryClient/queryClient';
import CalendarFilter from './CalendarFilter';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { actualTaskData, fetchlistApiCall } from '../../Recoil/atom';
import { fetchTodayTaskApi } from '../../Api/TaskApi/fetchTodayTaskApi';
import { useTabStore } from '../../Store/useTabStore';
import useSafeRedirect from '../../Utils/useSafeRedirect';
import { fetchTaskDataFullApi } from '../../Api/TaskApi/TaskDataFullApi';
import { setTaskQueryData } from '../../Utils/QueryClient/queryClient';
import { taskDescGetApi } from '../../Api/TaskApi/TaskDescGetApi';

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isoWeek);

// Helper to extract number from estimate string (e.g., "4h" -> 4)
const parseEstimateToNumber = (estimateString) => {
  const str = String(estimateString ?? '').trim();
  const match = str.match(/^(\d+(\.\d{1,3})?)$/);
  return match ? parseFloat(match[1]) : 0;
};

// Helper to check if working hours are editable: from task StartDate up to 7 days window (inclusive)
const isDateEditable = (dateString) => {
  if (!dateString) return false;
  const startDate = dayjs(dateString).startOf("day");
  const today = dayjs().startOf("day");

  if (today.isBefore(startDate)) return false;

  const lastEditableDay = startDate.add(6, "day");
  return today.isSameOrBefore(lastEditableDay);
};

const findModuleRecursively = (tasks, targetId) => {
  if (!tasks) return null;
  for (const t of tasks) {
    if (String(t.taskid) === String(targetId)) return t.moduleid || t.projectid;
    if (t.subtasks?.length > 0) {
      const res = findModuleRecursively(t.subtasks, targetId);
      if (res) return res;
    }
  }
  return null;
};

const tableHeaders = [
  { label: "Sr #", key: "srno", width: "5%" },
  { label: "Task Title", key: "taskname", width: "26%" },
  { label: "Status", key: "status", width: "8%" },
  { label: "Priority", key: "priority", width: "8%" },
  { label: "Estimate", key: "estimate_hrs", width: "8%" },
  { label: "Working Hour", key: "workinghr", width: "12%" },
  { label: "Start Date", key: "StartDate", width: "14%" },
  { label: "End Date", key: "DeadLineDate", width: "14%" },
];

const getSessionList = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const normalizeCalendarTasks = (rows = []) => {
  const statusData = getSessionList('taskstatusData');
  const priorityData = getSessionList('taskpriorityData');
  const taskCategory = getSessionList('taskworkcategoryData');
  const taskProject = getSessionList('taskprojectData');
  const taskAssigneeData = getSessionList('taskAssigneeData');

  const statusById = new Map(statusData.map((item) => [Number(item?.id), item?.labelname || '']));
  const priorityById = new Map(priorityData.map((item) => [Number(item?.id), item?.labelname || '']));
  const categoryById = new Map(taskCategory.map((item) => [Number(item?.id), item?.labelname || '']));
  const projectById = new Map(taskProject.map((item) => [Number(item?.id), item?.labelname || '']));
  const assigneeById = new Map(taskAssigneeData.map((item) => [Number(item?.id), item]));

  return rows.map((task) => {
    const assigneeIdArray = task?.assigneids
      ?.toString()
      ?.split(',')
      ?.map((id) => Number(id));
    const matchedAssignees = (assigneeIdArray || [])
      .map((id) => assigneeById.get(id))
      .filter(Boolean);

    const fullPathParts = String(task?.FullPath || '')
      .split('-->')
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      ...task,
      status: task?.status || statusById.get(Number(task?.statusid)) || '',
      priority: task?.priority || priorityById.get(Number(task?.priorityid)) || '',
      category: task?.category || categoryById.get(Number(task?.workcategoryid)) || '',
      taskPr: task?.taskPr || projectById.get(Number(task?.projectid)) || task?.project || '',
      assignee: task?.assignee || matchedAssignees,
      moduleName: task?.moduleName || task.roottaskname || fullPathParts[0] || '-',
    };
  });
};

const getAssigneeIdArray = (assigneids) => {
  if (!assigneids) return [];
  return assigneids
    .toString()
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
};

const buildTaskKeyValueMap = (taskList = []) => {
  const taskById = new Map();
  taskList.forEach((task) => {
    const idNum = Number(task?.taskid);
    if (!Number.isNaN(idNum)) {
      taskById.set(idNum, task);
    }
    if (task?.taskid !== undefined && task?.taskid !== null) {
      taskById.set(String(task.taskid), task);
    }
  });
  return { taskById };
};

const prepareCalendarTaskList = ({
  treeTaskData = [],
  fallbackTaskData = [],
  isAdmin = false,
  userId,
}) => {
  const flattenedTreeTasks = Array.isArray(treeTaskData) && treeTaskData.length > 0
    ? flattenTasks(treeTaskData)
    : [];

  const sourceTasks = flattenedTreeTasks.length > 0 ? flattenedTreeTasks : (fallbackTaskData || []);
  const { taskById } = buildTaskKeyValueMap(sourceTasks);
  const parentWithChildren = new Set();

  sourceTasks.forEach((task) => {
    const parentId = Number(task?.parentid);
    if (!Number.isNaN(parentId) && parentId !== 0) {
      parentWithChildren.add(parentId);
      parentWithChildren.add(String(parentId));
    }
  });

  return sourceTasks
    .map((task) => {
      const parentTask = taskById.get(Number(task?.parentid)) || taskById.get(String(task?.parentid));
      const hasChildren = parentWithChildren.has(Number(task?.taskid)) || parentWithChildren.has(String(task?.taskid));
      const inferredType = Number(task?.parentid) === 0 ? 'module' : (hasChildren ? 'major' : 'minor');
      return {
        ...task,
        moduleName: task?.moduleName || parentTask?.moduleName || parentTask?.taskname || task?.taskPr || '-',
        type: task?.type || inferredType,
      };
    })
    .filter((task) => {
      if (isAdmin) return true;
      const assigneeIdsArray = getAssigneeIdArray(task?.assigneids);
      return assigneeIdsArray.includes(String(userId));
    });
};

// Session cache for hover descriptions — taskid -> descr string ('' = none).
// Lives outside the component so re-hovers and row re-renders never refetch.
const taskDescCache = new Map();

// Hover preview card — mounts only while the tooltip is open, so the API call
// fires exactly once per task per session (after the hover delay, not on every
// mouse pass). Shows skeleton lines while loading, then the description.
const TaskDescHoverCard = ({ task }) => {
  const [state, setState] = useState(() => {
    const cached = taskDescCache.get(task?.taskid);
    return cached !== undefined ? { loading: false, text: cached } : { loading: true, text: '' };
  });

  useEffect(() => {
    if (!state.loading || !task?.taskid) return;
    let active = true;
    taskDescGetApi(task)
      .then((res) => {
        const text = (res?.rd?.[0]?.descr || '').trim();
        taskDescCache.set(task.taskid, text);
        if (active) setState({ loading: false, text });
      })
      .catch(() => {
        if (active) setState({ loading: false, text: '' });
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.taskid]);

  return (
    <Box sx={{ minWidth: 240, maxWidth: 340 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', color: '#7367f0' }}>
          DESCRIPTION
        </Typography>
        <Typography sx={{ fontSize: '11px', color: '#9b9aa1', fontWeight: 600 }}>
          {task?.maintenanceno || task?.taskno || ''}
        </Typography>
      </Box>
      {state.loading ? (
        <Box>
          <Skeleton variant="text" sx={{ fontSize: '13px' }} />
          <Skeleton variant="text" sx={{ fontSize: '13px', width: '88%' }} />
          <Skeleton variant="text" sx={{ fontSize: '13px', width: '60%' }} />
        </Box>
      ) : state.text ? (
        <Typography
          sx={{
            fontSize: '13px',
            color: '#444050',
            lineHeight: 1.55,
            whiteSpace: 'pre-line',
            maxHeight: 180,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          {state.text}
        </Typography>
      ) : (
        <Typography sx={{ fontSize: '12.5px', color: '#9b9aa1', fontStyle: 'italic' }}>
          No description added for this task.
        </Typography>
      )}
    </Box>
  );
};

const CalendarGridView = () => {
  const [tasks, setTasks] = useState([]);
  const [taskDataRows, setTaskDataRows] = useState([]);
  const [isTaskLoading, setIsTaskLoading] = useState(true);
  const [taskAssigneeData, setTaskAssigneeData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: 'StartDate', direction: 'asc' });
  const estimateTextFieldRefs = useRef({});
  const sortedTasksRef = useRef([]);
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState(null);
  const [numberOfDaysToSplit, setNumberOfDaysToSplit] = useState(0);
  const [splitParts, setSplitParts] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalHours, setTotalHours] = useState({ estimate: 0, working: 0 });
  const [localWorkingEdits, setLocalWorkingEdits] = useState({});
  const actualTaskDataValue = useRecoilValue(actualTaskData);
  const fetchTaskTrigger = useRecoilValue(fetchlistApiCall);
  const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
  const navigate = useSafeRedirect();

  // Task click → open the parent module's /tasks tab (same payload as
  // TaskTableList.handleOpenModuleTab, so it dedups with an existing tab).
  const handleTaskClick = (task) => {
    const moduleId = task?.maintaskid || task?.RootTaskId || task?.moduleid;
    if (!moduleId) return;
    const moduleName = task?.moduleName || task?.taskPr || 'Tasks';
    const queryData = {
      module: moduleName,
      project: task?.taskPr,
      taskid: moduleId,
      projectid: task?.projectid,
      moduleid: moduleId,
      maingroupids: task?.maingroupids,
      isLimited: 0,
      isreadonly: 0,
      breadcrumbTitles: [moduleName],
      // clicked task name → seeded as the module tab's search filter so the
      // subtask is findable inside large module datasets
      searchtask: task?.taskname,
    };
    // Prefetch in background so the tab opens warm
    fetchTaskDataFullApi({ ...queryData, isarchive: 0, iscompleted: 0 })
      .then((rawData) => {
        if (rawData?.rd?.[0]?.stat != 0) {
          setTaskQueryData(queryData, false, false, rawData);
        }
      })
      .catch(() => {});
    useTabStore.getState().openTaskTab({
      title: moduleName,
      route: '/tasks',
      queryData,
    });
    navigate('/tasks');
  };
  const { hasAccess } = useAccess();
  const auth = getUserProfileData();
  const filters = React.useMemo(() => ({
    startdatefrom: customRange.startDate ? dayjs(customRange.startDate).format('YYYY-MM-DD') : '',
    startdateto: customRange.endDate ? dayjs(customRange.endDate).format('YYYY-MM-DD') : '',
    assigneeid: selectedAssigneeId?.id || auth?.id || ''
  }), [customRange.startDate, customRange.endDate, selectedAssigneeId]);
  const hasValidDateRange = Boolean(filters?.startdatefrom && filters?.startdateto);

  useEffect(() => {
    setTaskAssigneeData(getSessionList('taskAssigneeData'));
  }, []);

  useEffect(() => {
    if (!hasValidDateRange) return;

    const fetchGridTasks = async () => {
      setIsTaskLoading(true);
      try {
        const taskRes = await fetchTodayTaskApi(
          'order by StartDate asc',
          '5000',
          '1',
          filters
        );
        const rows = taskRes?.rd || [];
        const normalizedRows = normalizeCalendarTasks(rows);
        setTaskDataRows(normalizedRows);
      } catch (error) {
        console.error('Error fetching calendar grid task list:', error);
        setTaskDataRows([]);
      } finally {
        setIsTaskLoading(false);
      }
    };

    fetchGridTasks();
  }, [filters, fetchTaskTrigger, hasValidDateRange]);

  const filteredTasks = React.useMemo(() => {
    if (!taskDataRows?.length && !actualTaskDataValue?.length) return [];
    const today = currentDate.startOf('day');
    const tomorrow = today.add(1, 'day');
    const userProfile = getUserProfileData();
    const isAdmin = userProfile.designation?.toLowerCase() === 'admin';

    const rawTasks = prepareCalendarTaskList({
      treeTaskData: [],
      fallbackTaskData: taskDataRows?.length > 0 ? taskDataRows : (actualTaskDataValue || []),
      isAdmin,
      userId: userProfile?.id,
    });

    let nonRootTasks = rawTasks.filter(task => task.parentid !== 0);
    // Filter to show only minor tasks (hide major tasks)
    nonRootTasks = nonRootTasks.filter(task => {
      const taskType = (task.type || '').toLowerCase();
      return taskType === 'minor';
    });
    // Filter out milestone tasks
    nonRootTasks = nonRootTasks.filter(task => task.ismilestone !== 1);

    if (selectedAssigneeId != null) {
      nonRootTasks = nonRootTasks.filter(task => {
        if (!task.assigneids) return false;
        const assigneeIdsArray = task.assigneids.split(',').map(id => id.trim());
        return assigneeIdsArray.includes(String(selectedAssigneeId.id));
      });
    }

    // Apply module filter
    if (selectedModuleId) {
      nonRootTasks = nonRootTasks.filter(task => {
        return String(task.maintaskid) === selectedModuleId;
      });
    }
    // 📅 Apply date filters
    let dateFilteredTasks = [];
    if (selectedFilter === 'Today') {
      dateFilteredTasks = nonRootTasks.filter(task => dayjs(task.StartDate).isSame(today, 'day'));
    } else if (selectedFilter === 'Tomorrow') {
      dateFilteredTasks = nonRootTasks.filter(task => dayjs(task.StartDate).isSame(tomorrow, 'day'));
    } else if (selectedFilter === 'Week') {
      // Calculate Monday-based week range
      const startOfWeek = today.startOf('week').add(1, 'day'); // Monday
      const endOfWeek = startOfWeek.add(6, 'day'); // Sunday
      dateFilteredTasks = nonRootTasks.filter(task =>
        dayjs(task.StartDate).isSameOrAfter(startOfWeek, 'day') &&
        dayjs(task.StartDate).isSameOrBefore(endOfWeek, 'day')
      );
    } else if (selectedFilter === 'Custom') {
      dateFilteredTasks = nonRootTasks.filter(task => {
        const taskDate = dayjs(task.StartDate).startOf('day');
        const startDate = dayjs(customRange.startDate).startOf('day');
        const endDate = dayjs(customRange.endDate).startOf('day');
        return taskDate.isSame(startDate) || taskDate.isSame(endDate) || (taskDate.isAfter(startDate) && taskDate.isBefore(endDate));
      });
    }

    const term = searchTerm?.trim()?.toLowerCase();
    if (!term) return dateFilteredTasks;
    return dateFilteredTasks.filter((task) => {
      const haystack = [
        task?.taskname,
        task?.moduleName,
        task?.taskno,
        task?.maintenanceno,
        task?.status,
        task?.priority,
        task?.taskPr,
        ...(Array.isArray(task?.assignee)
          ? task.assignee.map((a) => `${a?.firstname ?? ''} ${a?.lastname ?? ''}`.trim())
          : []),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [taskDataRows, actualTaskDataValue, selectedFilter, currentDate, selectedAssigneeId, customRange, selectedModuleId, searchTerm]);

  useEffect(() => {
    const applyLocalEdits = (task) => {
      const edits = localWorkingEdits[task.taskid] || {};
      return {
        ...task,
        ...edits,
      };
    };

    const updated = filteredTasks.map(applyLocalEdits);
    setTasks(updated);
    handleTotalHourCalculate(updated);
  }, [filteredTasks, localWorkingEdits]);

  // Initialize date picker on component mount
  useEffect(() => {
    updateDatePickerBasedOnFilter(selectedFilter, currentDate);
  }, []);

  const handleTotalHourCalculate = (tasks) => {
    const total = tasks?.reduce(
      (acc, task) => {
        acc.estimate += parseFloat(task?.estimate_hrs) || 0;
        acc.working += parseFloat(task?.workinghr) || 0;
        return acc;
      },
      { estimate: 0, working: 0 }
    );

    setTotalHours(total);
  }

  const totalSplitHours = splitParts?.reduce((sum, part) => {
    let value = part.hours;
    if (typeof value === 'string' && value.trim().startsWith('.')) {
      value = '0' + value.trim();
    }
    const hours = parseFloat(value);
    return sum + (isNaN(hours) ? 0 : hours);
  }, 0);

  const handleSplit = (taskId) => {
    const task = tasks.find((t) => t.taskid === taskId);
    setSelectedTaskToSplit(task);
    setNumberOfDaysToSplit(1);
    setSplitParts([{ startDate: null, endDate: null, hours: '' }]);
    setOpenSplitModal(true);
  };

  const handleCloseSplitModal = () => {
    setOpenSplitModal(false);
    setSelectedTaskToSplit(null);
    setNumberOfDaysToSplit(0);
    setSplitParts([]);
  };

  const handleNumberOfDaysToSplitChange = useCallback((event) => {
    const num = parseInt(event.target.value, 10);
    const validatedNum = isNaN(num) || num < 0 ? 0 : num;
    setNumberOfDaysToSplit(validatedNum);

    const newSplitParts = Array.from({ length: validatedNum }, () => ({
      startDate: null,
      endDate: null,
      hours: '',
    }));
    setSplitParts(newSplitParts);
  }, []);

  const handleSplitPartChange = useCallback((index, type, value) => {
    const newSplitParts = [...splitParts];
    const regex = /^\d{0,3}(\.\d{0,3})?$/;

    if (type === 'hours') {
      if (value === '' || regex.test(value)) {
        newSplitParts[index] = { ...newSplitParts[index], [type]: value };
        const currentPart = newSplitParts[index];
        if (currentPart.startDate && value !== '') {
          const hoursNum = parseEstimateToNumber(value);
          const calculatedEndDate = dayjs(currentPart.startDate).add(dayjs.duration({ hours: hoursNum }));
          newSplitParts[index].endDate = calculatedEndDate.toDate();
        } else if (value === '' && currentPart.startDate) {
          newSplitParts[index].endDate = null;
        }
      }
    } else if (type === 'startDate') {
      newSplitParts[index] = { ...newSplitParts[index], [type]: value ? value.toDate() : null };
      const currentPart = newSplitParts[index];
      if (currentPart.startDate && currentPart.hours !== '') {
        const hoursNum = parseEstimateToNumber(currentPart.hours);
        const calculatedEndDate = dayjs(currentPart.startDate).add(dayjs.duration({ hours: hoursNum }));
        newSplitParts[index].endDate = calculatedEndDate.toDate();
      } else if (!value) {
        newSplitParts[index].endDate = null;
      }
    } else {
      newSplitParts[index] = { ...newSplitParts[index], [type]: value };
    }
    setSplitParts(newSplitParts);
  }, [splitParts]);

  const formatEstimate = (val) => {
    const num = Number(val ?? 0);
    return num % 1 === 0 ? num : Number(num.toFixed(2));
  };

  const handleConfirmSplit = async () => {
    for (let i = 0; i < splitParts.length; i++) {
      const part = splitParts[i];
      if (!part.startDate) {
        toast.error(`Start Date is required for Part ${i + 1}`);
        return;
      }
      if (!part.hours || isNaN(parseFloat(part.hours))) {
        toast.error(`Valid Split Hours are required for Part ${i + 1}`);
        return;
      }
    }
    if (!selectedTaskToSplit) return;
    if (totalSplitHours > selectedTaskToSplit?.estimate_hrs) {
      toast.error('Total hours for split tasks cannot exceed the original task estimate!');
      return;
    }
    let updatedTasks = tasks.filter((task) => task.taskid !== selectedTaskToSplit.taskid);
    let rootSubrootflagval = {
      Task: "splitroot"
    };
    try {
      await deleteTaskDataApi(selectedTaskToSplit);
      for (let index = 0; index < splitParts.length; index++) {
        const part = splitParts[index];
        const formattedStartDate = part.startDate instanceof Date ? part.startDate : null;
        const formattedEndDate = part.endDate instanceof Date ? part.endDate : null;
        const newTask = {
          ...selectedTaskToSplit,
          taskname: `${selectedTaskToSplit.taskname} (Part ${index + 1})`,
          estimate_hrs: part.hours,
          workinghr: part.hours,
          StartDate: formattedStartDate,
          DeadLineDate: formattedEndDate,
        };
        updatedTasks.push(newTask);
        await AddTaskDataApi(newTask, rootSubrootflagval ?? {});
      }
      setTasks(updatedTasks);
      handleCloseSplitModal();
      // Trigger UI refresh
      setOpenChildTask(Date.now());
      // Clear IndexedDB + React Query caches so next load gets fresh data
      clearAllTabDataCache().catch(() => {});
      invalidateTaskCache();
    } catch (error) {
      console.error('Error while splitting tasks:', error);
      toast.error('An error occurred while processing split tasks.');
    }
  };

  const handleAutoSplit = useCallback(() => {
    if (!selectedTaskToSplit || numberOfDaysToSplit <= 0) return;

    const totalEstimate = parseEstimateToNumber(selectedTaskToSplit.estimate_hrs);
    const perPart = parseFloat((totalEstimate / numberOfDaysToSplit).toFixed(3));

    const autoSplitParts = Array.from({ length: numberOfDaysToSplit }, (_, i) => ({
      startDate: null,
      endDate: null,
      hours: perPart.toString(),
    }));

    setSplitParts(autoSplitParts);
  }, [selectedTaskToSplit, numberOfDaysToSplit]);

  // ── Optimistic working-hr save ─────────────────────────────────
  // Enter queues the row's save and moves on instantly — a per-task pump
  // drains the queue in the background so rapid edits coalesce into the
  // latest payload instead of firing a request per keystroke-commit.
  const saveQueueRef = useRef({});          // taskid -> latest task payload
  const saveBusyRef = useRef(new Set());    // taskids with an active pump
  const [saveState, setSaveState] = useState({}); // taskid -> 'saving'|'saved'|'error'

  const queueWorkingHrSave = (task) => {
    saveQueueRef.current[task.taskid] = task;
    if (saveBusyRef.current.has(task.taskid)) return;
    saveBusyRef.current.add(task.taskid);
    setSaveState((prev) => ({ ...prev, [task.taskid]: 'saving' }));

    const pump = async () => {
      let hadError = false;
      while (saveQueueRef.current[task.taskid]) {
        const payload = saveQueueRef.current[task.taskid];
        delete saveQueueRef.current[task.taskid];
        try {
          const apiRes = await AddTaskDataApi({ ...payload, workinghr: payload.workinghr }, { Task: 'root' });
          if (!apiRes) throw new Error('save failed');
          if (!saveQueueRef.current[task.taskid]) {
            setSaveState((prev) => ({ ...prev, [task.taskid]: 'saved' }));
            setTimeout(() => {
              setSaveState((prev) => (prev[task.taskid] === 'saved' ? { ...prev, [task.taskid]: undefined } : prev));
            }, 1500);
          }
        } catch (error) {
          console.error('Error updating task estimate:', error);
          hadError = true;
          if (!saveQueueRef.current[task.taskid]) {
            setSaveState((prev) => ({ ...prev, [task.taskid]: 'error' }));
          }
        }
      }
      if (hadError) {
        toast.error('Error while saving working hrs — value kept, press Enter to retry');
      } else {
        // invalidate caches once per drain instead of once per save
        clearAllTabDataCache().catch(() => {});
        invalidateTaskCache();
      }
      saveBusyRef.current.delete(task.taskid);
    };
    pump();
  };

  const handleEstimateChange = (taskId, newEstimate) => {
    setLocalWorkingEdits((prev) => ({
      ...prev,
      [taskId]: {
        ...(prev[taskId] || {}),
        workinghr: newEstimate,
      },
    }));

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskid === taskId
          ? { ...task, workinghr: newEstimate }
          : task
      )
    );
  };

  const handleKeyDown = (e, taskId, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const task = tasks.find(t => t.taskid === taskId);
      if (!task) return;
      // queue save in background — no await, UI stays instant
      queueWorkingHrSave({ ...task, workinghr: task.workinghr });
      handleTotalHourCalculate(tasks);
      const currentInput = estimateTextFieldRefs.current[taskId];
      if (currentInput) currentInput.blur();
      const nextTaskIndex = index + 1;
      const currentSorted = sortedTasksRef.current || [];
      const nextTask = currentSorted[nextTaskIndex];
      if (nextTask) {
        const nextInput = estimateTextFieldRefs.current[nextTask.taskid];
        if (nextInput) {
          nextInput.focus();
        }
      } else {
        Object.values(estimateTextFieldRefs.current).forEach((input) => {
          input?.blur();
        });
        window.getSelection()?.removeAllRanges();
      }
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.taskid === taskId.taskid) {
          const updatedTask = {
            ...task,
            statusid: newStatus?.id,
            status: newStatus?.labelname
          };
          setLocalWorkingEdits((prev) => ({
            ...prev,
            [task.taskid]: {
              ...(prev[task.taskid] || {}),
              statusid: newStatus?.id,
              status: newStatus?.labelname,
            },
          }));

          handleAddApicall(updatedTask);
          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleAssigneeChange = (value) => {
    setSelectedAssigneeId(value);
  };

  const handleModuleChange = (value) => {
    setSelectedModuleId(value?.target?.value || '');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleNavigate = (direction) => {
    let newDate;

    if (selectedFilter === 'Today') {
      newDate = direction === 'prev'
        ? currentDate.subtract(1, 'day')
        : currentDate.add(1, 'day');
    } else if (selectedFilter === 'Tomorrow') {
      newDate = direction === 'prev'
        ? currentDate.subtract(1, 'day')
        : currentDate.add(1, 'day');
    } else if (selectedFilter === 'Week') {
      newDate = direction === 'prev'
        ? currentDate.subtract(1, 'week')
        : currentDate.add(1, 'week');
    } else {
      newDate = direction === 'prev'
        ? currentDate.subtract(1, 'day')
        : currentDate.add(1, 'day');
    }

    setCurrentDate(newDate);
    updateDatePickerBasedOnFilter(selectedFilter, newDate);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    const today = dayjs();
    setCurrentDate(today);
    updateDatePickerBasedOnFilter(filter, today);
  };

  const handleDateChange = (range) => {
    setCustomRange(range);
    if (range.startDate && range.endDate) {
      setSelectedFilter('Custom');
    }
  };

  const updateDatePickerBasedOnFilter = (filter, date) => {
    const targetDate = date || currentDate;

    if (filter === 'Today') {
      setCustomRange({
        startDate: targetDate.startOf('day').toISOString(),
        endDate: targetDate.endOf('day').toISOString()
      });
    } else if (filter === 'Tomorrow') {
      const tomorrow = targetDate.add(1, 'day');
      setCustomRange({
        startDate: tomorrow.startOf('day').toISOString(),
        endDate: tomorrow.endOf('day').toISOString()
      });
    } else if (filter === 'Week') {
      const startOfWeek = targetDate.startOf('week').add(1, 'day');
      const endOfWeek = targetDate.endOf('week').add(1, 'day');
      setCustomRange({
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString()
      });
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (!tasks || tasks.length === 0) {
      sortedTasksRef.current = [];
      return null;
    }

    if (!sortConfig.key) {
      sortedTasksRef.current = tasks;
      return tasks;
    }

    const sorted = [...tasks].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (sortConfig.key === 'StartDate' || sortConfig.key === 'DeadLineDate') {
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
      }

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });
    sortedTasksRef.current = sorted;
    return sorted;
  }, [tasks, sortConfig]);

  const isValidDecimalInput = (value) => /^(\d{0,2}|\d{0,2}\.\d{0,2}|\.\d{1,2})?$/.test(value);

  return (
    <Box className="cal-Container">
      {isTaskLoading ? (
        <LoadingBackdrop isLoading={true} />
      ) :
        <>
          <CalendarFilter
            totalHours={totalHours}
            selectedFilter={selectedFilter}
            selectedAssigneeId={selectedAssigneeId}
            selectedModuleId={selectedModuleId}
            customRange={customRange}
            currentDate={currentDate}
            onFilterChange={handleFilterChange}
            onNavigate={handleNavigate}
            taskAssigneeData={taskAssigneeData}
            handleDateChange={handleDateChange}
            handleAssigneeChange={handleAssigneeChange}
            handleModuleChange={handleModuleChange}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <TableContainer component={Paper} className='muiTableTaContainer'>
            <Table aria-label="task table" className='muiTable'>
              <TableHead className='muiTableHead'>
                <TableRow>
                  {tableHeaders?.map(({ label, key, width }) => (
                    <TableCell
                      key={key}
                      sortDirection={sortConfig.key === key ? sortConfig.direction : false}
                      sx={{ width }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === key}
                        direction={sortConfig.key === key ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(key)}
                      >
                        {label}
                      </TableSortLabel>
                    </TableCell>
                  ))}

                  <TableCell sx={{ width: '8%' }}>
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>

              </TableHead>
              <TableBody>
                {sortedTasks?.length > 0 ?
                  <>
                    {sortedTasks?.map((task, index) => (
                      <TableRow key={task.taskid}>
                        <TableCell>
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={<TaskDescHoverCard task={task} />}
                            arrow
                            placement="bottom-start"
                            enterDelay={350}
                            leaveDelay={150}
                            describeChild
                            slotProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: '#fff',
                                  color: '#444050',
                                  border: '1px solid #e7e5f4',
                                  borderRadius: '10px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                  p: 1.5,
                                  maxWidth: 'none',
                                },
                              },
                              arrow: { sx: { color: '#fff', '&::before': { border: '1px solid #e7e5f4' } } },
                              popper: { sx: { zIndex: 1500 } },
                            }}
                          >
                            <Box
                              component="span"
                              onClick={() => handleTaskClick(task)}
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { color: '#7367f0', textDecoration: 'underline' },
                              }}
                            >
                              <b>{task.moduleName}/ </b><strong>{task.maintenanceno ? task?.maintenanceno : task?.taskno}</strong> {task?.taskname}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell><StatusBadge task={task} statusColors={statusColors} onStatusChange={handleStatusChange} disable={false} /></TableCell>
                        <TableCell>{TaskPriority(task?.priority, priorityColors)}</TableCell>
                        <TableCell>{task.estimate_hrs}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TextField
                              variant="outlined"
                              size="small"
                              type="text"
                              placeholder="Enter Working hrs"
                              sx={{ width: '100px' }}
                              value={task?.workinghr}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (isValidDecimalInput(value)) {
                                  handleEstimateChange(task.taskid, e.target.value)
                                }
                              }}
                              inputRef={(el) => (estimateTextFieldRefs.current[task.taskid] = el)}
                              onKeyDown={(e) => handleKeyDown(e, task.taskid, index)}
                              disabled={!hasAccess(PERMISSIONS.canWorkinghrEdit) && !isDateEditable(task.StartDate)}
                              {...commonTextFieldProps}
                            />
                            <Box sx={{ width: 16, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                              {saveState[task.taskid] === 'saving' && (
                                <CircularProgress size={12} sx={{ color: '#7367f0' }} />
                              )}
                              {saveState[task.taskid] === 'saved' && <Check size={14} color="#28c76f" />}
                              {saveState[task.taskid] === 'error' && (
                                <AlertTriangle size={14} color="#ea5455" />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {task.StartDate ? formatDate3(task.StartDate) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {task.DeadLineDate ? (formatDate3(cleanDate(task.DeadLineDate)) || '-') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            size='small'
                            startIcon={<SeparatorHorizontal size={18} />}
                            onClick={() => handleSplit(task.taskid)}
                            className={dayjs(task.StartDate).isSame(dayjs(), 'day') ? 'buttonClassname' : 'disablebuttonClassanme'}
                            disabled={!dayjs(task.StartDate).isSame(dayjs(), 'day')}
                          >
                            Split
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                  :
                  <TableRow>
                    <TableCell colSpan={9} style={{ textAlign: 'center' }}>
                      {searchTerm?.trim() ? 'No tasks found matching your search.' : 'No tasks found for today.'}
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          </TableContainer>
        </>
      }
      <SplitTaskModal
        open={openSplitModal}
        onClose={handleCloseSplitModal}
        selectedTask={selectedTaskToSplit}
        numberOfDaysToSplit={numberOfDaysToSplit}
        onNumberOfDaysToSplitChange={handleNumberOfDaysToSplitChange}
        splitParts={splitParts}
        onSplitPartChange={handleSplitPartChange}
        onConfirmSplit={handleConfirmSplit}
        totalSplitHours={totalSplitHours}
        handleAutoSplit={handleAutoSplit}
      />
    </Box>
  );
};

export default CalendarGridView;

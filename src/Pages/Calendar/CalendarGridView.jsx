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
} from '@mui/material';
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate3, getUserProfileData, handleAddApicall, priorityColors, statusColors } from '../../Utils/globalfun';
import { PERMISSIONS, ROLES } from '../../Components/Auth/Role/permissions';
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
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { SeparatorHorizontal } from 'lucide-react';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { AddTaskDataApi } from '../../Api/TaskApi/AddTaskApi';
import { toast } from 'react-toastify';
import { deleteTaskDataApi } from '../../Api/TaskApi/DeleteTaskApi';
import CalendarFilter from './CalendarFilter';

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

const tableHeaders = [
  { label: "Task Title", key: "taskname", width: "26%" },
  { label: "Status", key: "status", width: "8%" },
  { label: "Priority", key: "priority", width: "8%" },
  { label: "Estimate", key: "estimate_hrs", width: "8%" },
  { label: "Working Hour", key: "workinghr", width: "12%" },
  { label: "Start Date", key: "StartDate", width: "14%" },
  { label: "End Date", key: "DeadLineDate", width: "14%" },
];

const CalendarGridView = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const estimateTextFieldRefs = useRef({});
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState(null);
  const [numberOfDaysToSplit, setNumberOfDaysToSplit] = useState(0);
  const [splitParts, setSplitParts] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const [totalHours, setTotalHours] = useState({ estimate: 0, working: 0 });
  const [localWorkingEdits, setLocalWorkingEdits] = useState({});
  const { hasAccess } = useAccess();
  const {
    iswhTLoading,
    taskFinalData,
    taskAssigneeData
  } = useFullTaskFormatFile();

  const filteredTasks = React.useMemo(() => {
    if (!taskFinalData?.TaskData) return [];
    const today = currentDate.startOf('day');
    const tomorrow = today.add(1, 'day');
    // Set Monday as start of week, Sunday as end of week
    const weekEnd = today.startOf('week').add(1, 'day').endOf('week');

    const userProfile = getUserProfileData();
    const isAdmin = userProfile.designation?.toLowerCase() === 'admin';

    // Flatten all tasks or only "my" tasks
    const rawTasks = isAdmin
      ? flattenTasks(taskFinalData.TaskData)
      : flattenTasks(filterNestedTasksByView(taskFinalData.TaskData, 'me', userProfile.id));

    let nonRootTasks = rawTasks.filter(task => task.parentid !== 0);
    // Filter to show only minor tasks (hide major tasks)
    nonRootTasks = nonRootTasks.filter(task => {
      const taskType = (task.type || '').toLowerCase();
      return taskType === 'minor';
    });

    if (selectedAssigneeId != null) {
      nonRootTasks = nonRootTasks.filter(task => {
        if (!task.assigneids) return false;
        const assigneeIdsArray = task.assigneids.split(',').map(id => id.trim());
        return assigneeIdsArray.includes(String(selectedAssigneeId.id));
      });
    }
    // 📅 Apply date filters
    if (selectedFilter === 'Today') {
      return nonRootTasks.filter(task => dayjs(task.StartDate).isSame(today, 'day'));
    } else if (selectedFilter === 'Tomorrow') {
      return nonRootTasks.filter(task => dayjs(task.StartDate).isSame(tomorrow, 'day'));
    } else if (selectedFilter === 'Week') {
      // Calculate Monday-based week range
      const startOfWeek = today.startOf('week').add(1, 'day'); // Monday
      const endOfWeek = startOfWeek.add(6, 'day'); // Sunday
      return nonRootTasks.filter(task =>
        dayjs(task.StartDate).isSameOrAfter(startOfWeek, 'day') &&
        dayjs(task.StartDate).isSameOrBefore(endOfWeek, 'day')
      );
    } else if (selectedFilter === 'Custom') {
      return nonRootTasks.filter(task => {
        const taskDate = dayjs(task.StartDate).startOf('day');
        const startDate = dayjs(customRange.startDate).startOf('day');
        const endDate = dayjs(customRange.endDate).startOf('day');
        return taskDate.isSame(startDate) || taskDate.isSame(endDate) || (taskDate.isAfter(startDate) && taskDate.isBefore(endDate));
      });
    }

    return [];
  }, [taskFinalData, selectedFilter, currentDate, selectedAssigneeId, customRange]);

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
        acc.estimate += parseFloat(task.estimate_hrs) || 0;
        acc.working += parseFloat(task.workinghr) || 0;
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

  const handleConfirmSplit = async () => {
    // ✅ Validate all split parts
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

  const handleKeyDown = async (e, taskId, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const task = tasks.find(t => t.taskid === taskId);
      if (!task) return;
      const updatedTask = {
        ...task,
        workinghr: task.workinghr,
      };
      try {
        const rootSubrootflagval = { Task: 'root' };
        const apiRes = await AddTaskDataApi(updatedTask, rootSubrootflagval);
        if (apiRes) {
          toast.success('Task working hrs added successfully!');
          handleTotalHourCalculate(tasks);
        }
        const currentInput = estimateTextFieldRefs.current[taskId];
        if (currentInput) currentInput.blur();
        const nextTaskIndex = index + 1;
        const nextTask = tasks[nextTaskIndex];
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
      } catch (error) {
        console.error('Error updating task estimate:', error);
        toast.error('Error while saving estimate!');
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

  // Helper function to update date picker based on selected filter
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
      // Set Monday as start of week
      const startOfWeek = targetDate.startOf('week').add(1, 'day');
      const endOfWeek = targetDate.endOf('week').add(1, 'day');
      setCustomRange({
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString()
      });
    }
  };

  const sortedTasks = React.useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    if (!sortConfig.key) return tasks;

    return [...tasks].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === 'asc'
        ? aVal - bVal
        : bVal - aVal;
    });
  }, [tasks, sortConfig]);

  const isValidDecimalInput = (value) => /^(\d{0,2}|\d{0,2}\.\d{0,2}|\.\d{1,2})?$/.test(value);

  return (
    <Box className="cal-Container">
      {(iswhTLoading == null || iswhTLoading == true) ? (
        <LoadingBackdrop isLoading={true} />
      ) :
        <>
          <CalendarFilter
            totalHours={totalHours}
            selectedFilter={selectedFilter}
            selectedAssigneeId={selectedAssigneeId}
            customRange={customRange}
            currentDate={currentDate}
            onFilterChange={handleFilterChange}
            onNavigate={handleNavigate}
            taskAssigneeData={taskAssigneeData}
            handleDateChange={handleDateChange}
            handleAssigneeChange={handleAssigneeChange}
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
                          <strong>{task.moduleName}</strong>/{task.taskname}
                        </TableCell>
                        <TableCell><StatusBadge task={task} statusColors={statusColors} onStatusChange={handleStatusChange} disable={false} /></TableCell>
                        <TableCell>{TaskPriority(task?.priority, priorityColors)}</TableCell>
                        <TableCell>{task.estimate_hrs}</TableCell>
                        <TableCell>
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
                    <TableCell colSpan={8} style={{ textAlign: 'center' }}>
                      No tasks found for today.
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

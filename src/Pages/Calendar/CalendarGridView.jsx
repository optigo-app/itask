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
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate3, handleAddApicall, priorityColors, statusColors } from '../../Utils/globalfun';

// Import dayjs and plugins for date calculations
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import SplitTaskModal from '../../Components/Calendar/SplitTaskModal';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import TaskPriority from '../../Components/ShortcutsComponent/TaskPriority';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { SeparatorHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { AddTaskDataApi } from '../../Api/TaskApi/AddTaskApi';
import { toast } from 'react-toastify';
import { deleteTaskDataApi } from '../../Api/TaskApi/DeleteTaskApi';
import CalendarFilter from './CalendarFilter';

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

// Helper to extract number from estimate string (e.g., "4h" -> 4)
const parseEstimateToNumber = (estimateString) => {
  const str = String(estimateString ?? '').trim();
  const match = str.match(/^(\d+(\.\d{1,3})?)$/);
  return match ? parseFloat(match[1]) : 0;
};

const tableHeaders = [
  { label: "Task Title", key: "taskname", width: "26%" },
  { label: "Status", key: "status", width: "8%" },
  { label: "Priority", key: "priority", width: "8%" },
  { label: "Estimate", key: "estimate_hrs", width: "8%" },
  { label: "Working Hour", key: "finalEstimate", width: "12%" },
  { label: "Start Date", key: "StartDate", width: "14%" },
  { label: "End Date", key: "DeadLineDate", width: "14%" },
];

const CalendarGridView = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const estimateTextFieldRefs = useRef({});
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState(null);
  const [numberOfDaysToSplit, setNumberOfDaysToSplit] = useState(0);
  const [splitParts, setSplitParts] = useState([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
  const {
    iswhTLoading,
    taskFinalData,
    taskAssigneeData
  } = useFullTaskFormatFile();

  const filteredTasks = React.useMemo(() => {
    if (!taskFinalData?.TaskData) return [];
    const today = currentDate.startOf('day');
    const tomorrow = today.add(1, 'day');
    const weekEnd = today.endOf('week');

    const userProfile = JSON?.parse(localStorage.getItem('UserProfileData')) ?? {};
    const isAdmin = userProfile.designation?.toLowerCase() === 'admin';

    // Flatten all tasks or only "my" tasks
    const rawTasks = isAdmin
      ? flattenTasks(taskFinalData.TaskData)
      : flattenTasks(filterNestedTasksByView(taskFinalData.TaskData, 'me', userProfile.id));

    let nonRootTasks = rawTasks.filter(task => task.parentid !== 0);

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
      return nonRootTasks.filter(task =>
        dayjs(task.StartDate).isAfter(today.subtract(1, 'day')) &&
        dayjs(task.StartDate).isBefore(weekEnd.add(1, 'day'))
      );
    }

    return [];
  }, [taskFinalData, selectedFilter, currentDate, selectedAssigneeId]);


  useEffect(() => {
    setTasks(filteredTasks);
  }, [filteredTasks]);

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
          finalEstimate: part.hours,
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
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.taskid === taskId
          ? { ...task, finalEstimate: newEstimate }
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
        finalEstimate: task.finalEstimate ?? task.workinghr,
      };
      try {
        const rootSubrootflagval = { Task: 'root' };
        const apiRes = await AddTaskDataApi(updatedTask, rootSubrootflagval);
        if (apiRes) {
          toast.success('Task working hrs added successfully!');
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
    const newDate = direction === 'prev'
      ? currentDate.subtract(1, 'day')
      : currentDate.add(1, 'day');
    setCurrentDate(newDate);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentDate(dayjs());
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
    console.log('sortedTasks: ', sortedTasks);

  return (
    <Box className="cal-Container">
      {(iswhTLoading == null || iswhTLoading == true) ? (
        <LoadingBackdrop isLoading={true} />
      ) :
        <>
          <CalendarFilter
            selectedFilter={selectedFilter}
            selectedAssigneeId={selectedAssigneeId}
            onFilterChange={handleFilterChange}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            taskAssigneeData={taskAssigneeData}
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
                            value={task.finalEstimate ?? task?.workinghr}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (isValidDecimalInput(value)) {
                                handleEstimateChange(task.taskid, e.target.value)
                              }
                            }}
                            inputRef={(el) => (estimateTextFieldRefs.current[task.taskid] = el)}
                            onKeyDown={(e) => handleKeyDown(e, task.taskid, index)}
                            disabled={!dayjs(task.StartDate).isSame(dayjs(), 'day')}
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
                            className='buttonClassname'
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

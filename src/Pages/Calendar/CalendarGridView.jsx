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
  Tooltip,
  IconButton,
} from '@mui/material';
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate3, priorityColors, statusColors } from '../../Utils/globalfun';
import { v4 as uuidv4 } from 'uuid';

// Import dayjs and plugins for date calculations
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import SplitTaskModal from '../../Components/Calendar/SplitTaskModal';
import StatusBadge from '../../Components/ShortcutsComponent/StatusBadge';
import TaskPriority from '../../Components/ShortcutsComponent/TaskPriority';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { SeparatorHorizontal, Split } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { AddTaskDataApi } from '../../Api/TaskApi/AddTaskApi';
import { toast } from 'react-toastify';
import { deleteTaskDataApi } from '../../Api/TaskApi/DeleteTaskApi';

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

const CalendarGridView = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const debounceRef = useRef(null);
  const estimateTextFieldRefs = useRef({});
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState(null);
  const [numberOfDaysToSplit, setNumberOfDaysToSplit] = useState(0);
  const [splitParts, setSplitParts] = useState([]);
  const {
    iswhTLoading,
    taskFinalData,
  } = useFullTaskFormatFile();

  useEffect(() => {
    const userProfile = JSON?.parse(localStorage.getItem('UserProfileData'));
    if (!iswhTLoading && taskFinalData?.TaskData) {
      const today = dayjs().startOf('day');
      const userId = userProfile?.id;
      const myTasks = filterNestedTasksByView(taskFinalData.TaskData, 'me', userId);
      const allTasks = flattenTasks(myTasks);
      const nonRootTasks = allTasks.filter(task => task.parentid !== 0);
      const filteredTasks = nonRootTasks.filter(task =>
        dayjs(task.StartDate).isSame(today, 'day')
      );
      setTasks(filteredTasks);
    }
  }, [iswhTLoading, location.pathname, taskFinalData]);

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
    const regex = /^\d{0,3}(\.\d{0,3})?$/;
    if (newEstimate === '' || regex.test(newEstimate)) {
      let updatedTask = null;

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task.taskid === taskId) {
            updatedTask = { ...task, finalEstimate: newEstimate };
            return updatedTask;
          }
          return task;
        });
        return updatedTasks;
      });

      // Clear any previous debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new debounce timer
      debounceRef.current = setTimeout(async () => {
        if (updatedTask) {
          try {
            const rootSubrootflagval = {
              Task: 'root',
            };
            const apiRes = await AddTaskDataApi(updatedTask, rootSubrootflagval);
            if (apiRes) {
              toast.success('Task working hr added successfully!');
            }
          } catch (error) {
            console.error('Error updating task estimate:', error);
          }
        }
      }, 800);
    }
  };

  const handleKeyDown = (e, taskId, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const nextTaskIndex = index + 1;
      if (nextTaskIndex < tasks.length) {
        const nextTaskId = tasks[nextTaskIndex].taskid;
        estimateTextFieldRefs.current[nextTaskId]?.focus();
      }
    }
  };

  return (
    <>
      {(iswhTLoading === null || iswhTLoading === true) ? (
        <LoadingBackdrop isLoading={true} />
      ) :
        <TableContainer component={Paper} className='muiTableTaContainer'>
          <Table aria-label="task table" className='muiTable'>
            <TableHead className='muiTableHead'>
              <TableRow>
                <TableCell>
                  <strong>Task Title</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Priority</strong>
                </TableCell>
                <TableCell>
                  <strong>Estimate</strong>
                </TableCell>
                <TableCell>
                  <strong>Working Hour</strong>
                </TableCell>
                <TableCell>
                  <strong>Start Date</strong>
                </TableCell>
                <TableCell>
                  <strong>End Date</strong>
                </TableCell>
                <TableCell>
                  <strong>Action</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks?.length > 0 ?
                <>
                  {tasks?.map((task, index) => (
                    <TableRow key={task.taskid}>
                      <TableCell>{task.taskname}</TableCell>
                      <TableCell><StatusBadge task={task} statusColors={statusColors} disable={true} /></TableCell>
                      <TableCell>{TaskPriority(task?.priority, priorityColors)}</TableCell>
                      <TableCell>{task.estimate_hrs}</TableCell>
                      <TableCell>
                        <TextField
                          variant="outlined"
                          size="small"
                          value={task.finalEstimate ?? task?.workinghr}
                          onChange={(e) => handleEstimateChange(task.taskid, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, task.taskid, index)}
                          inputRef={(el) => (estimateTextFieldRefs.current[task.taskid] = el)}
                          sx={{ width: '100px' }}
                          {...commonTextFieldProps}
                          inputProps={{ inputMode: 'decimal', pattern: '^[0-9]{0,3}(\\.[0-9]{0,3})?$' }}
                          disabled={!dayjs(task.StartDate).isSame(dayjs(), 'day')}
                        />
                      </TableCell>
                      <TableCell>
                        {task.StartDate ? formatDate3(task.StartDate) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {task.DeadLineDate ? cleanDate(formatDate3(task.DeadLineDate)) : 'N/A'}
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
    </>
  );
};

export default CalendarGridView;
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { commonTextFieldProps } from '../../Utils/globalfun';
import { v4 as uuidv4 } from 'uuid';

// Import dayjs and plugins for date calculations
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration"; // Import duration plugin
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';
import SplitTaskModal from '../../Components/Calendar/SplitTaskModal';

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

// Helper to extract number from estimate string (e.g., "4h" -> 4)
const parseEstimateToNumber = (estimateString) => {
  const match = estimateString.match(/^(\d+(\.\d{1,3})?)/);
  return match ? parseFloat(match[1]) : 0;
};

const CalendarGridView = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Design Homepage', status: 'In Progress', priority: 'High', estimate: '3h', finalEstimate: '4h', startDate: null, endDate: null },
    { id: 2, title: 'Develop API', status: 'Pending', priority: 'Medium', estimate: '5h', finalEstimate: '6h', startDate: null, endDate: null },
    { id: 3, title: 'QA Testing', status: 'Completed', priority: 'Low', estimate: '2h', finalEstimate: '3h', startDate: null, endDate: null },
  ]);
  const estimateTextFieldRefs = useRef({});

  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [selectedTaskToSplit, setSelectedTaskToSplit] = useState(null);
  const [numberOfDaysToSplit, setNumberOfDaysToSplit] = useState(0);
  const [splitParts, setSplitParts] = useState([]);

  const totalSplitHours = splitParts.reduce((sum, part) => {
    const hours = parseEstimateToNumber(part.hours);
    return sum + hours;
  }, 0);

  const originalTaskEstimateNum = selectedTaskToSplit
    ? parseEstimateToNumber(selectedTaskToSplit.finalEstimate)
    : 0;

  const handleSplit = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setSelectedTaskToSplit(task);
    setNumberOfDaysToSplit(1);
    // Initialize splitParts with one part and default hours, or derived from original
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
        // If hours change and startDate exists, recalculate endDate
        const currentPart = newSplitParts[index];
        if (currentPart.startDate && value !== '') {
          const hoursNum = parseEstimateToNumber(value);
          // Calculate endDate by adding duration to startDate
          const calculatedEndDate = dayjs(currentPart.startDate).add(dayjs.duration({ hours: hoursNum }));
          newSplitParts[index].endDate = calculatedEndDate.toDate(); // Store as Date object
        } else if (value === '' && currentPart.startDate) {
          // If hours cleared but start date exists, clear end date too
          newSplitParts[index].endDate = null;
        }
      }
    } else if (type === 'startDate') {
      newSplitParts[index] = { ...newSplitParts[index], [type]: value ? value.toDate() : null }; // Convert dayjs object to Date
      // If startDate changes and hours exist, recalculate endDate
      const currentPart = newSplitParts[index];
      if (currentPart.startDate && currentPart.hours !== '') {
        const hoursNum = parseEstimateToNumber(currentPart.hours);
        const calculatedEndDate = dayjs(currentPart.startDate).add(dayjs.duration({ hours: hoursNum }));
        newSplitParts[index].endDate = calculatedEndDate.toDate(); // Store as Date object
      } else if (!value) { // If startDate is cleared
        newSplitParts[index].endDate = null; // Clear endDate
      }
    } else {
      // For other types (like manual endDate if you add it back), just update
      newSplitParts[index] = { ...newSplitParts[index], [type]: value };
    }
    setSplitParts(newSplitParts);
  }, [splitParts]);

  const handleConfirmSplit = () => {
    if (!selectedTaskToSplit) return;

    if (totalSplitHours > originalTaskEstimateNum) {
      alert('Total hours for split tasks cannot exceed the original task estimate!');
      return;
    }

    let updatedTasks = tasks.filter((task) => task.id !== selectedTaskToSplit.id);

    splitParts.forEach((part, index) => {
      // Ensure startDate and endDate are valid Date objects or null
      const formattedStartDate = part.startDate instanceof Date ? part.startDate : null;
      const formattedEndDate = part.endDate instanceof Date ? part.endDate : null;

      updatedTasks.push({
        id: uuidv4(),
        title: `${selectedTaskToSplit.title} (Part ${index + 1})`,
        status: 'Pending',
        priority: selectedTaskToSplit.priority,
        estimate: part.hours,
        finalEstimate: part.hours,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    });

    setTasks(updatedTasks);
    handleCloseSplitModal();
  };

  const handleEstimateChange = (taskId, newEstimate) => {
    const regex = /^\d{0,3}(\.\d{0,3})?$/;
    if (newEstimate === '' || regex.test(newEstimate)) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, finalEstimate: newEstimate } : task
        )
      );
    }
  };

  const handleKeyDown = (e, taskId, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const nextTaskIndex = index + 1;
      if (nextTaskIndex < tasks.length) {
        const nextTaskId = tasks[nextTaskIndex].id;
        estimateTextFieldRefs.current[nextTaskId]?.focus();
      }
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="task table">
          <TableHead>
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
                <strong>Final Estimate</strong>
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
            {tasks.map((task, index) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.status}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.estimate}</TableCell>
                <TableCell>
                  <TextField
                    variant="outlined"
                    size="small"
                    value={task.finalEstimate}
                    onChange={(e) => handleEstimateChange(task.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, task.id, index)}
                    inputRef={(el) => (estimateTextFieldRefs.current[task.id] = el)}
                    sx={{ width: '100px' }}
                    {...commonTextFieldProps}
                    inputProps={{ inputMode: 'decimal', pattern: '^[0-9]{0,3}(\\.[0-9]{0,3})?$' }}
                  />
                </TableCell>
                <TableCell>
                  {task.startDate ? dayjs(task.startDate).tz("Asia/Kolkata").format('DD/MM/YYYY hh:mm A') : 'N/A'}
                </TableCell>
                <TableCell>
                  {task.endDate ? dayjs(task.endDate).tz("Asia/Kolkata").format('DD/MM/YYYY hh:mm A') : 'N/A'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleSplit(task.id)}
                  >
                    Split
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
        originalTaskEstimate={originalTaskEstimateNum}
      />
    </>
  );
};

export default CalendarGridView;
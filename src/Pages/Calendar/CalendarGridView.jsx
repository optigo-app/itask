import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';

const taskData = [
  {
    id: 1,
    title: 'Design Homepage',
    status: 'In Progress',
    priority: 'High',
    finalEstimate: '4h',
  },
  {
    id: 2,
    title: 'Develop API',
    status: 'Pending',
    priority: 'Medium',
    finalEstimate: '6h',
  },
  {
    id: 3,
    title: 'QA Testing',
    status: 'Completed',
    priority: 'Low',
    finalEstimate: '3h',
  },
];

const CalendarGridView = () => {
  const handleSplit = (taskId) => {
    console.log('Split task:', taskId);
    // Add your split logic here
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="task table">
        <TableHead>
          <TableRow>
            <TableCell><strong>Task Title</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Priority</strong></TableCell>
            <TableCell><strong>Final Estimate</strong></TableCell>
            <TableCell><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskData.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.priority}</TableCell>
              <TableCell>{task.finalEstimate}</TableCell>
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
  );
};

export default CalendarGridView;

import React from 'react';
import { Box } from '@mui/material';
import { getDaysFromDeadline } from '../../Utils/globalfun';

// Compact single-line due chip for dashboard rows — replaces the two-line
// date+chip stack from formatDaysDisplay which breaks row alignment.
const DueChip = ({ date, task }) => {
    const days = getDaysFromDeadline(date);
    if (days === null) return null;

    const isCompleted = (task?.status || '').toLowerCase() === 'completed';

    const meta = isCompleted
        ? { color: '#388e3c', bg: '#e8f5e9', text: 'Completed' }
        : days < 0
            ? { color: '#d32f2f', bg: '#ffebee', text: `${Math.abs(days)}d overdue` }
            : days === 0
                ? { color: '#388e3c', bg: '#e8f5e9', text: 'Today' }
                : { color: '#1976d2', bg: '#e3f2fd', text: `in ${days}d` };

    return (
        <Box className='statusChip' sx={{ color: meta.color, backgroundColor: meta.bg }}>
            {meta.text}
        </Box>
    );
};

export default DueChip;

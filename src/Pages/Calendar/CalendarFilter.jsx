import React from 'react';
import { Box, IconButton, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';
import DepartmentAssigneeAutocomplete from '../../Components/ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import { PERMISSIONS } from '../../Components/Auth/Role/permissions';
import useAccess from '../../Components/Auth/Role/useAccess';

const filterOptions = ['Today', 'Tomorrow', 'Week'];

const CalendarFilter = ({ totalHours, selectedFilter, selectedAssigneeId, onFilterChange, handleAssigneeChange, currentDate, onNavigate, taskAssigneeData }) => {
  const { hasAccess } = useAccess();
  const handleToggleChange = (event, newFilter) => {
    if (newFilter !== null) {
      onFilterChange(newFilter);
    }
  };

  return (
    <Box className="calendar-filter">
      <Box className="summaryCard">
        <Box className="summaryBox">
          <Typography variant="subtitle2" className='label'>
            Total Estimate:
          </Typography>
          <Typography variant="subtitle1" className='value'>
            {totalHours.estimate} hrs
          </Typography>
        </Box>
        <Box className="summaryBox">
          <Typography variant="subtitle2" className='label' sx={{ ml: 4 }}>
            Total Working Hrs:
          </Typography>
          <Typography variant="subtitle1" className='value'>
            {totalHours.working} hrs
          </Typography>
        </Box>
        {hasAccess(PERMISSIONS.CALENDAR_A_DROPDOWN) &&
          <Box className="meetingAssigneBox" sx={{ minWidth: 280 }}>
            <DepartmentAssigneeAutocomplete
              name="assignee"
              minWidth={250}
              value={selectedAssigneeId}
              options={taskAssigneeData}
              // label="Assignees"
              placeholder="Select assignees"
              limitTags={2}
              onChange={handleAssigneeChange}
              multiple={false}
            />
          </Box>
        }
      </Box>
      <Box className="filter-box">
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => onNavigate('prev')} size="small">
            <ChevronLeft />
          </IconButton>

          <Typography variant="subtitle1">
            {dayjs(currentDate).format('DD MMM YYYY')}
          </Typography>

          <IconButton onClick={() => onNavigate('next')} size="small">
            <ChevronRight />
          </IconButton>
        </Box>

        <ToggleButtonGroup
          value={selectedFilter}
          exclusive
          onChange={handleToggleChange}
          size="small"
          sx={{
            borderRadius: 3,
            p: '2px',
          }}
        >
          {filterOptions.map((label) => (
            <ToggleButton
              key={label}
              value={label}
              className='filter-toggle'
              sx={{
                px: 2,
                textTransform: 'none',
                fontWeight: 500,
                color: selectedFilter === label ? '#fff !important' : '#6D6B77 !important',
                background: selectedFilter === label ? '#7367f0 !important' : 'transparent !important',
                '&:hover': {
                  background: selectedFilter === label ? '#5e50ee !important' : '#e0e0e0 !important',
                },
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default CalendarFilter;

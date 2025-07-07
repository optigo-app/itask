import React from 'react';
import { Box, IconButton, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';

const filterOptions = ['Today', 'Tomorrow', 'Week'];

const CalendarFilter = ({ selectedFilter, onFilterChange, currentDate, onNavigate }) => {
  const handleToggleChange = (event, newFilter) => {
    if (newFilter !== null) {
      onFilterChange(newFilter);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} className="calendar-filter">
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
  );
};

export default CalendarFilter;

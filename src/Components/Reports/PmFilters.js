import React from 'react';
import { Box, TextField, Autocomplete, ToggleButtonGroup, ToggleButton, IconButton, Typography } from '@mui/material';
import { List, Square } from 'lucide-react';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';
import CustomDateRangePicker from '../ShortcutsComponent/DateRangePicker';

const PmFilters = ({
  searchText,
  setSearchText,
  selectedAssignee,
  setSelectedAssignee,
  selectedProject,
  setSelectedProject,
  selectedFilter,
  currentDate,
  filterOptions,
  assigneeOptions,
  projectOptions,
  viewMode,
  handleTaskChange,
  TASK_OPTIONS,
  viewType,
  handleViewChange,
  handleDateChange,
  onNavigate,
  handleToggleChange,
  commonTextFieldProps = {}
}) => {
  const ViewToggleButtons = ({ view, onViewChange }) => {
    return (
      <ToggleButtonGroup
        size='small'
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label="view mode"
      >
        <ToggleButton value="table" aria-label="table view" sx={{ borderRadius: '8px' }}>
          <List className="iconbtn" size={20} />
        </ToggleButton>
        <ToggleButton value="card" aria-label="card view" sx={{ borderRadius: '8px' }}>
          <Square className="iconbtn" size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };
  return (
    <Box className="pmsFilterBox">
      <Box className="pmsSideBarTgBox">
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <Box>
            <TextField
              variant="outlined"
              placeholder="Search All Fields"
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ minWidth: 280 }}
              {...commonTextFieldProps}
            />
          </Box>
          <Box>
            {viewMode === 'EmployeeWiseData' && (
              <Autocomplete
                options={assigneeOptions}
                value={selectedAssignee || null}
                onChange={(e, newValue) => setSelectedAssignee(newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Assignee" size="small" {...commonTextFieldProps} />
                )}
                sx={{ minWidth: 280 }}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            )}

            {viewMode === 'ModuleWiseData' && (
              <Autocomplete
                options={projectOptions}
                value={selectedProject || null}
                onChange={(e, newValue) => setSelectedProject(newValue || '')}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select Project" size="small" {...commonTextFieldProps} />
                )}
                sx={{ minWidth: 280 }}
                clearOnEscape
                isOptionEqualToValue={(option, value) => option === value}
              />
            )}
          </Box>
        </Box>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleTaskChange}
          aria-label="task type"
          size="small"
          className="toggle-group"
        >
          {TASK_OPTIONS.map(({ id, value, label, icon }) => (
            <ToggleButton key={id} value={value} className="toggle-button" sx={{ borderRadius: '8px' }}>
              {icon}
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {/* <ViewToggleButtons view={viewType} onViewChange={handleViewChange} /> */}
      </Box>
      <Box className="pmsDateFilterBox">
        <CustomDateRangePicker value={selectedFilter?.dateRangeFilter} onChange={handleDateChange} />
        {/* <Box display="flex" alignItems="center" gap={1}>
          <IconButton onClick={() => onNavigate('prev')} size="small">
            <ChevronLeft />
          </IconButton>

          <Typography variant="subtitle1">
            {dayjs(currentDate).format('DD MMM YYYY')}
          </Typography>

          <IconButton onClick={() => onNavigate('next')} size="small">
            <ChevronRight />
          </IconButton>
        </Box> */}

        <ToggleButtonGroup
          value={selectedFilter?.timeFilter}
          exclusive
          onChange={handleToggleChange}
          size="small"
          sx={{
            borderRadius: '8px',
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
                borderRadius: '8px',
                color: selectedFilter?.timeFilter === label ? '#fff !important' : '#6D6B77 !important',
                background: selectedFilter?.timeFilter === label ? '#7367f0 !important' : 'transparent !important',
                '&:hover': {
                  background: selectedFilter?.timeFilter === label ? '#5e50ee !important' : '#e0e0e0 !important',
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

export default PmFilters;

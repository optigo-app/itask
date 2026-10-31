import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, ToggleButton, ToggleButtonGroup, TextField, InputAdornment, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Search as SearchIcon } from 'lucide-react';
import dayjs from 'dayjs';
import DepartmentAssigneeAutocomplete from '../../Components/ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import CustomAutocomplete from '../../Components/ShortcutsComponent/CustomAutocomplete';
import { PERMISSIONS } from '../../Components/Auth/Role/permissions';
import useAccess from '../../Components/Auth/Role/useAccess';
import CustomDateRangePicker from '../../Components/ShortcutsComponent/DateRangePicker';
import { fetchModuleDataApi } from '../../Api/TaskApi/ModuleDataApi';
import { mapKeyValuePair } from '../../Utils/globalfun';

const filterOptions = ['Today', 'Tomorrow', 'Week'];

const CalendarFilter = ({ totalHours, selectedFilter, selectedAssigneeId, selectedModuleId, currentDate, customRange, onNavigate, onFilterChange, handleAssigneeChange, handleModuleChange, handleDateChange, taskAssigneeData, searchTerm, onSearchChange }) => {
  const { hasAccess } = useAccess();
  const [moduleData, setModuleData] = useState([]);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const response = await fetchModuleDataApi({});
        if (response?.rd) {
          const mappedData = mapKeyValuePair(response);
          const dataWithId = mappedData.map(item => ({
            ...item,
            id: String(item.taskid)
          }));
          setModuleData(dataWithId);
        }
      } catch (error) {
        console.error('Error fetching module data:', error);
        setModuleData([]);
      }
    };
    fetchModuleData();
  }, []);

  const handleToggleChange = (event, newFilter) => {
    if (newFilter !== null) {
      onFilterChange(newFilter);
    }
  };

  return (
    <Box className="calendar-filter">
      <Box className="summaryCard">
        <Tooltip title={`Total Estimate: ${(totalHours.estimate)?.toFixed(2)} hrs`} arrow placement="top">
          <Box className="summaryBox">
            <Typography variant="subtitle2" className='label'>Est:</Typography>
            <Typography variant="subtitle1" className='value'>
              {(totalHours.estimate)?.toFixed(2)} hrs
            </Typography>
          </Box>
        </Tooltip>
        <Tooltip title={`Total Working Hrs: ${(totalHours.working)?.toFixed(2)} hrs`} arrow placement="top">
          <Box className="summaryBox">
            <Typography variant="subtitle2" className='label'>Worked:</Typography>
            <Typography variant="subtitle1" className='value'>
              {(totalHours.working)?.toFixed(2)} hrs
            </Typography>
          </Box>
        </Tooltip>
        {onSearchChange && (
          <TextField
            placeholder="Search tasks..."
            value={searchTerm ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            className="textfieldsClass"
            sx={{
              minWidth: 160,
              flex: '0 1 220px',
              "@media (max-width: 600px)": { minWidth: "100%" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
                </InputAdornment>
              ),
            }}
            aria-label="Search tasks"
          />
        )}
        <Box className="meetingAssigneBox" sx={{ minWidth: 180 }}>
          <CustomAutocomplete
            name="module"
            value={selectedModuleId}
            options={moduleData}
            placeholder="Select module"
            onChange={handleModuleChange}
            width="220px"
            getOptionLabel={(option) => option?.taskname || ''}
          />
        </Box>
        {hasAccess(PERMISSIONS.CALENDAR_A_DROPDOWN) && (
          <Box className="meetingAssigneBox" sx={{ minWidth: 280 }}>
            <DepartmentAssigneeAutocomplete
              name="assignee"
              minWidth={250}
              value={selectedAssigneeId}
              options={taskAssigneeData?.filter((emp) => emp.isactive === 1)}
              placeholder="Select assignees"
              limitTags={2}
              onChange={handleAssigneeChange}
              multiple={false}
            />
          </Box>
        )}
      </Box>
      <Box className="filter-box">
        <CustomDateRangePicker value={customRange} onChange={handleDateChange} />
        {/* <Box className="navigation-container">
          <IconButton
            onClick={() => onNavigate('prev')}
            size="small"
            className="nav-button"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          <Box className="date-display">
            {selectedFilter === 'Week'
              ? `Week ${dayjs(currentDate).week()}`
              : selectedFilter === 'Today'
                ? dayjs(currentDate).format('MMM DD, YYYY')
                : selectedFilter === 'Tomorrow'
                  ? dayjs(currentDate).add(1, 'day').format('MMM DD, YYYY')
                  : 'Custom Range'
            }
          </Box>

          <IconButton
            onClick={() => onNavigate('next')}
            size="small"
            className="nav-button"
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box> */}

        <ToggleButtonGroup
          value={selectedFilter}
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
                borderRadius: '8px',
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

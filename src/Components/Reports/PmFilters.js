import { Box, TextField, Autocomplete, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CustomDateRangePicker from '../ShortcutsComponent/DateRangePicker';

const PmFilters = ({
  searchText,
  setSearchText,
  selectedAssignee,
  setSelectedAssignee,
  selectedProject,
  setSelectedProject,
  selectedDepartment,
  setSelectedDepartment,
  selectedFilter,
  currentDate,
  filterOptions,
  assigneeOptions,
  projectOptions,
  departmentOptions,
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
              sx={{ minWidth: 200 }}
              {...commonTextFieldProps}
            />
          </Box>

          <Box>
            <Autocomplete
              options={departmentOptions || []}
              value={selectedDepartment || null}
              onChange={(e, newValue) => setSelectedDepartment(newValue || '')}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Department" size="small" {...commonTextFieldProps} />
              )}
              sx={{ minWidth: 200 }}
              clearOnEscape
              isOptionEqualToValue={(option, value) => option === value}
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
                sx={{ minWidth: 200 }}
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
                sx={{ minWidth: 200 }}
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
      </Box>
      <Box className="pmsDateFilterBox">
        <CustomDateRangePicker value={selectedFilter?.dateRangeFilter} onChange={handleDateChange} />
        <Box className="navigation-container">
          <IconButton
            onClick={() => onNavigate('prev')}
            size="small"
            className="nav-button"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          {/* <Box className="date-display">
            {selectedFilter?.timeFilter === 'Week'
              ? `Week ${dayjs(currentDate).week()}`
              : selectedFilter?.timeFilter === 'Today'
                ? dayjs(currentDate).format('MMM DD, YYYY')
                : selectedFilter?.timeFilter === 'Tomorrow'
                  ? dayjs(currentDate).add(1, 'day').format('MMM DD, YYYY')
                  : 'Custom Range'
            }
          </Box> */}

          <IconButton
            onClick={() => onNavigate('next')}
            size="small"
            className="nav-button"
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

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

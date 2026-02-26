import React from 'react';
import { Box, Button, Popover } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import CustomAutocomplete from '../../Components/ShortcutsComponent/CustomAutocomplete';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';

const BugTrackingBugFiltersPopover = ({
  anchorEl,
  open,
  onClose,
  bugFilters,
  setBugFilters,
  taskBugStatusData,
  taskBugPriorityData,
  taskAssigneeData,
}) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setBugFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, name) => {
    setBugFilters(prev => ({ ...prev, [name]: date ? date.toISOString() : '' }));
  };

  const handleClearFilters = () => {
    setBugFilters({
      status: '',
      assignee: '',
      priority: '',
      testby: '',
      createddate: '',
      reassigned: ''
    });
  };

  const renderAutocomplete = (label, name, value, placeholder, options, onChange, error = false, helperText = '', disabled) => (
    <CustomAutocomplete
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      helperText={helperText}
      getOptionLabel={(option) => option.labelname}
      isOptionEqualToValue={(option, value) => String(option.id) === String(value)}
    />
  );

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      PaperProps={{
        sx: { width: 340, mt: 1, borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' },
      }}
    >
      <Box sx={{ px: 1, pb: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
          {renderAutocomplete('Status', 'status', bugFilters.status, 'All', taskBugStatusData, handleFilterChange)}
          {renderAutocomplete('Priority', 'priority', bugFilters.priority, 'All', taskBugPriorityData, handleFilterChange)}
          {renderAutocomplete('Assignee', 'assignee', bugFilters.assignee, 'All', taskAssigneeData, handleFilterChange)}
          {renderAutocomplete('Tested By', 'testby', bugFilters.testby, 'All', taskAssigneeData, handleFilterChange)}
          <CustomDateTimePicker
            label="Bug Created Date"
            value={bugFilters.createddate}
            onChange={(date) => handleDateChange(date, 'createddate')}
            placeholder="Select date"
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={handleClearFilters}
            startIcon={<RotateCcw size={16} />}
            sx={{ textTransform: 'none' }}
          >
            Clear Filters
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default BugTrackingBugFiltersPopover;

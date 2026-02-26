import React from 'react';
import { Box, Button, Popover } from '@mui/material';
import { RotateCcw } from 'lucide-react';
import CustomAutocomplete from '../../Components/ShortcutsComponent/CustomAutocomplete';

const BugTrackingFiltersPopover = ({
  anchorEl,
  open,
  onClose,
  listFilters,
  statusData,
  priorityData,
  taskCategory,
  onListFilterChange,
  onClear,
}) => {
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
          {renderAutocomplete('Status', 'status', listFilters.status, 'All', statusData, onListFilterChange)}
          {renderAutocomplete('Priority', 'priority', listFilters.priority, 'All', priorityData, onListFilterChange)}
          {renderAutocomplete('Category', 'category', listFilters.category, 'All', taskCategory, onListFilterChange)}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={onClear}
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

export default BugTrackingFiltersPopover;

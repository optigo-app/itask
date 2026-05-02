import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Autocomplete,
    IconButton,
} from '@mui/material';
import { Search as SearchIcon } from 'lucide-react';
import { commonTextFieldProps, getUserProfileData } from '../../../Utils/globalfun';
import CustomDateRangePicker from '../../ShortcutsComponent/DateRangePicker';
import DepartmentAssigneeAutocomplete from '../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';

const FullTaskViewFilters = ({
    searchInput,
    onSearchChange,
    onSearchEnter,
    dateRangePreset,
    onDateRangePresetChange,
    dateRangeOptions,
    filters,
    onFilterChange,
    taskAssigneeData,
    statusData,
    priorityData,
    taskCategory,
}) => {
    const profileData = getUserProfileData();
    const isAdmin = profileData?.designation?.toLowerCase() === "admin";
    return (
        <Box className="calendar-filter">
            <Box className="filter-box" sx={{ flexWrap: 'wrap', gap: 1, rowGap: 1 }}>
                <Box className="form-group" sx={{ minWidth: 210, flex: '1 1 210px' }}>
                    <TextField
                        placeholder="Search tasks..."
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && onSearchEnter) {
                                onSearchEnter();
                            }
                        }}
                        size="small"
                        className="textfieldsClass"
                        sx={{ width: '100%' }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => onSearchEnter && onSearchEnter()}
                                        edge="end"
                                    >
                                        <SearchIcon size={18} color="#7d7f85" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box className="form-group" sx={{ minWidth: 140, flex: '1 1 140px' }}>
                    <Autocomplete
                        size="small"
                        sx={{ width: '100%' }}
                        value={dateRangeOptions?.find(opt => opt.id === dateRangePreset) || null}
                        onChange={(_, value) => onDateRangePresetChange(value?.id || '')}
                        options={dateRangeOptions || []}
                        getOptionLabel={(option) => option?.label || ''}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => <TextField {...params} placeholder="Date Preset" className="textfieldsClass" />}
                        className="filterAutocomplete"
                        {...commonTextFieldProps}
                    />
                </Box>

                {isAdmin && (
                    <Box sx={{ maxWidth: 250 }}>
                        <DepartmentAssigneeAutocomplete
                            name="assignee"
                            value={filters?.assignee}
                            options={taskAssigneeData?.filter((emp) => emp.isactive === 1)}
                            placeholder="Select assignees"
                            limitTags={2}
                            onChange={(newValue) => onFilterChange('assignee', newValue)}
                            minWidth={250}
                            multiple={false}
                        />
                    </Box>
                )}

                <Box className="form-group" sx={{ minWidth: 150, flex: '1 1 150px' }}>
                    <Autocomplete
                        size="small"
                        sx={{ width: '100%' }}
                        value={filters.status}
                        onChange={(_, value) => onFilterChange('status', value)}
                        options={statusData || []}
                        getOptionLabel={(option) => option?.labelname || ''}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => <TextField {...params} placeholder="Status" className="textfieldsClass" />}
                        className="filterAutocomplete"
                        {...commonTextFieldProps}
                    />
                </Box>

                <Box className="form-group" sx={{ minWidth: 150, flex: '1 1 150px' }}>
                    <Autocomplete
                        size="small"
                        sx={{ width: '100%' }}
                        value={filters.priority}
                        onChange={(_, value) => onFilterChange('priority', value)}
                        options={priorityData || []}
                        getOptionLabel={(option) => option?.labelname || ''}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => <TextField {...params} placeholder="Priority" className="textfieldsClass" />}
                        className="filterAutocomplete"
                        {...commonTextFieldProps}
                    />
                </Box>

                <Box className="form-group" sx={{ minWidth: 170, flex: '1 1 170px' }}>
                    <Autocomplete
                        size="small"
                        sx={{ width: '100%' }}
                        value={filters.category}
                        onChange={(_, value) => onFilterChange('category', value)}
                        options={taskCategory || []}
                        getOptionLabel={(option) => option?.labelname || ''}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={(params) => <TextField {...params} placeholder="Category" className="textfieldsClass" />}
                        className="filterAutocomplete"
                        {...commonTextFieldProps}
                    />
                </Box>

                <Box className="form-group dueDateFilterWrap" sx={{ minWidth: 220, flex: '1 1 220px' }}>
                    <CustomDateRangePicker
                        value={filters.startDate}
                        onChange={(range) => onFilterChange('startDate', range)}
                    />
                </Box>

                <Box className="form-group dueDateFilterWrap" sx={{ minWidth: 220, flex: '1 1 220px' }}>
                    <CustomDateRangePicker
                        value={filters.dueDate}
                        onChange={(range) => onFilterChange('dueDate', range)}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default FullTaskViewFilters;

import React, { useState } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Autocomplete,
    IconButton,
    Popover,
    Typography, 
    Tooltip,
    Drawer,
    Divider,
    Button,
    Badge,
    Chip,
} from '@mui/material';
import { Search as SearchIcon, Info, CircleCheck, Filter, CircleX } from 'lucide-react';
import { commonTextFieldProps, getISOWeekInfo, getUserProfileData } from '../../../Utils/globalfun';
import CustomDateRangePicker from '../../ShortcutsComponent/DateRangePicker';
import DepartmentAssigneeAutocomplete from '../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';

const FullTaskViewFilters = ({
    searchInput,
    onSearchChange,
    onSearchEnter,
    filters,
    onFilterChange,
    taskAssigneeData,
    statusData,
    priorityData,
    taskCategory,
    moduleData,
    showCompleted,
    onCompletedToggle,
}) => {
    const profileData = getUserProfileData();
    const isAdmin = profileData?.designation?.toLowerCase() === "admin";
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [infoAnchorEl, setInfoAnchorEl] = useState(null);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleAdvancedFiltersOpen = () => {
        setLocalFilters(filters);
        setShowAdvancedFilters(true);
    };

    const handleApply = () => {
        // Apply drawer-specific filters to the parent state
        const drawerFields = ['category', 'module', 'dueDate'];
        drawerFields.forEach(field => {
            if (localFilters[field] !== filters[field]) {
                onFilterChange(field, localFilters[field]);
            }
        });
        setShowAdvancedFilters(false);
    };

    const handleReset = () => {
        const cleared = {
            category: null,
            module: null,
            dueDate: null,
        };
        setLocalFilters(prev => ({ ...prev, ...cleared }));
        // Immediately reset parent state for these fields
        Object.keys(cleared).forEach(key => onFilterChange(key, null));
    };

    const handleInfoClick = (event) => {
        setInfoAnchorEl(event.currentTarget);
    };

    const handleInfoClose = () => {
        setInfoAnchorEl(null);
    };

    const activeFilterCount = [
        filters.category,
        filters.module,
        filters.dueDate
    ].filter(v => v !== null && (Array.isArray(v) ? v.length > 0 : true)).length;

    const handleQuickFilter = (type) => {
        const now = new Date();
        let range = { startDate: null, endDate: null };

        if (type === 'today') {
            range = {
                startDate: now.toISOString(),
                endDate: now.toISOString()
            };
        } else if (type === 'week') {
            const weekInfo = getISOWeekInfo(now);
            range = {
                startDate: weekInfo.startOfWeek.toISOString(),
                endDate: weekInfo.endOfWeek.toISOString()
            };
        } else if (type === 'month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            range = {
                startDate: startOfMonth.toISOString(),
                endDate: endOfMonth.toISOString()
            };
        }

        onFilterChange('startDate', range);
    };

    const isQuickFilterActive = (type) => {
        if (!filters.startDate?.startDate || !filters.startDate?.endDate) return false;

        const currentStart = filters.startDate.startDate.split('T')[0];
        const currentEnd = filters.startDate.endDate.split('T')[0];
        const now = new Date();

        if (type === 'today') {
            return currentStart === now.toISOString().split('T')[0] && currentEnd === now.toISOString().split('T')[0];
        }
        if (type === 'week') {
            const weekInfo = getISOWeekInfo(now);
            return currentStart === weekInfo.startOfWeek.toISOString().split('T')[0] &&
                currentEnd === weekInfo.endOfWeek.toISOString().split('T')[0];
        }
        if (type === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            return currentStart === start && currentEnd === end;
        }
        return false;
    };

    const infoOpen = Boolean(infoAnchorEl);
    const infoId = infoOpen ? 'info-popover' : undefined;

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

                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Chip
                        label="Today"
                        size="small"
                        onClick={() => handleQuickFilter('today')}
                        sx={{
                            height: '28px',
                            backgroundColor: isQuickFilterActive('today') ? '#7367f0' : '#f8f7fa',
                            color: isQuickFilterActive('today') ? 'white' : '#7d7f85',
                            border: `1px solid ${isQuickFilterActive('today') ? '#7367f0' : '#ebebed'}`,
                            fontSize: '13px',
                            '&:hover': {
                                backgroundColor: isQuickFilterActive('today') ? '#5e54d4' : '#ebebed',
                            }
                        }}
                    />
                    <Chip
                        label="Week"
                        size="small"
                        onClick={() => handleQuickFilter('week')}
                        sx={{
                            height: '28px',
                            backgroundColor: isQuickFilterActive('week') ? '#7367f0' : '#f8f7fa',
                            color: isQuickFilterActive('week') ? 'white' : '#7d7f85',
                            border: `1px solid ${isQuickFilterActive('week') ? '#7367f0' : '#ebebed'}`,
                            fontSize: '13px',
                            '&:hover': {
                                backgroundColor: isQuickFilterActive('week') ? '#5e54d4' : '#ebebed',
                            }
                        }}
                    />
                    <Chip
                        label="Month"
                        size="small"
                        onClick={() => handleQuickFilter('month')}
                        sx={{
                            height: '28px',
                            backgroundColor: isQuickFilterActive('month') ? '#7367f0' : '#f8f7fa',
                            color: isQuickFilterActive('month') ? 'white' : '#7d7f85',
                            border: `1px solid ${isQuickFilterActive('month') ? '#7367f0' : '#ebebed'}`,
                            fontSize: '13px',
                            '&:hover': {
                                backgroundColor: isQuickFilterActive('month') ? '#5e54d4' : '#ebebed',
                            }
                        }}
                    />
                </Box>

                <Tooltip
                    placement="top"
                    title={showCompleted ? "Hide completed tasks" : "Show completed tasks"}
                    arrow
                    classes={{ tooltip: "custom-tooltip" }}
                >
                    <IconButton
                        aria-label="Completed tasks"
                        onClick={onCompletedToggle}
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: '4px',
                            backgroundColor: showCompleted ? "#28C76F" : "white",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                            "&:hover": {
                                backgroundColor: "#f5f5f5",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                            },
                        }}
                    >
                        <CircleCheck className="iconbtn" color={showCompleted ? "#ffff" : "#0000008a"} size={22} />
                    </IconButton>
                </Tooltip>

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

                <Box className="form-group" sx={{ minWidth: 200, flex: '1 1 200px' }}>
                    <CustomDateRangePicker
                        value={filters.startDate}
                        onChange={(range) => onFilterChange('startDate', range)}
                    />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip
                        placement="top"
                        title="Show more filters"
                        arrow
                        classes={{ tooltip: "custom-tooltip" }}
                    >
                        <IconButton
                            aria-label="Show more filters"
                            onClick={handleAdvancedFiltersOpen}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: '8px',
                                backgroundColor: showAdvancedFilters ? "#7367f0" : "white",
                                color: showAdvancedFilters ? "white" : "#7d7f85",
                                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                                border: `1px solid ${showAdvancedFilters ? "#7367f0" : "#ebebed"}`,
                                transition: 'all 0.3s ease',
                                "&:hover": {
                                    backgroundColor: showAdvancedFilters ? "#5e54d4" : "#f8f7fa",
                                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                                    borderColor: "#7367f0",
                                    color: showAdvancedFilters ? "white" : "#7367f0",
                                },
                            }}
                        >
                            <Filter size={20} />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        size="small"
                        onClick={handleInfoClick}
                        aria-describedby={infoId}
                        sx={{ color: '#7d7f85' }}
                    >
                        <Info size={18} />
                    </IconButton>
                </Box>
            </Box>

            {/* Filter Drawer */}
            <Drawer anchor="right" open={showAdvancedFilters} onClose={() => setShowAdvancedFilters(false)}>
                <Box className="filterDrawerModal" sx={{ width: 350, padding: '10px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" gutterBottom>Filters</Typography>
                            <IconButton onClick={() => setShowAdvancedFilters(false)}>
                                <CircleX />
                            </IconButton>
                        </Box>
                        <Divider sx={{ mb: 2, mt: 1 }} />

                        <Box className="form-group" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Category</Typography>
                            <Autocomplete
                                size="small"
                                sx={{ width: '100%' }}
                                value={localFilters.category}
                                onChange={(_, value) => setLocalFilters(prev => ({ ...prev, category: value }))}
                                options={taskCategory || []}
                                getOptionLabel={(option) => option?.labelname || ''}
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                renderInput={(params) => <TextField {...params} placeholder="Category" className="textfieldsClass" />}
                                className="filterAutocomplete"
                                {...commonTextFieldProps}
                            />
                        </Box>

                        <Box className="form-group" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Module</Typography>
                            <Autocomplete
                                size="small"
                                sx={{ width: '100%' }}
                                value={localFilters.module}
                                onChange={(_, value) => setLocalFilters(prev => ({ ...prev, module: value }))}
                                options={moduleData || []}
                                getOptionLabel={(option) => option?.taskname || option?.labelname || option?.projectname || ''}
                                isOptionEqualToValue={(option, value) => option?.taskid === value?.taskid}
                                renderInput={(params) => <TextField {...params} placeholder="Module" className="textfieldsClass" />}
                                className="filterAutocomplete"
                                {...commonTextFieldProps}
                            />
                        </Box>


                        <Box className="form-group" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Due Date</Typography>
                            <CustomDateRangePicker
                                value={localFilters.dueDate}
                                onChange={(range) => setLocalFilters(prev => ({ ...prev, dueDate: range }))}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ pt: 2, pb: 1, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleReset}
                            className='secondaryBtnClassname'
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleApply}
                            className='buttonClassname'
                        >
                            Apply
                        </Button>
                    </Box>
                </Box>
            </Drawer>

            <Popover
                id={infoId}
                open={infoOpen}
                anchorEl={infoAnchorEl}
                onClose={handleInfoClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <Box sx={{ p: 2, maxWidth: 300 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
                        Task Updates
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.5 }}>
                        New tasks are automatically refreshed every 2 minutes in Full Task View, Calendar, and Today Task Grid to ensure you have the latest information.
                    </Typography>
                </Box>
            </Popover>
        </Box>
    );
};

export default FullTaskViewFilters;

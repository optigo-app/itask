import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
} from '@mui/material';
import { Search as SearchIcon } from 'lucide-react';
import { getISOWeekInfo } from '../../Utils/globalfun';
import DepartmentAssigneeAutocomplete from '../../Components/ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';

const DocsEstimateFilters = ({
    searchInput,
    onSearchChange,
    onSearchEnter,
    filters,
    onFilterChange,
    taskAssigneeData,
}) => {

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

                <Box sx={{ maxWidth: 250, flex: '1 1 200px' }}>
                    <DepartmentAssigneeAutocomplete
                        name="seniour"
                        value={filters?.seniour}
                        options={taskAssigneeData?.filter((emp) => emp.isactive === 1)}
                        placeholder="Select Senior"
                        limitTags={1}
                        onChange={(newValue) => onFilterChange('seniour', newValue)}
                        minWidth={200}
                        multiple={false}
                    />
                </Box>

                <Box sx={{ maxWidth: 250, flex: '1 1 200px' }}>
                    <DepartmentAssigneeAutocomplete
                        name="employee"
                        value={filters?.employee}
                        options={taskAssigneeData?.filter((emp) => emp.isactive === 1)}
                        placeholder="Select Employee"
                        limitTags={1}
                        onChange={(newValue) => onFilterChange('employee', newValue)}
                        minWidth={200}
                        multiple={false}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default DocsEstimateFilters;

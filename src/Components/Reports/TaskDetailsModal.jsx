import React, { useMemo, useState, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
    Box,
    TextField,
    Stack,
    AvatarGroup,
    Autocomplete,
    Button,
    useMediaQuery,
    useTheme,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import { commonTextFieldProps, priorityColors } from "../../Utils/globalfun";
import TablePaginationFooter from "../ShortcutsComponent/Pagination/TablePaginationFooter";
import ProfileImageMenu from "../ShortcutsComponent/ProfileImageMenu";
import HierarchicalTaskTreeTable from "./HierarchicalTaskTreeTable";
import CustomSwitch from "../Common/CustomSwitch";
import TaskTable from "./pms2TaskTable";
import { ListTree, StretchHorizontal } from "lucide-react";

const TaskDetailsModal = ({
    open,
    onClose,
    employee,
    reportType,
    viewMode,
}) => {
    const theme = useTheme();
    const isLaptop = useMediaQuery("(max-width:1440px)");
    const isProjectMode = viewMode === 'ModuleWiseData';

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');
    const [showMinorTasks, setShowMinorTasks] = useState(false);
    const [isTreeView, setIsTreeView] = useState(false);

    const handlePriorityChange = (task, newPriority) => {
        console.log('Priority changed for task:', task.id, 'to:', newPriority);
    };

    const handleTaskTypeToggle = useCallback((e) => {
        setShowMinorTasks(e.target.checked);
    }, []);

    const handleTableViewToggle = useCallback((event, newValue) => {
        if (newValue !== null) {
            setIsTreeView(newValue === 'tree');
        }
    }, []);

    // Get unique values for filter dropdowns
    const uniqueStatuses = useMemo(() => {
        if (!employee?.Tasks) return [];
        const statuses = [...new Set(employee.Tasks.map(task => task.status).filter(Boolean))];
        return statuses;
    }, [employee]);

    const uniquePriorities = useMemo(() => {
        if (!employee?.Tasks) return [];
        const priorities = [...new Set(employee.Tasks.map(task => task.priority).filter(Boolean))];
        return priorities;
    }, [employee]);

    const uniqueCategories = useMemo(() => {
        if (!employee?.Tasks) return [];
        const categories = [...new Set(employee.Tasks.map(task => task.category).filter(Boolean))];
        return categories;
    }, [employee]);

    const uniqueAssignees = useMemo(() => {
        if (!employee?.Tasks) return [];
        const assignees = [];
        employee.Tasks.forEach(task => {
            task.assignee?.forEach(assignee => {
                const fullName = `${assignee?.firstname || ''} ${assignee?.lastname || ''}`.trim();
                if (fullName && !assignees.some(a => a.id === assignee.id)) {
                    assignees.push({ id: assignee.id, name: fullName });
                }
            });
        });
        return assignees;
    }, [employee]);

    const filteredTasks = useMemo(() => {
        if (!employee?.Tasks) return [];

        let filtered = employee.Tasks;

        // Apply search filter
        if (searchText.trim()) {
            const lowerSearch = searchText.toLowerCase();
            filtered = filtered.filter(task => {
                // Search in task properties
                const taskMatch = Object.values(task).some(val =>
                    val?.toString().toLowerCase().includes(lowerSearch)
                );

                // Search in assignee details
                const assigneeMatch = task.assignee?.some(assignee => {
                    const fullName = `${assignee?.firstname || ''} ${assignee?.lastname || ''}`.toLowerCase();
                    const firstName = assignee?.firstname?.toLowerCase() || '';
                    const lastName = assignee?.lastname?.toLowerCase() || '';
                    const assigneeId = assignee?.id?.toString().toLowerCase() || '';
                    const email = assignee?.email?.toLowerCase() || '';
                    const designation = assignee?.designation?.toLowerCase() || '';

                    return fullName.includes(lowerSearch) ||
                        firstName.includes(lowerSearch) ||
                        lastName.includes(lowerSearch) ||
                        assigneeId.includes(lowerSearch) ||
                        email.includes(lowerSearch) ||
                        designation.includes(lowerSearch);
                });

                return taskMatch || assigneeMatch;
            });
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(task => task.status?.toLowerCase() === statusFilter.toLowerCase());
        }

        // Apply priority filter
        if (priorityFilter) {
            filtered = filtered.filter(task => task.priority?.toLowerCase() === priorityFilter.toLowerCase());
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(task => task.category?.toLowerCase() === categoryFilter.toLowerCase());
        }

        // Apply assignee filter
        if (assigneeFilter) {
            filtered = filtered.filter(task =>
                task.assignee?.some(assignee => assignee.id === assigneeFilter)
            );
        }

        return filtered;
    }, [employee, searchText, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);

    const clearAllFilters = () => {
        setSearchText('');
        setStatusFilter('');
        setPriorityFilter('');
        setCategoryFilter('');
        setAssigneeFilter('');
        setPage(1);
    };

    const activeFiltersCount = [statusFilter, priorityFilter, categoryFilter, assigneeFilter].filter(Boolean).length;

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(1);
    };

    // Calculate total count based on hierarchical tasks from the table component
    const [hierarchicalTasksCount, setHierarchicalTasksCount] = useState(0);

    // Calculate total count for pagination based on table view
    const totalTasksCount = useMemo(() => {
        if (isTreeView) {
            return hierarchicalTasksCount;
        } else {
            // For flat view, calculate based on filtered tasks
            if (!filteredTasks || filteredTasks.length === 0) return 0;
            if (showMinorTasks) {
                // Show both major and minor tasks
                return filteredTasks.filter(task => {
                    const taskType = (task.type || '').toLowerCase();
                    return taskType === 'major' || taskType === 'minor';
                }).length;
            } else {
                // Show only major tasks
                return filteredTasks.filter(task => {
                    const taskType = (task.type || '').toLowerCase();
                    return taskType === 'major';
                }).length;
            }
        }
    }, [isTreeView, hierarchicalTasksCount, filteredTasks, showMinorTasks]);

    const totalPages = Math?.ceil(totalTasksCount / rowsPerPage);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullScreen={isFullScreen}
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: isFullScreen ? '0%' : '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: isFullScreen ? '98.5%' : '80%',
                    height: isFullScreen ? '97%' : '78vh',
                    borderRadius: isFullScreen ? '0' : '8px',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                },
            }}
            className="taskDetailsModal"
        >
            {/* Title bar */}
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                    borderBottom: "1px solid #e0e0e0",
                    pr: 2
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }} spacing={2}>
                    <Typography variant="h6" fontWeight={600}>
                        Task Details
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: 'end', gap: 2 }}>
                        {/* Search Field */}
                        <Box sx={{ minWidth: 200, maxWidth: 200 }}>
                            <TextField
                                size="small"
                                fullWidth
                                variant="outlined"
                                placeholder="Search tasks..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                {...commonTextFieldProps}
                            />
                        </Box>

                        {/* Dynamic Filter Dropdowns - Responsive based on screen size and view mode */}
                        {(() => {
                            let filtersToShow = [];

                            if (isLaptop) {
                                // Laptop: Show only Status filter
                                if (isProjectMode) {
                                    // Project mode: Show Assignee filter
                                    filtersToShow = [
                                        {
                                            label: "Assignee",
                                            key: "assignee",
                                            value: uniqueAssignees.find(a => a.id === assigneeFilter) || null,
                                            onChange: (newValue) => setAssigneeFilter(newValue?.id || ''),
                                            options: [{ id: '', name: 'All' }, ...uniqueAssignees],
                                            getOptionLabel: (option) => option?.name || '',
                                            placeholder: "Select Assignee",
                                            width: 180
                                        }
                                    ];
                                } else {
                                    // Employee mode: Show Status filter
                                    filtersToShow = [
                                        {
                                            label: "Status",
                                            key: "status",
                                            value: statusFilter,
                                            onChange: setStatusFilter,
                                            options: uniqueStatuses,
                                            width: 180
                                        }
                                    ];
                                }
                            } else {
                                // Desktop: Show all filters
                                filtersToShow = [
                                    {
                                        label: "Status",
                                        key: "status",
                                        value: statusFilter,
                                        onChange: setStatusFilter,
                                        options: uniqueStatuses,
                                        width: 180
                                    },
                                    {
                                        label: "Priority",
                                        key: "priority",
                                        value: priorityFilter,
                                        onChange: setPriorityFilter,
                                        options: uniquePriorities,
                                        width: 180
                                    },
                                    {
                                        label: "Category",
                                        key: "category",
                                        value: categoryFilter,
                                        onChange: setCategoryFilter,
                                        options: uniqueCategories,
                                        width: 180
                                    }
                                ];
                            }

                            return filtersToShow.map((filter) => (
                                <Box key={filter.key} sx={{ minWidth: filter.width, maxWidth: filter.width }}>
                                    <Autocomplete
                                        size="small"
                                        fullWidth
                                        value={filter.key === 'assignee' ? filter.value : (filter.value || null)}
                                        onChange={(event, newValue) => {
                                            if (filter.key === 'assignee') {
                                                filter.onChange(newValue);
                                            } else {
                                                filter.onChange(newValue || '');
                                            }
                                        }}
                                        options={filter.key === 'assignee' ? filter.options : ['', ...filter.options]}
                                        getOptionLabel={filter.getOptionLabel || ((option) => option === '' ? 'All' : option)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={filter.placeholder || `Select ${filter.label}`}
                                                {...commonTextFieldProps}
                                            />
                                        )}
                                    />
                                </Box>
                            ));
                        })()}

                        {/* Assignee Filter - Only show on desktop and not in project mode */}
                        {!isLaptop && !isProjectMode && (
                            <Box sx={{ minWidth: 180, maxWidth: 180 }}>
                                <Autocomplete
                                    size="small"
                                    fullWidth
                                    value={uniqueAssignees.find(a => a.id === assigneeFilter) || null}
                                    onChange={(event, newValue) => setAssigneeFilter(newValue?.id || '')}
                                    options={[{ id: '', name: 'All' }, ...uniqueAssignees]}
                                    getOptionLabel={(option) => option?.name || ''}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Select Assignee"
                                            {...commonTextFieldProps}
                                        />
                                    )}
                                />
                            </Box>
                        )}

                        {/* Clear Filters Button */}
                        {activeFiltersCount > 0 && (
                            <Box sx={{ alignSelf: 'end' }}>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={clearAllFilters}
                                    className="varientTextBtn"
                                >
                                    Clear All
                                </Button>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                        {/* Task Type Toggle Switch */}
                        <CustomSwitch
                            checked={showMinorTasks}
                            onChange={handleTaskTypeToggle}
                            label={showMinorTasks ? "Minor+Major" : "Major"}
                            color="#7367f0"
                        />
                        {/* Table View Toggle Switch */}
                        <ToggleButtonGroup
                            value={isTreeView ? 'tree' : 'table'}
                            exclusive
                            onChange={handleTableViewToggle}
                            size="small"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    minWidth: '40px',
                                    border: '1px solid #e0e0e0',
                                    '&.Mui-selected': {
                                        backgroundColor: '#7367f0',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: '#7367f0',
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="table" title="Major Tasks Only">
                                <StretchHorizontal size={20} />
                            </ToggleButton>
                            <ToggleButton value="tree" title="Major + Minor Tasks">
                                <ListTree size={20} />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <IconButton
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            title="Toggle Fullscreen"
                            className="docs-icon secondaryBtnClassname"
                            sx={{ mr: 1 }}
                        >
                            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                        <IconButton
                            onClick={onClose}
                            title="Close"
                            className="docs-icon secondaryBtnClassname"
                            sx={{ mr: 1 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Stack>
            </DialogTitle>

            {/* Content */}
            <DialogContent
                sx={{
                    p: 0,
                    overflowY: 'auto',
                }}
            >
                {employee ? (
                    <>
                        {isTreeView ? (
                            <HierarchicalTaskTreeTable
                                tasks={filteredTasks}
                                priorityColors={priorityColors}
                                handlePriorityChange={handlePriorityChange}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                showMinorTasks={showMinorTasks}
                                onHierarchicalCountChange={setHierarchicalTasksCount}
                            />
                        ) : (
                            <TaskTable
                                tasks={filteredTasks}
                                priorityColors={priorityColors}
                                handlePriorityChange={handlePriorityChange}
                                page={page}
                                rowsPerPage={rowsPerPage}
                                excludeMinorTasks={showMinorTasks}
                            />
                        )}
                        <Box sx={{ padding: '0px 10px' }}>
                            {totalTasksCount !== 0 && (
                                <TablePaginationFooter
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    totalCount={totalTasksCount}
                                    totalPages={totalPages}
                                    onPageChange={handleChangePage}
                                    onPageSizeChange={handleChangeRowsPerPage}
                                />
                            )}
                        </Box>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsModal;

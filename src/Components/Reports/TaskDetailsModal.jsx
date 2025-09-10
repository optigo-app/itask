import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Typography,
    IconButton,
    Paper,
    Box,
    TextField,
    Stack,
    AvatarGroup,
    Autocomplete,
    Button
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import { cleanDate, commonTextFieldProps, formatDate2, statusColors } from "../../Utils/globalfun";
import TablePaginationFooter from "../ShortcutsComponent/Pagination/TablePaginationFooter";
import ProfileImageMenu from "../ShortcutsComponent/ProfileImageMenu";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";

const TaskDetailsModal = ({
    open,
    onClose,
    employee,
}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('');

    // Priority colors for PriorityBadge
    const priorityColors = {
        high: { color: '#d32f2f', backgroundColor: '#ffebee' },
        medium: { color: '#f57c00', backgroundColor: '#fff3e0' },
        low: { color: '#388e3c', backgroundColor: '#e8f5e8' },
        urgent: { color: '#7b1fa2', backgroundColor: '#f3e5f5' }
    };

    const handlePriorityChange = (task, newPriority) => {
        console.log('Priority changed for task:', task.id, 'to:', newPriority);
    };

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

    const totalPages = Math?.ceil(filteredTasks && filteredTasks?.length / rowsPerPage);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredTasks.slice(start, end);
    }, [filteredTasks, page, rowsPerPage]);

    const renderAssignees = (assignees) => (
        <AvatarGroup
            max={6}
            spacing={2}
            sx={{
                flexDirection: 'row',
                '& .MuiAvatar-root': {
                    border: 'none',
                },
            }}
        >
            {assignees?.map((assignee, idx) => (
                <ProfileImageMenu
                    key={assignee?.id || idx}
                    profile={assignee}
                    allAssignees={assignees}
                    size={30}
                    fontSize="1rem"
                    showTooltip={true}
                />
            ))}
        </AvatarGroup>
    );

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

                        {/* Dynamic Filter Dropdowns */}
                        {[
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
                        ].map((filter) => (
                            <Box key={filter.key} sx={{ minWidth: filter.width, maxWidth: filter.width }}>
                                <Autocomplete
                                    size="small"
                                    fullWidth
                                    value={filter.value || null}
                                    onChange={(event, newValue) => filter.onChange(newValue || '')}
                                    options={['', ...filter.options]}
                                    getOptionLabel={(option) => option === '' ? 'All' : option}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder={`Select ${filter.label}`}
                                            {...commonTextFieldProps}
                                        />
                                    )}
                                />
                            </Box>
                        ))}

                        {/* Assignee Filter */}
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

                    <Box>
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
                    <TableContainer component={Paper} className="muiTableTaContainer">
                        <Table className="muiTable" aria-label="task table">
                            <TableHead className="muiTableHead">
                                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                                    <TableCell width={20} sx={{ fontWeight: 600 }}>Sr#</TableCell>
                                    <TableCell width={280} sx={{ fontWeight: 600 }}>Task Name</TableCell>
                                    <TableCell width={300} sx={{ fontWeight: 600 }}>Project/Module</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Assignee</TableCell>
                                    <TableCell width={80} sx={{ fontWeight: 600 }}>Priority</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Deadline</TableCell>
                                    <TableCell width={80} sx={{ fontWeight: 600 }}>Estimate (hrs)</TableCell>
                                    <TableCell width={80} sx={{ fontWeight: 600 }}>Working (hrs)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTasks?.length > 0 ? (
                                    paginatedTasks?.map((task, index) => {
                                        const statusColor = statusColors[task.status?.toLowerCase()] || { color: '#666', backgroundColor: '#f5f5f5' };
                                        return (
                                            <TableRow key={task.id || index} hover>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                            {task.taskname}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {task.status && (
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        px: 0.8,
                                                                        py: 0.2,
                                                                        borderRadius: '8px',
                                                                        backgroundColor: statusColor.backgroundColor,
                                                                        color: statusColor.color,
                                                                        fontSize: '0.65rem',
                                                                        fontWeight: 400,
                                                                        textTransform: 'capitalize'
                                                                    }}
                                                                >
                                                                    {task.status}
                                                                </Box>
                                                            )}
                                                            {task.category && (
                                                                <Box
                                                                    sx={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        px: 0.8,
                                                                        py: 0.2,
                                                                        borderRadius: '8px',
                                                                        backgroundColor: '#e3f2fd',
                                                                        color: '#1976d2',
                                                                        fontSize: '0.65rem',
                                                                        fontWeight: 400,
                                                                        textTransform: 'capitalize'
                                                                    }}
                                                                >
                                                                    {task.category}
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{task.taskPr}/{task.moduleName}</TableCell>
                                                <TableCell>{renderAssignees(task.assignee)}</TableCell>
                                                <TableCell>
                                                    <PriorityBadge
                                                        task={task}
                                                        priorityColors={priorityColors}
                                                        onPriorityChange={handlePriorityChange}
                                                        fontSize="12px"
                                                        padding="0.15rem 0.6rem"
                                                        minWidth="60px"
                                                        disable={true}
                                                    />
                                                </TableCell>
                                                <TableCell><Typography variant="body2">{task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                                    ? formatDate2(cleanDate(task?.DeadLineDate))
                                                    : '-'}</Typography></TableCell>
                                                <TableCell>{task.estimate_hrs}</TableCell>
                                                <TableCell>{task.workinghr}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No matching tasks found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <Box sx={{ padding: '0px 10px' }}>
                            {filteredTasks?.length !== 0 && (
                                <TablePaginationFooter
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    totalCount={filteredTasks?.length}
                                    totalPages={totalPages}
                                    onPageChange={handleChangePage}
                                    onPageSizeChange={handleChangeRowsPerPage}
                                />
                            )}
                        </Box>
                    </TableContainer>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsModal;

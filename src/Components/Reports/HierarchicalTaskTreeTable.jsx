import React, { useMemo, useState, useCallback, memo } from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Typography,
    Paper,
    Box,
    AvatarGroup,
    IconButton,
    Collapse
} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { cleanDate, formatDate2, statusColors } from "../../Utils/globalfun";
import ProfileImageMenu from "../ShortcutsComponent/ProfileImageMenu";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";

const HierarchicalTaskTreeTable = memo(({
    tasks = [],
    priorityColors,
    handlePriorityChange,
    page,
    rowsPerPage,
    showMinorTasks = false,
    onHierarchicalCountChange
}) => {
    const [expandedTasks, setExpandedTasks] = useState({});

    console.log("oidjisjdjs", tasks)

    // Group tasks into hierarchical structure
    const hierarchicalTasks = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];

        const majorTasks = [];
        const minorTasks = [];
        const usedMinorTaskIds = new Set();

        // Separate major and minor tasks                
        tasks.forEach(task => {
            const taskType = (task.type || '').toLowerCase();
            if (taskType === 'major') {
                majorTasks.push(task);
            } else if (taskType === 'minor') {
                minorTasks.push(task);
            }
        });

        console.log('Major tasks:', majorTasks.length);
        console.log('Minor tasks:', minorTasks.length);
        console.log('showMinorTasks:', showMinorTasks);

        // Group minor tasks under their major parents
        const taskHierarchy = [];

        majorTasks.forEach(majorTask => {
            // First try to find by parentid (direct parent-child relationship)
            let relatedMinorTasks = minorTasks.filter(minorTask =>
                !usedMinorTaskIds.has(minorTask.taskid) &&
                minorTask.parentid === majorTask.taskid
            );

            // If no direct children found, try by moduleid (same module relationship)
            if (relatedMinorTasks.length === 0) {
                relatedMinorTasks = minorTasks.filter(minorTask =>
                    !usedMinorTaskIds.has(minorTask.taskid) &&
                    minorTask.moduleid === majorTask.moduleid &&
                    minorTask.taskid !== majorTask.taskid // Don't include self
                );
            }

            // Mark these minor tasks as used
            relatedMinorTasks.forEach(task => {
                usedMinorTaskIds.add(task.taskid);
            });

            console.log(`Major task ${majorTask.taskname} has ${relatedMinorTasks.length} children`);

            taskHierarchy.push({
                ...majorTask,
                isParent: true,
                children: relatedMinorTasks,
                hasChildren: relatedMinorTasks.length > 0
            });
        });

        // Find standalone minor tasks (those not used by any major task)
        const standaloneMinorTasks = minorTasks
            .filter(minorTask => !usedMinorTaskIds.has(minorTask.taskid))
            .map(minorTask => ({
                ...minorTask,
                isParent: false,
                children: [],
                hasChildren: false
            }));

        console.log('Standalone minor tasks:', standaloneMinorTasks.length);

        // When showMinorTasks is false, only show major tasks (no standalone minor tasks)
        // When showMinorTasks is true, show major tasks + standalone minor tasks
        const finalHierarchy = showMinorTasks ?
            [...taskHierarchy, ...standaloneMinorTasks] :
            taskHierarchy;

        console.log('Final hierarchy length:', finalHierarchy.length);

        // Notify parent component of the count change
        if (onHierarchicalCountChange) {
            onHierarchicalCountChange(finalHierarchy.length);
        }

        return finalHierarchy;
    }, [tasks, showMinorTasks]);

    // Pagination
    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return hierarchicalTasks.slice(start, end);
    }, [hierarchicalTasks, page, rowsPerPage]);

    const toggleSubtasks = useCallback((taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    }, []);

    const renderAssignees = useCallback((assignees) => (
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
    ), []);

    const renderTaskRow = useCallback((task, index, isChild = false, depth = 0) => {
        const statusColor = statusColors[task.status?.toLowerCase()] || { color: '#666', backgroundColor: '#f5f5f5' };
        const isExpanded = expandedTasks[task.taskid];
        const indentLevel = isChild ? depth + 1 : 0;
        const paddingLeft = indentLevel * 24; // 24px per level

        return (
            <React.Fragment key={task.taskid || `task-${index}`}>
                <TableRow
                    hover
                    sx={{
                        backgroundColor: isChild ? '#fafafa' : 'inherit',
                        '& td': {
                            borderBottom: isChild ? '1px solid #e8e8e8' : '1px solid #ddd',
                            py: isChild ? 1 : 1.5
                        }
                    }}
                >
                    <TableCell>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            pl: `${paddingLeft}px`,
                            minHeight: '40px'
                        }}>
                            {/* Toggle button for tasks with children */}
                            {task.hasChildren && !isChild && (
                                <IconButton
                                    size="small"
                                    onClick={() => toggleSubtasks(task.taskid)}
                                    sx={{
                                        p: 0.5,
                                        mr: 0.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(115, 103, 240, 0.1)'
                                        }
                                    }}
                                >
                                    <PlayArrowIcon
                                        sx={{
                                            fontSize: "1.1rem",
                                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                            transition: "transform 0.2s ease-in-out",
                                            color: isExpanded ? "#7367f0" : "#9e9e9e"
                                        }}
                                    />
                                </IconButton>
                            )}

                            {/* Task name and details */}
                            <Box sx={{ flex: 1 }}>
                                {/* Project/Module info at top */}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '12px !important',
                                        color: '#666',
                                        mb: 0.2,
                                        display: 'block',
                                        opacity: 0.7
                                    }}
                                >
                                    {task.taskPr}/{task.moduleName}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: isChild ? 400 : 500,
                                        mb: 0.5,
                                        fontSize: isChild ? '0.875rem' : '0.9rem',
                                        color: isChild ? '#666' : '#333'
                                    }}
                                >
                                    {task.taskname}
                                    {task.hasChildren && (
                                        <span className="task-sub_count">
                                            {task.children.length}
                                        </span>
                                    )}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {task.type && (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 0.5,
                                                py: 0.1,
                                                borderRadius: '6px',
                                                backgroundColor: task.type.toLowerCase() === 'major' ? '#e8f5e9' : '#ffeddc',
                                                color: task.type.toLowerCase() === 'major' ? '#2e7d32' : '#f57c00',
                                                fontSize: '0.6rem',
                                                fontWeight: 400,
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {task.type}
                                        </Box>
                                    )}
                                    {task.category && (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 0.5,
                                                py: 0.1,
                                                borderRadius: '6px',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                fontSize: '0.6rem',
                                                fontWeight: 400,
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {task.category}
                                        </Box>
                                    )}
                                    {/* {task.hasChildren && (
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                px: 0.6,
                                                py: 0.1,
                                                borderRadius: '6px',
                                                backgroundColor: '#f3e5f5',
                                                color: '#7b1fa2',
                                                fontSize: '0.6rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            {task.children.length} subtasks
                                        </Box>
                                    )} */}
                                </Box>
                            </Box>
                        </Box>
                    </TableCell>
                    <TableCell>{renderAssignees(task.assignee)}</TableCell>
                    <TableCell>
                        <StatusBadge
                            task={task}
                            statusColors={statusColors}
                            onStatusChange={() => {}}
                            fontSize="12px"
                            padding="0.15rem 0.6rem"
                            minWidth="60px"
                            disable={true}
                        />
                    </TableCell>
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
                    <TableCell>
                        <Typography variant="body2">
                            {task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                ? formatDate2(cleanDate(task?.DeadLineDate))
                                : '-'}
                        </Typography>
                    </TableCell>
                    <TableCell>{task.estimate_hrs}</TableCell>
                    <TableCell>{task.workinghr}</TableCell>
                </TableRow>

                {/* Render child tasks when expanded and showMinorTasks is true */}
                {task.hasChildren && showMinorTasks && isExpanded &&
                    task.children?.map((childTask, childIndex) =>
                        renderTaskRow(childTask, childIndex, true, depth + 1)
                    )
                }
            </React.Fragment>
        );
    }, [expandedTasks, toggleSubtasks, renderAssignees, priorityColors, handlePriorityChange, showMinorTasks]);

    return (
        <Box>
            <TableContainer component={Paper} className="muiTableTaContainer">
                <Table className="muiTable" aria-label="hierarchical task table">
                    <TableHead className="muiTableHead">
                        <TableRow sx={{ backgroundColor: "#fafafa" }}>
                            <TableCell width={320} sx={{ fontWeight: 600 }}>Task Name</TableCell>
                            <TableCell width={100} sx={{ fontWeight: 600 }}>Assignee</TableCell>
                            <TableCell width={80} sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell width={80} sx={{ fontWeight: 600 }}>Priority</TableCell>
                            <TableCell width={100} sx={{ fontWeight: 600 }}>Deadline</TableCell>
                            <TableCell width={80} sx={{ fontWeight: 600 }}>Estimate (hrs)</TableCell>
                            <TableCell width={80} sx={{ fontWeight: 600 }}>Working (hrs)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTasks?.length > 0 ? (
                            paginatedTasks?.map((task, index) => renderTaskRow(task, index))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No matching tasks found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
});

export default HierarchicalTaskTreeTable;

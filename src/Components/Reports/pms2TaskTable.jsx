import { useMemo, memo } from "react";
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Typography,
    Paper,
    Box
} from "@mui/material";
import { cleanDate, formatDate2, statusColors } from "../../Utils/globalfun";
import AssigneeAvatarGroup from "../ShortcutsComponent/Assignee/AssigneeAvatarGroup";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";

const TaskTable = memo(({
    tasks = [],
    priorityColors,
    handlePriorityChange,
    page,
    rowsPerPage,
    excludeMinorTasks
}) => {
    const filteredTasks = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];
        if (excludeMinorTasks) {
            return tasks?.filter(task => {
                const taskType = (task.type || '').toLowerCase();
                return taskType === 'major' || taskType === 'minor';
            });
        } else {
            return tasks?.filter(task => {
                const taskType = (task.type || '').toLowerCase();
                return taskType === 'major';
            });
        }
    }, [tasks, excludeMinorTasks]);

    const paginatedTasks = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredTasks.slice(start, end);
    }, [filteredTasks, page, rowsPerPage]);


    const renderAssignees = (assignees, task) => (
        <AssigneeAvatarGroup
            assignees={assignees}
            task={task}
            maxVisible={4}
            size={40}
            spacing={0}
        />
    );

    const renderTaskRow = (task, index) => {

        return (
            <TableRow key={task.taskid || `task-${index}`} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                    <Box>
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
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {task.taskname}
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
                                        backgroundColor: task.type.toLowerCase() === 'major' ? '#e8f5e9' : '#fff3e0',
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
                        </Box>
                    </Box>
                </TableCell>
                <TableCell>{renderAssignees(task.assignee, task)}</TableCell>
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
        );
    };

    return (
        <Box>
            <TableContainer component={Paper} className="muiTableTaContainer">
                <Table className="muiTable" aria-label="task table">
                    <TableHead className="muiTableHead">
                        <TableRow sx={{ backgroundColor: "#fafafa" }}>
                            <TableCell width={40} sx={{ fontWeight: 600 }}>S.No</TableCell>
                            <TableCell width={280} sx={{ fontWeight: 600 }}>Task Name</TableCell>
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
                                <TableCell colSpan={8} align="center">
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

export default TaskTable;

import "./bugTask.scss";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const BUG_COLUMNS = [
    { label: 'Task Name', key: 'taskname', width: '20%' },
    { label: 'Task No', key: 'taskno', width: '10%' },
    { label: 'Assignee', key: 'assignee', width: '14%' },
    { label: 'View', key: 'view', width: '8%' },
    { label: 'Bug Status', key: 'bugStatus', width: '12%' },
    { label: 'Solved By', key: 'solvedBy', width: '14%' },
    { label: 'Upload', key: 'upload', width: '8%' },
    { label: 'Priority', key: 'priority', width: '8%' },
    { label: 'Recheck Status', key: 'recheckStatus', width: '12%' },
    { label: 'Date', key: 'date', width: '10%' },
];

const DUMMY_BUGS = [
    {
        id: 1,
        taskname: 'Login page validation issue',
        taskno: 'BUG-001',
        assignee: 'John Doe',
        bugStatus: 'Open',
        solvedBy: '-',
        priority: 'High',
        uploadVersion: "R74",
        recheckStatus: 'Pending',
        date: '2025-12-03',
    },
    {
        id: 2,
        taskname: 'Dashboard graph not loading',
        taskno: 'BUG-002',
        assignee: 'Jane Smith',
        bugStatus: 'In Progress',
        solvedBy: '-',
        priority: 'Medium',
        uploadVersion: "R75",
        recheckStatus: 'Pending',
        date: '2025-12-02',
    },
    {
        id: 3,
        taskname: 'Email notification duplicated',
        taskno: 'BUG-003',
        assignee: 'Alex Johnson',
        bugStatus: 'Resolved',
        solvedBy: 'Alex Johnson',
        priority: 'Low',
        uploadVersion: "R76",
        recheckStatus: 'Recheck Pending',
        date: '2025-12-01',
    },
];

const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'open':
            return 'error';
        case 'in progress':
            return 'warning';
        case 'resolved':
        case 'closed':
            return 'success';
        default:
            return 'default';
    }
};

const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
        case 'high':
            return 'error';
        case 'medium':
            return 'warning';
        case 'low':
            return 'success';
        default:
            return 'default';
    }
};

const BugTask = () => {
    return (
        <Box>
            <TableContainer component={Paper} className="muiTableTaContainer">
                <Table aria-label="bug task table" className="muiTable">
                    <TableHead className="muiTableHead">
                        <TableRow>
                            {BUG_COLUMNS.map(({ label, key, width }) => (
                                <TableCell key={key} sx={{ width }}>
                                    <strong>{label}</strong>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {DUMMY_BUGS.map((bug) => (
                            <TableRow key={bug.id} hover>
                                <TableCell>{bug.taskname}</TableCell>
                                <TableCell>{bug.taskno}</TableCell>
                                <TableCell>{bug.assignee}</TableCell>
                                <TableCell>
                                    <IconButton size="small" color="primary">
                                        <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={bug.bugStatus}
                                        size="small"
                                        color={getStatusColor(bug.bugStatus)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{bug.solvedBy}</TableCell>
                                <TableCell>
                                    {bug.uploadVersion}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={bug.priority}
                                        size="small"
                                        color={getPriorityColor(bug.priority)}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>{bug.recheckStatus}</TableCell>
                                <TableCell>{bug.date}</TableCell>
                            </TableRow>
                        ))}
                        {DUMMY_BUGS.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={BUG_COLUMNS.length} align="center">
                                    No bugs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BugTask;
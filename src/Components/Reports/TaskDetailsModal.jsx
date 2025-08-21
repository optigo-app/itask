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
    Tooltip,
    Avatar
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import { background, cleanDate, commonTextFieldProps, formatDate2, ImageUrl } from "../../Utils/globalfun";
import TablePaginationFooter from "../ShortcutsComponent/Pagination/TablePaginationFooter";

const TaskDetailsModal = ({
    open,
    onClose,
    employee,
}) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredTasks = useMemo(() => {
        if (!employee?.Tasks) return [];
        if (!searchText.trim()) return employee.Tasks;

        const lowerSearch = searchText.toLowerCase();
        return employee.Tasks.filter(task =>
            Object.values(task).some(val =>
                val?.toString().toLowerCase().includes(lowerSearch)
            )
        );
    }, [employee, searchText]);

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
                    width: 25,
                    height: 25,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.2)',
                        zIndex: 10,
                    },
                },
            }}
        >
            {assignees?.map((assignee, idx) => (
                <Tooltip
                    key={assignee?.id || idx}
                    title={`${assignee?.firstname} ${assignee?.lastname}`}
                    arrow
                    classes={{ tooltip: 'custom-tooltip' }}
                >
                    <Avatar
                        alt={`${assignee?.firstname} ${assignee?.lastname}`}
                        src={ImageUrl(assignee) || undefined}
                        sx={{
                            backgroundColor: background(`${assignee?.firstname} ${assignee?.lastname}`),
                        }}
                    >
                        {!assignee.avatar && assignee?.firstname?.charAt(0)}
                    </Avatar>
                </Tooltip>
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

                    <Box>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Search tasks..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ minWidth: 250 }}
                            {...commonTextFieldProps}
                        />
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
                        <IconButton onClick={onClose} size="small">
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
                                    <TableCell width={250} sx={{ fontWeight: 600 }}>Task Name</TableCell>
                                    <TableCell width={250} sx={{ fontWeight: 600 }}>Project/Module</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Assignee</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Priority</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Deadline</TableCell>
                                    <TableCell width={100} sx={{ fontWeight: 600 }}>Category</TableCell>
                                    <TableCell width={80} sx={{ fontWeight: 600 }}>Estimate (hrs)</TableCell>
                                    <TableCell width={80} sx={{ fontWeight: 600 }}>Working (hrs)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedTasks?.length > 0 ? (
                                    paginatedTasks?.map((task, index) => (
                                        <TableRow key={task.id || index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{task.taskname}</TableCell>
                                            <TableCell>{task.taskPr}/{task.moduleName}</TableCell>
                                            <TableCell>{renderAssignees(task.assignee)}</TableCell>
                                            <TableCell><Typography variant="body2">{task.status}</Typography></TableCell>
                                            <TableCell><Typography variant="body2">{task.priority}</Typography></TableCell>
                                            <TableCell><Typography variant="body2">{task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                                ? formatDate2(cleanDate(task?.DeadLineDate))
                                                : '-'}</Typography></TableCell>
                                            <TableCell><Typography variant="body2">{task.category}</Typography></TableCell>
                                            <TableCell>{task.estimate_hrs}</TableCell>
                                            <TableCell>{task.estimate1_hrsT}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
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

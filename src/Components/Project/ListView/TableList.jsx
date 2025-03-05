import React, { useState } from "react";
import "./projectTable.scss";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Box,
    Typography,
    Pagination,
    LinearProgress,
    IconButton,
    Tooltip,
} from "@mui/material";

import "react-resizable/css/styles.css";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { formatDate2, getStatusColor } from "../../../Utils/globalfun";
import { Eye, Lock, LockOpen, Unlock } from "lucide-react";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";

const TableView = ({ data, isLoading, handleLockProject }) => {
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    const [selectedRowData, setSelectedRowData] = useState({});
    console.log('selectedRowData: ', selectedRowData);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths] = useState({
        'project / module': 350,
        progress: 150,
        'start date': 100,
        'due date': 100,
        priority: 100,
        summary: 200,
        // actions: 100,
    });

    const priorityColors = {
        Low: {
            color: "#4caf50",
            backgroundColor: "#e8f5e9",
        },
        Medium: {
            color: "#ff9800",
            backgroundColor: "#fff3e0",
        },
        High: {
            color: "#f44336",
            backgroundColor: "#ffebee",
        },
        Urgent: {
            color: "#d32f2f",
            backgroundColor: "#ffcccb",
        },
        Critical: {
            color: "#ffffff",
            backgroundColor: "#b71c1c",
        },
    };

    const handleOpenCnfDialog = (task) => {
        setSelectedRowData(task);
        setCnfDialogOpen(true);
    };

    const handleCloseCnfDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleCnfPrlUnl = async () => {
        setCnfDialogOpen(false);
        handleLockProject(selectedRowData?.taskid);
    };

    const handleRequestSort = (property) => {
        const fieldMapping = {
            name: 'taskname',
            due: 'DeadLineDate',
        };
        const mappedProperty = fieldMapping[property] || property;
        const isAscending = orderBy === mappedProperty && order === "asc";
        setOrder(isAscending ? "desc" : "asc");
        setOrderBy(mappedProperty);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) return -1;
        if (b[orderBy] > a[orderBy]) return 1;
        return 0;
    };

    const getComparator = (order, orderBy) => {
        return order === "desc"
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const sortData = (array, comparator) => {
        return [...array]?.sort(comparator);
    };

    let sortedData;
    if (data) {
        sortedData = sortData(data, getComparator(order, orderBy));
    }

    // for data logic or data manipulation
    // Calculate total pages
    const totalPages = Math?.ceil(data && data?.length / rowsPerPage);

    // Get data for the current page
    const currentData = sortedData?.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleNavigate = (task) => {
        let urlData = {
            taskname: task?.taskname,
            module: task.module,
            taskid: task?.taskid,
        }

        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        const formattedTaskName = task?.taskname?.trim().replace(/\s+/g, '-') || '';
        const url = `/tasks/${formattedTaskName}?data=${encodedFormData}`;
        window.open(url, '_blank');
    };

    const LockButton = ({ isLocked, onClick }) => {
        const Icon = isLocked ? Lock : Unlock;
        const label = isLocked ? 'Lock' : 'Unlock';

        return (
            <Tooltip
                placement="right"
                title={`${label} Project`}
                classes={{ tooltip: 'custom-tooltip' }}
            >
                <IconButton
                    id={`pr${label}`}
                    aria-label={`pr${label}`}
                    onClick={onClick}
                    sx={{
                        color: isLocked ? '#ffffff' : '#7d7f85',
                        backgroundColor: isLocked ? '#f44336' : 'transparent',
                        '&:hover': {
                            backgroundColor: isLocked ? '#d32f2f' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    <Icon size={20} color={isLocked ? "#fff" : "#7d7f85"} />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <>
            {(isLoading === null || isLoading || (!data && isLoading !== false)) ? (
                <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
            ) :
                <TableContainer
                    component={Paper}
                    sx={{
                        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                        borderRadius: "8px",

                    }}
                    className="ProjectTVMain"
                >

                    <Table size="small" aria-label="task details"
                    >
                        <TableHead>
                            <TableRow>
                                {Object.keys(columnWidths).map((key) => (
                                    <TableCell key={key}
                                        sx={{
                                            width: columnWidths[key],
                                            maxWidth: columnWidths[key],
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <TableSortLabel
                                                active={orderBy === key}
                                                direction={order}
                                                onClick={() => handleRequestSort(key)}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </TableSortLabel>
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.length != 0 ? (
                                <>
                                    {currentData?.map((task, taskIndex) => (
                                        <React.Fragment key={taskIndex}>
                                            <TableRow
                                            // sx={{
                                            //     backgroundColor: task?.isLocked === 1 ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
                                            //     '&:hover': {
                                            //         backgroundColor: task?.isLocked === 1 ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                            //     },
                                            // }}
                                            >
                                                <TableCell>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <a
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (!task?.isLocked) {
                                                                        handleNavigate(task);
                                                                    }
                                                                }}
                                                            // style={{
                                                            //     pointerEvents: task?.isLocked === 1 ? 'none' : 'auto',
                                                            //     color: task?.isLocked === 1 ? 'rgba(0, 0, 0, 0.38)' : '#2900ee',
                                                            //     textDecoration: task?.isLocked === 1 ? 'none' : "underline",
                                                            //     cursor: task?.isLocked === 1 ? 'default' : 'pointer'
                                                            // }}
                                                            >
                                                                {task?.taskname}/{task?.module}
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <span className="prShDesc">{task?.short_description}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                                        <Box width="100%" position="relative">
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={task?.progress}
                                                                sx={{
                                                                    height: 7,
                                                                    borderRadius: 5,
                                                                    backgroundColor: "#e0e0e0",
                                                                    "& .MuiLinearProgress-bar": {
                                                                        backgroundColor: getStatusColor(task?.progress),
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" minWidth={100}>
                                                            {`${task?.progress}%`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{task?.StartDate ? formatDate2(task.StartDate) : '-'}</TableCell>
                                                <TableCell>{task?.DeadLineDate ? formatDate2(task.DeadLineDate) : '-'}</TableCell>
                                                <TableCell>
                                                    <div style={{
                                                        color: priorityColors[task?.priority]?.color,
                                                        backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                                                        width: 'fit-content',
                                                        padding: '0.2rem 0.8rem',
                                                        borderRadius: '5px',
                                                        textAlign: 'center',
                                                        fontSize: '13.5px',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        {task?.priority}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{task?.remark}</TableCell>
                                                {/* <TableCell>
                                                    <LockButton
                                                        isLocked={task?.isLocked === 1}
                                                        onClick={() => handleOpenCnfDialog(task)}
                                                        id={task?.taskid}
                                                    />
                                                </TableCell> */}
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </>
                            ) :
                                <TableRow>
                                    <TableCell colSpan={7} >
                                        <Typography variant="body2">No Project/Module found.</Typography>
                                    </TableCell>
                                </TableRow>
                            }

                            {!isLoading &&
                                <TableRow>
                                    <TableCell colSpan={7} >
                                        {currentData?.length !== 0 && (
                                            <Box className="TablePaginationBox">
                                                <Typography className="paginationText">
                                                    Showing {(page - 1) * rowsPerPage + 1} to{' '}
                                                    {Math.min(page * rowsPerPage, data?.length)} of {data?.length} entries
                                                </Typography>
                                                {totalPages > 0 && (
                                                    <Pagination
                                                        count={totalPages}
                                                        page={page}
                                                        onChange={handleChangePage}
                                                        color="primary"
                                                        variant="outlined"
                                                        shape="rounded"
                                                        siblingCount={1}
                                                        boundaryCount={1}
                                                        className="pagination"
                                                    />
                                                )}
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
            }
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseCnfDialog}
                onConfirm={handleCnfPrlUnl}
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel={selectedRowData?.isLocked === 1 ? "Unlock" : "Lock"}
                content={selectedRowData?.isLocked === 1 ? 'Are you sure you want to unlock this project?' : 'Are you sure you want to lock this project?'}
            />
        </>
    );
};

export default TableView;

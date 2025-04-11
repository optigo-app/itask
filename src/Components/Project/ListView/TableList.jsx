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
import { cleanDate, convertWordsToSpecialChars, formatDate2, getStatusColor, priorityColors } from "../../../Utils/globalfun";
import { Eye, Lock, LockOpen, Pencil, Trash, Unlock } from "lucide-react";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";

const TableView = ({ data, isLoading, handleLockProject, handleDeleteModule }) => {
    console.log('dddprDdata: ', data);
    const navigate = useNavigate();
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState({});
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const setActionMode = useSetRecoilState(taskActionMode);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const setFormDataValue = useSetRecoilState(formData);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const [cnfDelDialogOpen, setCnfDelDialogOpen] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths] = useState({
        'Project/module': 350,
        'progress': 180,
        'start date': 100,
        'deadline': 100,
        'priority': 100,
        'actions': 80,
    });

    const handleOpenCnfDialog = (task) => {
        setSelectedRow(task);
        setCnfDialogOpen(true);
    };

    const handleViewPrDashboard = () => {
        navigate('/projects/dashboard');
    }

    const handleCloseCnfDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleCloseCnfDelDialog = () => {
        setCnfDelDialogOpen(false);
    };

    const handleCnfPrlUnl = async () => {
        setCnfDialogOpen(false);
        handleLockProject(selectedRow?.taskid);
    };

    const handleRemovePr = async () => {
        setCnfDelDialogOpen(false);
        handleDeleteModule(selectedRow?.taskid);
    };

    const handleEditProject = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setActionMode("edit");
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(task);
    };

    const handleDeleteProject = async (task, additionalInfo) => {
        setCnfDelDialogOpen(true);
        setRootSubroot(additionalInfo);
        setActionMode("delete");
        setSelectedRow(task);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
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

    const descendingComparator = (a, b, orderBy) => {
        console.log('orderBy: ', orderBy);
        const fieldMapping = {
            deadline: 'DeadLineDate',
            due: 'DeadLineDate',
            "Project/module": 'taskname',
            "start date": 'StartDate',
        };

        const mappedField = fieldMapping[orderBy] || orderBy;
        console.log('mappedField: ', mappedField);
        let aValue = a[mappedField];
        let bValue = b[mappedField];

        // Convert to Date if it's a deadline
        if (mappedField === 'DeadLineDate') {
            aValue = aValue ? new Date(aValue) : new Date('2100-01-01');
            bValue = bValue ? new Date(bValue) : new Date('2100-01-01');
        } else if (mappedField === 'start date') {
            aValue = aValue ? new Date(aValue) : new Date('2100-01-01');
            bValue = bValue ? new Date(bValue) : new Date('2100-01-01');
        } else if (mappedField === 'progress_per') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        } else if (mappedField === 'Project/module') {
            aValue = aValue?.toLowerCase();
            bValue = bValue?.toLowerCase();
        }


        if (bValue < aValue) return -1;
        if (bValue > aValue) return 1;
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
            module: task?.taskname,
            project: task.taskPr,
            taskid: task?.taskid,
            projectid: task?.projectid,
        }

        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        const formattedPrName = task?.taskPr?.trim()?.replace(/\s+/g, '-') || '';
        const formattedTaskName = task?.taskname?.trim()?.replace(/\s+/g, '-') || '';
        const url = `/tasks/${formattedPrName}/${formattedTaskName}?data=${encodedFormData}`;
        window.open(url, '_blank');
    };

    const LockButton = ({ isLocked, onClick }) => {
        const Icon = isLocked ? Lock : Unlock;
        const label = isLocked ? 'Lock' : 'Unlock';

        return (
            <Tooltip
                placement="top"
                title={`${label} Module`}
                classes={{ tooltip: 'custom-tooltip' }}
            >
                <IconButton
                    id={`pr${label}`}
                    aria-label={`pr${label}`}
                    onClick={onClick}
                    sx={{
                        color: isLocked ? '#ffffff' : '#7d7f85',
                        backgroundColor: isLocked ? '#7367f0' : 'transparent',
                        '&:hover': {
                            backgroundColor: isLocked ? '#7367f0' : 'rgba(0, 0, 0, 0.04)',
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
                                                active={key !== "actions" && orderBy === key}
                                                direction={order}
                                                onClick={() => {
                                                    if (key !== "actions") {
                                                        handleRequestSort(key);
                                                    }
                                                }}
                                                hideSortIcon={key === "actions"}
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
                                            <TableRow>
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
                                                            >
                                                                <span style={{ fontWeight: 'bold' }}>{task?.taskPr}</span>/<span style={{ fontWeight: 'bold', color: '#7d7f85' }}>{convertWordsToSpecialChars(task?.taskname)}</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <span className="prShDesc">{convertWordsToSpecialChars(task?.descr)}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                                        <Box width="100%" position="relative">
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={task?.progress_per}
                                                                sx={{
                                                                    height: 7,
                                                                    borderRadius: 5,
                                                                    backgroundColor: "#e0e0e0",
                                                                    "& .MuiLinearProgress-bar": {
                                                                        backgroundColor: getStatusColor(task?.progress_per),
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" minWidth={100}>
                                                            {`${task?.progress_per}%`}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {task?.StartDate && cleanDate(task?.StartDate)
                                                        ? formatDate2(cleanDate(task?.StartDate))
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {task?.DeadLineDate && cleanDate(task?.DeadLineDate)
                                                        ? formatDate2(cleanDate(task?.DeadLineDate))
                                                        : '-'}
                                                </TableCell>
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
                                                {/* <TableCell>{task?.remark}</TableCell> */}
                                                <TableCell>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}>
                                                        <LockButton
                                                            isLocked={task?.isFreez === 1}
                                                            onClick={() => handleOpenCnfDialog(task)}
                                                            id={task?.taskid}
                                                        />
                                                        <IconButton
                                                            onClick={handleViewPrDashboard}
                                                            sx={{
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.26)',
                                                                },
                                                            }}
                                                        >
                                                            <Eye
                                                                size={20}
                                                                color="#808080"
                                                            />
                                                        </IconButton>
                                                        <IconButton
                                                            disabled={task?.isFreez == 1}
                                                            onClick={() => handleEditProject(task, { Task: "root" })}
                                                            sx={{
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.26)',
                                                                },
                                                            }}
                                                        >
                                                            <Pencil
                                                                size={20}
                                                                color={task?.isFreez == 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                                                            />
                                                        </IconButton>
                                                        <IconButton
                                                            disabled={task?.isFreez == 1}
                                                            onClick={() => handleDeleteProject(task, { Task: "sub" })}
                                                            sx={{
                                                                '&.Mui-disabled': {
                                                                    color: 'rgba(0, 0, 0, 0.26)',
                                                                },
                                                            }}
                                                        >
                                                            <Trash
                                                                size={20}
                                                                color={task?.isFreez == 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                                                            />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                </>
                            ) :
                                <TableRow>
                                    <TableCell colSpan={7} >
                                        <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: '#7d7f85 !important' }}>No Project/Module found.</Typography>
                                    </TableCell>
                                </TableRow>
                            }

                            {!isLoading && data?.length != 0 &&
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
                confirmLabel={selectedRow?.isFreez == 1 ? "Unlock" : "Lock"}
                content={selectedRow?.isFreez == 1 ? 'Are you sure you want to unlock this project?' : 'Are you sure you want to lock this project?'}
            />
            <ConfirmationDialog
                open={cnfDelDialogOpen}
                onClose={handleCloseCnfDelDialog}
                onConfirm={handleRemovePr}
                title="Confirm"
                cancelLabel="Cancel"
                confirmLabel="Remove"
                content='Are you sure you want to Remove this project/module?'
            />
        </>
    );
};

export default TableView;

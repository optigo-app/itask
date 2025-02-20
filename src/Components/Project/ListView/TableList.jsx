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
} from "@mui/material";

import "react-resizable/css/styles.css";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { formatDate2, getStatusColor } from "../../../Utils/globalfun";
import { Eye } from "lucide-react";

const TableView = ({ data, isLoading }) => {
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths] = useState({
        'project / module': 350,
        progress: 150,
        'start date': 100,
        'due date': 100,
        priority: 100,
        summary: 200,
        actions: 100,
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
        console.log('task: ', task);
        let urlData = {
            taskname: task?.taskname,
            module: task.module,
            taskid: task?.taskid,
        }

        const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
        const formattedTaskName = task?.taskname?.trim().replace(/\s+/g, '-') || '';
        const url = `/tasks/${formattedTaskName}?data=${encodedFormData}`;
        console.log('url: ', url);
        window.open(url, '_blank');
    };

    return (
        <>
            <TableContainer
                component={Paper}
                sx={{
                    boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                    borderRadius: "8px",

                }}
                className="TaskTVMain"
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
                        {(isLoading == null || isLoading || !data) ? (
                            <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
                        ) :
                            <>
                                {data?.length != 0 ? (
                                    <>
                                        {currentData?.map((task, taskIndex) => (
                                            <React.Fragment key={taskIndex}>
                                                <TableRow>
                                                    <TableCell>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                            <div>
                                                                <a href="#" onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleNavigate(task)
                                                                }}>
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
                                                    <TableCell>
                                                        <IconButton
                                                            id="prView"
                                                            aria-label="prView"
                                                            aria-labelledby="prView"
                                                            style={{ color: "#7d7f85" }}
                                                        >
                                                            <Eye size={20} />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) :
                                    <TableRow>
                                        <TableCell colSpan={7} >
                                            <Typography variant="body2">No tasks found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </>
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
                                                    size="large"
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
        </>
    );
};

export default TableView;

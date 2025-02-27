import React, { useState } from "react";
import "./TaskTable.scss";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    TableSortLabel,
    TablePagination,
    Button,
    Box,
} from "@mui/material";
import {
    ArrowForwardIosSharp as ArrowForwardIosSharpIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { CircleChevronRight, GitMerge } from "lucide-react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const TableView = ({ data, onAddSubtask, isLoading }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [subtaskVisibility, setSubtaskVisibility] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [columnWidths, setColumnWidths] = useState({
        name: 200,
        status: 150,
        assignee: 150,
        due: 150,
        priority: 150,
        summary: 200,
        actions: 100,
    });

    const handleMenuOpen = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const toggleSubtasks = (taskIndex) => {
        setSubtaskVisibility((prev) => ({
            ...prev,
            [taskIndex]: !prev[taskIndex],
        }));
    };

    const handleRequestSort = (property) => {
        const isAscending = orderBy === property && order === "asc";
        setOrder(isAscending ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const addSubtask = (parentTask) => {
        onAddSubtask(parentTask);
        toggleSubtasks(parentTask);
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
        return [...array].sort(comparator);
    };

    const sortedData = sortData(data, getComparator(order, orderBy));

    const renderSubtasks = (subtasks, parentIndex) => {
        return subtasks?.map((subtask, subtaskIndex) => (
            <React.Fragment key={`${parentIndex}-${subtaskIndex}`}>
                <TableRow>
                    <TableCell style={{ paddingLeft: `${20 + 20 * (parentIndex.split('-').length)}px` }}>
                        <IconButton
                            aria-label="toggle-subtask"
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSubtasks(`${parentIndex}-${subtaskIndex}`);
                            }}
                        >
                            <CircleChevronRight
                                style={{
                                    color: "#7d7f85",
                                    fontSize: "1rem",
                                    transform: subtaskVisibility[`${parentIndex}-${subtaskIndex}`]
                                        ? "rotate(90deg)"
                                        : "rotate(0deg)",
                                    transition: "transform 0.2s ease-in-out",
                                }}
                            />
                        </IconButton>
                        {subtask?.name}
                    </TableCell>
                    <TableCell>{subtask?.status}</TableCell>
                    <TableCell>{subtask?.assignee}</TableCell>
                    <TableCell>{subtask?.due}</TableCell>
                    <TableCell>{subtask?.priority}</TableCell>
                    <TableCell>{subtask?.summary}</TableCell>
                    <TableCell>
                        <IconButton
                            aria-label="actions"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, subtask);
                            }}
                        >
                            <MoreVertIcon style={{ color: "#7d7f85" }} />
                        </IconButton>
                    </TableCell>
                </TableRow>
                {subtaskVisibility[`${parentIndex}-${subtaskIndex}`] &&
                    subtask?.subtasks?.length > 0 &&
                    renderSubtasks(subtask?.subtasks, `${parentIndex}-${subtaskIndex}`)}
            </React.Fragment>
        ));
    };

    const handleResize = (headerName, newWidth) => {
        setColumnWidths((prevWidths) => ({
            ...prevWidths,
            [headerName]: newWidth,
        }));
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
                <Table size="small" aria-label="task details">
                    <TableHead>
                        <TableRow>
                            {Object.keys(columnWidths).map((key) => (
                                <TableCell key={key}>
                                    {/* <ResizableBox
                                        width={columnWidths[key]}
                                        height={30}
                                        axis="x"
                                        resizeHandles={["e"]}
                                        onResizeStop={(e, data) =>
                                            handleResize(key, data.size.width)
                                        }
                                        minConstraints={[50, 30]}
                                        maxConstraints={[500, 30]}
                                    > */}
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <TableSortLabel
                                                active={orderBy === key}
                                                direction={order}
                                                onClick={() => handleRequestSort(key)}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </TableSortLabel>
                                        </Box>
                                    {/* </ResizableBox> */}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedData
                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            ?.map((task, taskIndex) => (
                                <React.Fragment key={taskIndex}>
                                    <TableRow>
                                        <TableCell>
                                            <IconButton
                                                aria-label="toggle-task"
                                                size="small"
                                                onClick={() => toggleSubtasks(taskIndex)}
                                            >
                                                <CircleChevronRight
                                                    style={{
                                                        color: "#7d7f85",
                                                        fontSize: "1rem",
                                                        transform: subtaskVisibility[taskIndex]
                                                            ? "rotate(90deg)"
                                                            : "rotate(0deg)",
                                                        transition: "transform 0.2s ease-in-out",
                                                    }}
                                                />
                                            </IconButton>
                                            {task?.name}
                                            {task?.subtasks?.length > 0 && (
                                                <>
                                                    <IconButton
                                                        aria-label="toggle-task"
                                                        size="small"
                                                        onClick={() => toggleSubtasks(taskIndex)}
                                                    >
                                                        <GitMerge
                                                            size={20}
                                                            color="#7367f0"
                                                        />
                                                    </IconButton>
                                                    {task?.subtasks?.length}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell>{task?.status}</TableCell>
                                        <TableCell>{task?.assignee}</TableCell>
                                        <TableCell>{task?.due}</TableCell>
                                        <TableCell>{task?.priority}</TableCell>
                                        <TableCell>{task?.summary}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                aria-label="actions"
                                                onClick={(e) => handleMenuOpen(e, task)}
                                            >
                                                <MoreVertIcon style={{ color: "#7d7f85" }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    {subtaskVisibility[taskIndex] &&
                                        task?.subtasks?.length > 0 &&
                                        renderSubtasks(task?.subtasks, `${taskIndex}`)}
                                </React.Fragment>
                            ))}
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Button variant="text" size="small" onClick={() => addSubtask(null)}>
                                    + Add Task
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data?.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        onAddSubtask(selectedItem);
                    }}
                >
                    Add Child Task
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
            </Menu>
        </>
    );
};

export default TableView;

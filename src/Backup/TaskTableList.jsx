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
    Typography,
} from "@mui/material";
import {
    ArrowForwardIosSharp as ArrowForwardIosSharpIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { CircleChevronRight, CirclePlus, GitMerge } from "lucide-react";
import "react-resizable/css/styles.css";
import { useRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData } from "../../../Recoil/atom";
import { deleteTaskDataApi } from "../../../Api/TaskApi/DeleteTaskApi";
import TaskDetail from "./TaskDetails";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";

const TableView = ({ data, onAddSubtask, isLoading }) => {
    const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const [rootSubroot, setRootSubroot] = useRecoilState(rootSubrootflag);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const [openChildTask, setOpenChildTask] = useRecoilState(fetchlistApiCall);
    const [selectedTask, setSelectedTask] = useRecoilState(selectedRowData);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [subtaskVisibility, setSubtaskVisibility] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [columnWidths] = useState({
        name: 200,
        status: 150,
        assignee: 150,
        due: 150,
        priority: 150,
        summary: 200,
        actions: 100,
    });

    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [cnfDialogOpen, setCnfDialogOpen] = useState(false);

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const handleTaskMouseEnter = (taskId) => {
        setHoveredTaskId(taskId);
        setHoveredSubtaskId(null);
    };

    const handleTaskMouseLeave = () => {
        setHoveredTaskId(null);
    };

    const handleSubtaskMouseEnter = (subtaskId) => {
        setHoveredSubtaskId(subtaskId);
    };

    const handleSubtaskMouseLeave = () => {
        setHoveredSubtaskId(null);
    };

    const handleAddTask = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setOpenChildTask(true);
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleAddSubtask = (subtask, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setOpenChildTask(true);
        setFormDataValue(subtask);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleMenuOpen = (event, item) => {
        setAnchorEl(event.currentTarget);
        setSelectedItem(item);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        try {
            const deleteTaskApi = await deleteTaskDataApi(formDataValue);
            if (deleteTaskApi) {
                setOpenChildTask(false);
                setSelectedTask(null);
            } else {
                console.error("Failed to delete task");
            }
        } catch (error) {
            console.error("Error while deleting task:", error);
        }
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleMenuItemClick = async (action, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setSelectedAction(action);

        switch (action) {
            case "Edit":
                setFormDataValue(selectedItem);
                setFormDrawerOpen(true);
                setSelectedTask(null);
                break;

            case "Delete":
                setFormDataValue(selectedItem);
                setCnfDialogOpen(true);
                break;

            case "View":
                setTaskDetailModalOpen(true);
                setFormDataValue(selectedItem);
                break;

            default:
                console.warn("Unknown action:", action);
        }

        handleMenuClose();
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    const toggleSubtasks = (taskIndex) => {
        setSubtaskVisibility((prev) => {
            const isCurrentlyVisible = prev[taskIndex];
            const newState = { ...prev, [taskIndex]: !isCurrentlyVisible };

            setOpenChildTask(false);

            if (!isCurrentlyVisible) {
                const task = findTask(data, taskIndex);
                setTimeout(() => {
                    setOpenChildTask(true);
                    setSelectedTask(task);
                }, 0);
            }

            return newState;
        });
    };

    const findTask = (tasks, taskIndex) => {
        const indexes = String(taskIndex).split("-").map(Number);
        let currentTasks = tasks;
        let currentTask = null;

        indexes.forEach((index) => {
            currentTask = currentTasks[index];
            currentTasks = currentTask?.subtasks || [];
        });

        return currentTask;
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
        return [...array]?.sort(comparator);
    };

    let sortedData;
    if (data) {
        sortedData = sortData(data, getComparator(order, orderBy));
    }

    const renderSubtasks = (subtasks, parentIndex) => {
        return subtasks?.map((subtask, subtaskIndex) => (
            <React.Fragment key={`${parentIndex}-${subtaskIndex}`}>
                <TableRow>

                    <TableCell
                        onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid)}
                        onMouseLeave={handleSubtaskMouseLeave}
                    >
                        <div style={{ paddingLeft: `${20 + 20 * (parentIndex.split('-').length)}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
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
                                {subtask?.taskname}
                                {subtask?.subtasks?.length > 0 && (
                                    <>
                                        <IconButton
                                            aria-label="toggle-task"
                                            size="small"
                                            onClick={() => toggleSubtasks(subtaskIndex)}
                                        >
                                            <GitMerge
                                                size={20}
                                                color="#7367f0"
                                            />
                                        </IconButton>
                                        {subtask?.subtasks?.length}
                                    </>
                                )}
                            </div>
                            <IconButton
                                aria-label="toggle-task"
                                size="small"
                                onClick={() => handleAddSubtask(subtask, { Task: 'subroot' })}
                                style={{
                                    visibility: hoveredSubtaskId === subtask?.taskid ? "visible" : "hidden",
                                }}
                            >
                                <CirclePlus size={20} color="#7367f0" />
                            </IconButton>
                        </div>
                    </TableCell>

                    <TableCell>{subtask?.status}</TableCell>
                    <TableCell>{subtask?.assignee}</TableCell>
                    <TableCell>{subtask?.DeadLineDate}</TableCell>
                    <TableCell>{subtask?.priority}</TableCell>
                    <TableCell>{subtask?.summary}</TableCell>
                    <TableCell>
                        <IconButton
                            aria-label="actions"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, subtask, { Task: 'root' });
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
                        {isLoading ? (
                            <LoadingBackdrop isLoading={isLoading} />
                        ) :
                            <>
                                {sortedData?.length != 0 ? (
                                    <>
                                        {sortedData
                                            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            ?.map((task, taskIndex) => (
                                                <React.Fragment key={taskIndex}>
                                                    <TableRow>
                                                        <TableCell
                                                            onMouseEnter={() => handleTaskMouseEnter(task?.taskid)}
                                                            onMouseLeave={handleTaskMouseLeave}
                                                        >
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <div>
                                                                    <IconButton
                                                                        aria-label="toggle-task"
                                                                        size="small"
                                                                        onClick={() => toggleSubtasks(taskIndex)}
                                                                    >
                                                                        <CircleChevronRight
                                                                            style={{
                                                                                color: "#7d7f85",
                                                                                fontSize: "1rem",
                                                                                transform: subtaskVisibility[taskIndex] ? "rotate(90deg)" : "rotate(0deg)",
                                                                                transition: "transform 0.2s ease-in-out",
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                                    {task?.taskname}
                                                                    {task?.subtasks?.length > 0 && (
                                                                        <>
                                                                            <IconButton
                                                                                aria-label="toggle-task"
                                                                                size="small"
                                                                                onClick={() => toggleSubtasks(taskIndex)}
                                                                            >
                                                                                <GitMerge size={20} color="#7367f0" />
                                                                            </IconButton>
                                                                            {task?.subtasks?.length}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <IconButton
                                                                    aria-label="add-task"
                                                                    size="small"
                                                                    onClick={() => handleAddTask(task, { Task: 'subroot' })}
                                                                    style={{
                                                                        visibility: hoveredTaskId === task?.taskid ? "visible" : "hidden",
                                                                    }}
                                                                >
                                                                    <CirclePlus size={20} color="#7367f0" />
                                                                </IconButton>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>{task?.status}</TableCell>
                                                        <TableCell>{task?.assignee}</TableCell>
                                                        <TableCell>{task?.DeadLineDate}</TableCell>
                                                        <TableCell>{task?.priority}</TableCell>
                                                        <TableCell>{task?.summary}</TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                aria-label="actions"
                                                                onClick={(e) => handleMenuOpen(e, task, { Task: 'root' })}
                                                            >
                                                                <MoreVertIcon style={{ color: "#7d7f85" }} />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                    {subtaskVisibility[taskIndex] &&
                                                        renderSubtasks(task?.subtasks, `${taskIndex}`)}
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
                        <TableRow>
                            <TableCell colSpan={7}>
                                <Button variant="text" size="small" onClick={() => handleAddTask()}>
                                    + Add Task
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {/* <TablePagination
                component="div"
                count={data && data?.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            /> */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    className: "MenuBtnPaperClass",
                    style: {
                        maxHeight: 48 * 4.5,
                        width: "20ch",
                    },
                }}
            >
                <MenuItem onClick={() => handleMenuItemClick('Edit', { Task: 'root' })}>Edit</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('Delete', { Task: 'root' })}>Delete</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('View', { Task: 'root' })}>View</MenuItem>
            </Menu>
            <TaskDetail
                open={taskDetailModalOpen}
                onClose={handleTaskModalClose}
                TaskData={selectedItem}
            />
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this task?"
            />
        </>
    );
};

export default TableView;

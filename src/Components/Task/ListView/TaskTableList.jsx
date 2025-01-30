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
    Pagination,
    AvatarGroup,
    Avatar,
    Chip,
} from "@mui/material";
import {
    ArrowForwardIosSharp as ArrowForwardIosSharpIcon,
    MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { CircleChevronRight, CirclePlus, Edit, Eye, GitMerge, Pencil } from "lucide-react";
import "react-resizable/css/styles.css";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { fetchlistApiCall, flowRemember, formData, openFormDrawer, rootSubrootflag, selectedRowData } from "../../../Recoil/atom";
import { deleteTaskDataApi } from "../../../Api/TaskApi/DeleteTaskApi";
import TaskDetail from "../TaskDetails/TaskDetails";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import LoadingBackdrop from "../../../Utils/LoadingBackdrop";
import { formatDate2, getRandomAvatarColor, statusColors } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const TableView = ({ data, onAddSubtask, isLoading }) => {
    const setTrackFlowData = useSetRecoilState(flowRemember);
    const flowRememberdata = useRecoilValue(flowRemember);
    console.log('flowRememberdata: ', flowRememberdata);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [subtaskVisibility, setSubtaskVisibility] = useState({});
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths] = useState({
        name: 350,
        project: 150,
        status: 180,
        assignee: 150,
        due: 150,
        priority: 150,
        // summary: 200,
        actions: 100,
    });
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [cnfDialogOpen, setCnfDialogOpen] = useState(false);

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

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

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
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleAddSubtask = (subtask, additionalInfo) => {
        console.log('subtask: ', subtask);
        setRootSubroot(additionalInfo);
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

    const handleEditTask = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(null);
    };

    const handleViewTask = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setTaskDetailModalOpen(true);
        setFormDataValue(task);
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
                console.log('task: ', task?.subtasks?.length == 0);

                setTrackFlowData((prev) => {
                        return {
                            ...prev,
                            ...task,
                        };
                    return prev;
                });

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

    const renderSubtasks = (subtasks, parentIndex) => {
        return subtasks?.map((subtask, subtaskIndex) => (
            <React.Fragment key={`${parentIndex}-${subtaskIndex}`}>
                <TableRow>

                    <TableCell
                        onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid)}
                        onMouseLeave={handleSubtaskMouseLeave}
                    >
                        <div style={{ paddingLeft: `${10 * (parentIndex.split('-').length)}px`, display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <IconButton
                                        id="toggle-subtask"
                                        aria-label="toggle-subtask"
                                        aria-labelledby="toggle-subtask"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSubtasks(`${parentIndex}-${subtaskIndex}`);
                                        }}
                                    >
                                        <PlayArrowIcon
                                            style={{
                                                color: subtaskVisibility[`${parentIndex}-${subtaskIndex}`] ? "#444050" : "#c7c7c7",
                                                fontSize: "1.5rem",
                                                transform: subtaskVisibility[`${parentIndex}-${subtaskIndex}`]
                                                    ? "rotate(90deg)"
                                                    : "rotate(0deg)",
                                                transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
                                            }}
                                        />
                                    </IconButton>
                                    <span>{subtask?.taskname}</span>
                                    {subtask?.subtasks?.length > 0 && (
                                        <>
                                            <IconButton
                                                id="toggle-task"
                                                aria-label="toggle-task"
                                                aria-labelledby="toggle-task"
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
                                {subtaskIndex % 2 !== 0 && (
                                    <div style={{ marginLeft: '28px' }}>
                                        <Chip
                                            label={subtask?.ticket || 'G00131'}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontSize: '12px', height: '20px', color: '#6D6b77' }}
                                        />
                                    </div>
                                )}
                            </div>
                            <IconButton
                                id="toggle-task"
                                aria-label="toggle-task"
                                aria-labelledby="toggle-tasl"
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

                    <TableCell>{subtask?.taskPr}</TableCell>
                    <TableCell>
                        <div style={{
                            color: statusColors[subtask?.status]?.color,
                            backgroundColor: statusColors[subtask?.status]?.backgroundColor,
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
                            {subtask?.status}
                        </div>
                    </TableCell>
                    <TableCell>
                        <AvatarGroup max={10}
                            sx={{
                                flexDirection: 'row !important',
                                '& .MuiAvatar-root': {
                                    width: 22,
                                    height: 22,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                    }
                                }
                            }}
                        >
                            {subtask?.assignee?.map((assignee, teamIdx) => (
                                <Avatar
                                    key={teamIdx}
                                    alt={assignee}
                                    src={assignee.avatar}
                                    sx={{
                                        backgroundColor: background(assignee),
                                    }}
                                >
                                    {!assignee.avatar && assignee.charAt(0)}
                                </Avatar>
                            ))}
                        </AvatarGroup>
                    </TableCell>
                    <TableCell>{subtask?.DeadLineDate ? formatDate2(subtask.DeadLineDate) : 'No deadline set'}</TableCell>
                    <TableCell>
                        <div style={{
                            color: priorityColors[subtask?.priority]?.color,
                            backgroundColor: priorityColors[subtask?.priority]?.backgroundColor,
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
                            {subtask?.priority}
                        </div>
                    </TableCell>
                    {/* <TableCell>{subtask?.summary}</TableCell> */}
                    <TableCell align="center">
                        {/* <IconButton
                            id="actions"
                            aria-label="actions"
                            aria-labelledby="actions"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleMenuOpen(e, subtask, { Task: 'root' });
                            }}
                            style={{ color: "#7d7f85" }}
                        >
                            <MoreVertIcon />
                        </IconButton> */}
                        <Box>
                            <IconButton
                                id="edit"
                                aria-label="edit"
                                aria-labelledby="edit"
                                style={{ color: "#7d7f85" }}
                                onClick={() => handleViewTask(subtask, { Task: 'root' })}
                            >
                                <Eye size={20} />
                            </IconButton>
                            <IconButton
                                id="edit"
                                aria-label="edit"
                                aria-labelledby="edit"
                                style={{ color: "#7d7f85" }}
                                onClick={() => handleEditTask(subtask, { Task: 'root' })}
                            >
                                <Pencil size={20} />
                            </IconButton>
                        </Box>
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
                        {(isLoading || !data) ? (
                            <LoadingBackdrop isLoading={isLoading} />
                        ) :
                            <>
                                {data?.length != 0 ? (
                                    <>
                                        {currentData?.map((task, taskIndex) => (
                                            <React.Fragment key={taskIndex}>
                                                <TableRow>
                                                    <TableCell
                                                        onMouseEnter={() => handleTaskMouseEnter(task?.taskid)}
                                                        onMouseLeave={handleTaskMouseLeave}
                                                    >
                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                            <div>
                                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                                    <IconButton
                                                                        id="toggle-task"
                                                                        aria-label="toggle-task"
                                                                        aria-labelledby="toggle-task"
                                                                        size="small"
                                                                        onClick={() => toggleSubtasks(taskIndex)}
                                                                    >
                                                                        <PlayArrowIcon
                                                                            style={{
                                                                                color: subtaskVisibility[taskIndex] ? "#444050" : "#c7c7c7",
                                                                                fontSize: "1.5rem",
                                                                                transform: subtaskVisibility[taskIndex] ? "rotate(90deg)" : "rotate(0deg)",
                                                                                transition: "transform 0.2s ease-in-out",
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                                    <span>{task?.taskname}</span>
                                                                    {task?.subtasks?.length > 0 && (
                                                                        <>
                                                                            <IconButton
                                                                                id="toggle-subtasks"
                                                                                aria-label="toggle subtasks"
                                                                                aria-labelledby="toggle-subtasks"
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleSubtasks(taskIndex);
                                                                                }}
                                                                            >
                                                                                <GitMerge size={20} color="#7367f0" />
                                                                            </IconButton>
                                                                            {task?.subtasks?.length}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {taskIndex % 2 === 0 && (
                                                                    <div style={{ marginLeft: '28px' }}>
                                                                        <Chip
                                                                            label={task?.ticket || 'A00161'}
                                                                            variant="outlined"
                                                                            size="small"
                                                                            sx={{ fontSize: '12px', height: '20px', color: '#6D6b77' }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <IconButton
                                                                id="add-task"
                                                                aria-label="add-task"
                                                                aria-labelledby="add-task"
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

                                                    <TableCell>{task?.taskPr}</TableCell>
                                                    <TableCell>
                                                        <div style={{
                                                            color: statusColors[task?.status]?.color,
                                                            backgroundColor: statusColors[task?.status]?.backgroundColor,
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
                                                            {task?.status}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <AvatarGroup max={10}
                                                            sx={{
                                                                flexDirection: 'row !important',
                                                                '& .MuiAvatar-root': {
                                                                    width: 22,
                                                                    height: 22,
                                                                    fontSize: '0.8rem',
                                                                    cursor: 'pointer',
                                                                    border: 'none',
                                                                    transition: 'transform 0.3s ease-in-out',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-8px)',
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {task?.assignee?.map((assignee, teamIdx) => (
                                                                <Avatar
                                                                    key={teamIdx}
                                                                    alt={assignee}
                                                                    src={assignee.avatar}
                                                                    sx={{
                                                                        backgroundColor: background(assignee),
                                                                    }}
                                                                >
                                                                    {!assignee.avatar && assignee.charAt(0)}
                                                                </Avatar>
                                                            ))}
                                                        </AvatarGroup>
                                                    </TableCell>
                                                    <TableCell>{task?.DeadLineDate ? formatDate2(task.DeadLineDate) : 'No deadline set'}</TableCell>
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
                                                    {/* <TableCell>{task?.summary}</TableCell> */}
                                                    <TableCell align="center">
                                                        {/* <IconButton
                                                            id="actions"
                                                            aria-label="actions"
                                                            aria-labelledby="actions"
                                                            onClick={(e) => handleMenuOpen(e, task, { Task: 'root' })}
                                                            style={{ color: "#7d7f85" }}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton> */}
                                                        <Box>
                                                            <IconButton
                                                                id="edit"
                                                                aria-label="edit"
                                                                aria-labelledby="edit"
                                                                style={{ color: "#7d7f85" }}
                                                                onClick={() => handleViewTask(task, { Task: 'root' })}
                                                            >
                                                                <Eye size={20} />
                                                            </IconButton>
                                                            <IconButton
                                                                id="edit"
                                                                aria-label="edit"
                                                                aria-labelledby="edit"
                                                                style={{ color: "#7d7f85" }}
                                                                onClick={() => handleEditTask(task, { Task: 'root' })}
                                                            >
                                                                <Pencil size={20} />
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                                {
                                                    subtaskVisibility[taskIndex] &&
                                                    renderSubtasks(task?.subtasks, `${taskIndex}`)
                                                }
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) :
                                    <TableRow>
                                        <TableCell colSpan={Object?.keys(columnWidths)?.length} >
                                            <Typography variant="body2" p={2} textAlign="center">No matched tasks found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                }
                            </>
                        }
                        <TableRow>
                            <TableCell colSpan={Object?.keys(columnWidths)?.length}>
                                <Button variant="text" size="small" onClick={() => handleAddTask()}>
                                    + Add Task
                                </Button>
                            </TableCell>
                        </TableRow>
                        {!isLoading &&
                            <TableRow>
                                <TableCell colSpan={Object?.keys(columnWidths)?.length} >
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
            </TableContainer >
            {/* <Menu
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
                <MenuItem onClick={() => handleMenuItemClick('Delete', { Task: 'root' })}>Delete</MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('View', { Task: 'root' })}>View</MenuItem>
            </Menu> */}
            < TaskDetail
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

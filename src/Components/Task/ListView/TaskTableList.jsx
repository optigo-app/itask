import React, { useEffect, useState } from "react";
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
    TableSortLabel,
    Button,
    Box,
    Typography,
    Pagination,
    AvatarGroup,
    Avatar,
    Chip,
    Tooltip,
    MenuItem,
    Menu,
} from "@mui/material";
import { CirclePlus, Eye, Minus, Pencil, Plus, Timer } from "lucide-react";
import "react-resizable/css/styles.css";
import { useRecoilState, useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { formatDate2, getRandomAvatarColor, ImageUrl, priorityColors, statusColors } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssigneeShortcutModal from "../../ShortcutsComponent/AssigneeShortcutModal";
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TaskTimeTracking from "../../ShortcutsComponent/TaskTimeTracking";
import BurningImg from "../../../Assests/fire.webp"
import CircleIcon from '@mui/icons-material/Circle';
import { MoreVert } from "@mui/icons-material";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import StatusCircles from "../../ShortcutsComponent/EstimateComp";

const TableView = ({ data, handleTaskFavorite, handleStatusChange, isLoading }) => {
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const setActionMode = useSetRecoilState(taskActionMode);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredColumnname, setHoveredColumnName] = useState('');
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const setSelectedTask = useSetRecoilState(selectedRowData);
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
        deadline: 150,
        priority: 150,
        estimate: 150,
        actions: 120,
    });
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [openAssigneeModal, setOpenAssigneeModal] = useState(false);
    const [timeTrackMOpen, setTimeTrackMOpen] = useState(false);
    const [taskTimeRunning, setTaskTimeRunning] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        if (!selectedItem || !data) return;
        const findTaskRecursively = (tasks, taskId) => {
            for (const task of tasks) {
                if (task.taskid === taskId) {
                    return task;
                }
                if (task.subtasks && task.subtasks.length > 0) {
                    const foundInSubtasks = findTaskRecursively(task.subtasks, taskId);
                    if (foundInSubtasks) return foundInSubtasks;
                }
            }
            return null;
        };
        const selectedData = findTaskRecursively(data, selectedItem.taskid);
        if (selectedData) {
            setSelectedItem(selectedData);
        }
    }, [data, selectedItem?.taskid]);

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    const handleTimeTrackModalOpen = (task) => {
        setTimeTrackMOpen(true);
        setSelectedItem(task)
    };

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const handleTaskMouseEnter = (taskId, value) => {
        setHoveredColumnName(value?.Tbcell)
        setHoveredTaskId(taskId);
        setHoveredSubtaskId(null);
    };

    const handleTaskMouseLeave = () => {
        setHoveredTaskId(null);
        setHoveredColumnName('')
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
        setSelectedTask(task);
    };

    const handleAddSubtask = (subtask, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFormDataValue(subtask);
        setFormDrawerOpen(true);
        setSelectedTask(subtask);
    };

    const handleEditTask = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setActionMode("edit");
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(task);
    };

    const handleViewTask = async (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setTaskDetailModalOpen(true);
        setFormDataValue(task);
        setSelectedItem(task);
    };

    const onStatusChange = (task, newStatus) => {
        handleStatusChange(task, newStatus);
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

    const handleAssigneeShortcut = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setOpenAssigneeModal(true);
        setSelectedTask(task);
    }

    const handleCloseAssigneeModal = () => {
        setOpenAssigneeModal(false);
    }

    const renderSubtasks = (subtasks, parentIndex) => {
        return subtasks?.map((subtask, subtaskIndex) => (
            <React.Fragment key={`${parentIndex}-${subtaskIndex}`}>
                <TableRow>
                    <TableCell
                        onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid)}
                        onMouseLeave={handleSubtaskMouseLeave}
                    >
                        <div style={{ paddingLeft: `${5 * (parentIndex.split('-').length)}px`, display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: '5px' }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "30px" }}>
                                        <IconButton
                                            id="toggle-task"
                                            aria-label="toggle-task"
                                            aria-labelledby="toggle-task"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSubtasks(`${parentIndex}-${subtaskIndex}`);
                                            }}
                                        >
                                            <PlayArrowIcon
                                                style={{
                                                    color: subtaskVisibility[`${parentIndex}-${subtaskIndex}`] ? "#444050" : "#c7c7c7",
                                                    fontSize: "1.2rem",
                                                    transform: subtaskVisibility[`${parentIndex}-${subtaskIndex}`] ? "rotate(90deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s ease-in-out",
                                                }}
                                            />
                                        </IconButton>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                                            <span style={{ flex: 1 }}>
                                                {subtask?.taskname?.length > 20 ? `${subtask?.taskname.slice(0, 50)}...` : subtask?.taskname}
                                            </span>
                                            {/* {subtask?.subtasks?.length > 0 && (
                                                <div className="task-sub_count">
                                                    {subtask?.subtasks?.length}
                                                </div>
                                            )} */}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                                            {subtask?.isburning == 1 &&
                                                <img src={BurningImg} alt="burningTask"
                                                    style={{ width: '15px', height: '15px', borderRadius: '50%' }} />
                                            }
                                            {subtask?.ticketno != "" && (
                                                <Chip
                                                    label={subtask?.ticketno || ''}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ background: '#d8d8d8', fontSize: '10px', height: '16px', color: '#8863FB' }}
                                                />
                                            )}
                                            {subtask?.isnew == 1 &&
                                                <Chip
                                                    label={'New'}
                                                    variant="filled"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: '#E3F2FD',
                                                        color: '#2196F3',
                                                        fontSize: '10px',
                                                        height: '16px',
                                                        '& .MuiChip-label': {
                                                            padding: '0 6px',
                                                        },
                                                    }}
                                                />
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <IconButton
                                id="add-task"
                                aria-label="add-task"
                                aria-labelledby="add-task"
                                size="small"
                                onClick={() => handleAddSubtask(subtask, { Task: 'subroot' })}
                                style={{
                                    visibility: hoveredSubtaskId === subtask?.taskid ? "visible" : "hidden",
                                }}
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                    }
                                }}
                            >
                                <CirclePlus size={20} color="#7367f0" />
                            </IconButton>
                        </div>
                    </TableCell>
                    <TableCell>{subtask?.taskPr}</TableCell>
                    <TableCell>
                        {/* <div style={{
                            color: statusColors[subtask?.status]?.color ?? '#fff',
                            backgroundColor: statusColors[subtask?.status]?.backgroundColor ?? '#7d7f85a1',
                            width: 'fit-content',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '5px',
                            textAlign: 'center',
                            fontSize: '13.5px',
                            fontWeight: '500',
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                        }}>
                            {subtask?.status}
                        </div> */}
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange} />
                    </TableCell>
                    <TableCell
                        onMouseEnter={() => handleTaskMouseEnter(subtask?.taskid, { Tbcell: 'Assignee' })}
                        onMouseLeave={handleTaskMouseLeave}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <AvatarGroup max={10}
                                spacing={2}
                                sx={{
                                    '& .MuiAvatar-root': {
                                        width: 22,
                                        height: 22,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.2)',
                                            zIndex: 10
                                        }
                                    }
                                }}
                            >
                                {subtask?.assignee?.map((assignee, teamIdx) => (
                                    <Tooltip
                                        placement="top"
                                        key={assignee?.id}
                                        title={assignee?.name}
                                        arrow
                                        classes={{ tooltip: 'custom-tooltip' }}
                                    >
                                        <Avatar
                                            key={teamIdx}
                                            alt={assignee?.name}
                                            src={assignee.avatar || null}
                                            sx={{
                                                backgroundColor: background(assignee?.name),
                                            }}
                                        >
                                            {!assignee.avatar && assignee.charAt(0)}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </AvatarGroup>
                            <IconButton
                                id="add-task"
                                aria-label="add-task"
                                aria-labelledby="add-task"
                                size="small"
                                onClick={() => handleAssigneeShortcut(subtask, { Task: 'root' })}
                                style={{
                                    visibility: hoveredTaskId === subtask?.taskid && hoveredColumnname == 'Assignee' ? "visible" : "hidden",
                                }}
                            >
                                <CirclePlus size={20} color="#7367f0" />
                            </IconButton>
                        </Box>
                    </TableCell>
                    <TableCell>{subtask?.DeadLineDate ? formatDate2(subtask.DeadLineDate) : 'No deadline set'}</TableCell>
                    <TableCell>
                        <div style={{
                            color: priorityColors[subtask?.priority]?.color ?? '#fff',
                            backgroundColor: priorityColors[subtask?.priority]?.backgroundColor ?? '#7d7f85a1',
                            width: 'fit-content',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '5px',
                            textAlign: 'center',
                            fontSize: '13.5px',
                            fontWeight: '500',
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                        }}>
                            {subtask?.priority}
                        </div>
                    </TableCell>
                    <TableCell>
                        <StatusCircles task={subtask} />
                    </TableCell>
                    <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {/* <Tooltip
                                title={taskTimeRunning[subtask.taskid] ? "Time Track ON" : "Time Track OFF"}
                                arrow
                                placement="top"
                                classes={{ tooltip: "custom-tooltip" }}
                            > */}
                            <IconButton
                                onClick={() => handleTimeTrackModalOpen(subtask)}
                                sx={{
                                    color: taskTimeRunning[subtask.taskid] ? "#FFD700" : "#7d7f85",
                                    transition: "color 0.3s",
                                    backgroundColor: taskTimeRunning[subtask.taskid] ? "#6D6B77" : "transparent",
                                    "&:hover": {
                                        color: taskTimeRunning[subtask.taskid] ? "#FFD700" : "#333",
                                        backgroundColor: taskTimeRunning[subtask.taskid] ? "#6D6B77" : "transparent",
                                    },
                                }}
                            >
                                <Timer size={20} />
                            </IconButton>
                            {/* </Tooltip> */}
                            {/* <Tooltip
                                title="Edit Sub-Task"
                                arrow
                                placement="top"
                                classes={{ tooltip: "custom-tooltip" }}
                            > */}
                            <span>
                                <IconButton
                                    disabled={subtask?.isFreezed == 1}
                                    onClick={() => handleEditTask(subtask, { Task: "root" })}
                                    sx={{
                                        '&.Mui-disabled': {
                                            color: 'rgba(0, 0, 0, 0.26)',
                                        },
                                    }}
                                >
                                    <Pencil
                                        size={20}
                                        color={subtask?.isFreezed == 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                                    />
                                </IconButton>
                            </span>
                            {/* </Tooltip> */}
                            {/* <Tooltip
                                title="View Sub-Task"
                                arrow
                                placement="top"
                                classes={{ tooltip: "custom-tooltip" }}
                            > */}
                            <span>
                                <IconButton
                                    onClick={() => handleViewTask(subtask, { Task: "root" })}
                                >
                                    <Eye
                                        size={20}
                                        color={"#808080"}
                                    />
                                </IconButton>
                            </span>
                            {/* </Tooltip> */}
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
            {(isLoading === null || isLoading || (!data && isLoading !== false)) ? (
                <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
            ) :
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
                            {data && data?.length !== 0 ? (
                                <>
                                    {currentData?.map((task, taskIndex) => (
                                        <React.Fragment key={taskIndex}>
                                            <TableRow key={taskIndex}>
                                                <TableCell
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                    onMouseLeave={handleTaskMouseLeave}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: '5px' }}>
                                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                                                                                fontSize: "1rem",
                                                                                transform: subtaskVisibility[taskIndex] ? "rotate(90deg)" : "rotate(0deg)",
                                                                                transition: "transform 0.2s ease-in-out",
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                                </div>
                                                                <div>
                                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                                                                        <span style={{ flex: 1 }}>
                                                                            {task?.taskname?.length > 35 ? `${task?.taskname?.slice(0, 35)}...` : task?.taskname}
                                                                        </span>
                                                                        {/* {task?.subtasks?.length > 0 && (
                                                                            <div className="task-sub_count">
                                                                                {task?.subtasks?.length}
                                                                            </div>
                                                                        )} */}
                                                                    </div>
                                                                    <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                                                                        {task?.isburning == 1 &&
                                                                            <img src={BurningImg} alt="burningTask"
                                                                                style={{ width: '15px', height: '15px', borderRadius: '50%' }} />
                                                                        }
                                                                        {task?.ticketno !== "" && (
                                                                            <Chip
                                                                                label={task?.ticketno || ''}
                                                                                variant="outlined"
                                                                                size="small"
                                                                                sx={{ background: '#d8d8d8', fontSize: '10px', height: '16px', color: '#8863FB' }}
                                                                            />
                                                                        )}
                                                                        {task?.isnew == 1 &&
                                                                            <Chip
                                                                                label={'New'}
                                                                                variant="filled"
                                                                                size="small"
                                                                                sx={{
                                                                                    backgroundColor: '#E3F2FD',
                                                                                    color: '#2196F3',
                                                                                    fontSize: '10px',
                                                                                    height: '16px',
                                                                                    '& .MuiChip-label': {
                                                                                        padding: '0 6px',
                                                                                    },
                                                                                }}
                                                                            />
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <IconButton
                                                            id="add-task"
                                                            aria-label="add-task"
                                                            aria-labelledby="add-task"
                                                            size="small"
                                                            onClick={() => handleAddTask(task, { Task: 'subroot' })}
                                                            style={{
                                                                visibility: hoveredTaskId === task?.taskid && hoveredColumnname == 'TaskName' ? "visible" : "hidden",
                                                            }}
                                                        >
                                                            <CirclePlus size={20} color="#7367f0" />
                                                        </IconButton>
                                                    </div>


                                                </TableCell>
                                                <TableCell>{task?.taskPr}</TableCell>
                                                <TableCell>
                                                    {/* <div style={{
                                                        color: statusColors[task?.status]?.color,
                                                        backgroundColor: statusColors[task?.status]?.backgroundColor,
                                                        width: 'fit-content',
                                                        padding: '0.2rem 0.8rem',
                                                        borderRadius: '5px',
                                                        textAlign: 'center',
                                                        fontSize: '13.5px',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        justifyContent: 'start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {task?.status}
                                                    </div> */}
                                                    <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange} />
                                                </TableCell>
                                                <TableCell
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                    onMouseLeave={handleTaskMouseLeave}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <AvatarGroup max={10}
                                                            spacing={2}
                                                            sx={{
                                                                '& .MuiAvatar-root': {
                                                                    width: 22,
                                                                    height: 22,
                                                                    fontSize: '0.8rem',
                                                                    cursor: 'pointer',
                                                                    border: 'none',
                                                                    transition: 'transform 0.3s ease-in-out',
                                                                    '&:hover': {
                                                                        transform: 'scale(1.2)',
                                                                        zIndex: 10
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            {task?.assignee?.map((assignee, teamIdx) => (
                                                                <Tooltip
                                                                    placement="top"
                                                                    key={assignee?.id}
                                                                    title={assignee?.firstname}
                                                                    arrow
                                                                    classes={{ tooltip: 'custom-tooltip' }}
                                                                >
                                                                    <Avatar
                                                                        key={teamIdx}
                                                                        alt={assignee?.firstname}
                                                                        src={ImageUrl(assignee) || null}
                                                                        sx={{
                                                                            backgroundColor: background(assignee?.firstname),
                                                                        }}
                                                                    >
                                                                        {!assignee.avatar && assignee?.firstname?.charAt(0)}
                                                                    </Avatar>
                                                                </Tooltip>
                                                            ))}
                                                        </AvatarGroup>
                                                        <IconButton
                                                            id="add-task"
                                                            aria-label="add-task"
                                                            aria-labelledby="add-task"
                                                            size="small"
                                                            onClick={() => handleAssigneeShortcut(task, { Task: 'root' })}
                                                            style={{
                                                                visibility: hoveredTaskId === task?.taskid && hoveredColumnname == 'Assignee' ? "visible" : "hidden",
                                                            }}
                                                        >
                                                            <CirclePlus size={20} color="#7367f0" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{task?.DeadLineDate ? formatDate2(task.DeadLineDate) : 'No deadline set'}</TableCell>
                                                <TableCell>
                                                    <div style={{
                                                        color: priorityColors[task?.priority]?.color ?? '#fff',
                                                        backgroundColor: priorityColors[task?.priority]?.backgroundColor ?? '#7d7f85a1',
                                                        width: 'fit-content',
                                                        padding: '0.2rem 0.8rem',
                                                        borderRadius: '5px',
                                                        textAlign: 'center',
                                                        fontSize: '13.5px',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        justifyContent: 'start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {task?.priority}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusCircles task={task} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                                        {/* Time Track Button */}
                                                        {/* <Tooltip
                                                            title={taskTimeRunning[task.taskid] ? "Time Track ON" : "Time Track OFF"}
                                                            arrow
                                                            placement="top"
                                                            classes={{ tooltip: "custom-tooltip" }}
                                                        > */}
                                                        <IconButton
                                                            onClick={() => handleTimeTrackModalOpen(task)}
                                                            sx={{
                                                                color: taskTimeRunning[task.taskid] ? "#FFD700 !important" : "#7d7f85 !important",
                                                                transition: "color 0.3s",
                                                                backgroundColor: taskTimeRunning[task.taskid] ? "#6D6B77" : "transparent",
                                                                "&:hover": {
                                                                    color: taskTimeRunning[task.taskid] ? "#FFD700" : "#333",
                                                                    backgroundColor: taskTimeRunning[task.taskid] ? "#6D6B77" : "transparent",
                                                                },
                                                            }}
                                                        >
                                                            <Timer size={20} />
                                                        </IconButton>
                                                        {/* </Tooltip> */}
                                                        {/* <Tooltip
                                                            title="Edit Task"
                                                            arrow
                                                            placement="top"
                                                            classes={{ tooltip: "custom-tooltip" }}
                                                        > */}
                                                        <span>
                                                            <IconButton
                                                                disabled={task?.isFreezed == 1}
                                                                onClick={() => handleEditTask(task, { Task: "root" })}
                                                                sx={{
                                                                    '&.Mui-disabled': {
                                                                        color: 'rgba(0, 0, 0, 0.26)',
                                                                    },
                                                                }}
                                                            >
                                                                <Pencil
                                                                    size={20}
                                                                    color={task?.isFreezed == 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                                                                />
                                                            </IconButton>
                                                        </span>
                                                        {/* </Tooltip> */}
                                                        {/* <Tooltip
                                                            title="View Task"
                                                            arrow
                                                            placement="top"
                                                            classes={{ tooltip: "custom-tooltip" }}
                                                        > */}
                                                        <span>
                                                            <IconButton
                                                                onClick={() => handleViewTask(task, { Task: "root" })}
                                                            >
                                                                <Eye
                                                                    size={20}
                                                                    color={"#808080"}
                                                                />
                                                            </IconButton>
                                                        </span>
                                                        {/* </Tooltip> */}
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
                            {!isLoading && data?.length !== 0 &&
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
            }

            < TaskDetail
                open={taskDetailModalOpen}
                onClose={handleTaskModalClose}
                taskData={selectedItem}
                handleTaskFavorite={handleTaskFavorite}
            />
            <AssigneeShortcutModal
                open={openAssigneeModal}
                onClose={handleCloseAssigneeModal}
            // onSubmit={handleAssigneeShortcutSubmit}
            />
            <TaskTimeTracking
                isOpen={timeTrackMOpen}
                onClose={() => setTimeTrackMOpen(false)}
                taskData={selectedItem}
                setTaskRunning={setTaskTimeRunning}
                taskRunning={taskTimeRunning}
            />
        </>
    );
};

export default TableView;

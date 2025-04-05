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
    Box,
    Typography,
    Pagination,
    AvatarGroup,
    Avatar,
    Chip,
    Tooltip,
} from "@mui/material";
import { CirclePlus, Eye, Pencil, Timer } from "lucide-react";
import "react-resizable/css/styles.css";
import { useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { convertSpecialCharsToWords, convertWordsToSpecialChars, formatDate2, getRandomAvatarColor, ImageUrl, priorityColors, statusColors } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssigneeShortcutModal from "../../ShortcutsComponent/AssigneeShortcutModal";
import TaskTimeTracking from "../../ShortcutsComponent/TaskTimeTracking";
import BurningImg from "../../../Assests/fire.webp"
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import StatusCircles from "../../ShortcutsComponent/EstimateComp";
import ProfileCardModal from "../../ShortcutsComponent/ProfileCard";

const TableView = ({ data, handleTaskFavorite, handleStatusChange, handleAssigneeShortcutSubmit, isLoading }) => {
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const setActionMode = useSetRecoilState(taskActionMode);
    const setFormDataValue = useSetRecoilState(formData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [expandedTasks, setExpandedTasks] = useState({});
    const [hoveredTaskId, setHoveredTaskId] = useState(null);
    const [hoveredColumnname, setHoveredColumnName] = useState('');
    const [hoveredSubtaskId, setHoveredSubtaskId] = useState(null);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const [selectedItem, setSelectedItem] = useState(null);
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("name");
    const [page, setPage] = useState(1);
    console.log('page: ', page);
    const [rowsPerPage, setRowsPerPage] = useState(12);
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
    const [profileOpen, setProfileOpen] = useState(false);

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

    const hanldePAvatarClick = (task) => {
        setSelectedItem(task);
        setProfileOpen(true);
    }

    const handleAssigneSubmit = (updatedRowData) => {
        handleAssigneeShortcutSubmit(updatedRowData)
    }

    // const toggleSubtasks = (taskIndex) => {
    //     setSubtaskVisibility((prev) => {
    //         const isCurrentlyVisible = prev[taskIndex];
    //         const newState = { ...prev, [taskIndex]: !isCurrentlyVisible };

    //         setOpenChildTask(false);

    //         if (!isCurrentlyVisible) {
    //             const task = findTask(data, taskIndex);
    //             setTimeout(() => {
    //                 setOpenChildTask(true);
    //                 setSelectedTask(task);
    //             }, 0);
    //         }

    //         return newState;
    //     });
    // };

    // const findTask = (tasks, taskIndex) => {
    //     const indexes = String(taskIndex).split("-").map(Number);
    //     let currentTasks = tasks;
    //     let currentTask = null;

    //     indexes.forEach((index) => {
    //         currentTask = currentTasks[index];
    //         currentTasks = currentTask?.subtasks || [];
    //     });

    //     return currentTask;
    // };

    const toggleSubtasks = (taskId, task) => {
        setExpandedTasks((prev) => {
            const isCurrentlyExpanded = prev[taskId];
            const newState = { ...prev, [taskId]: !isCurrentlyExpanded };

            setOpenChildTask(false);

            if (!isCurrentlyExpanded) {
                setTimeout(() => {
                    setOpenChildTask(true);
                    setSelectedTask(task);
                }, 0);
            } else {
                setSelectedTask(null);
            }

            return newState;
        });
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

    // Calculate total pages
    const totalPages = Math?.ceil(data && data?.length / rowsPerPage);

    // Get data for the current page
    const currentData = sortedData?.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handleAssigneeShortcut = (task, additionalInfo) => {
        setSelectedItem(task);
        setRootSubroot(additionalInfo);
        setOpenAssigneeModal(true);
    }

    const handleCloseAssigneeModal = () => {
        setOpenAssigneeModal(false);
        setSelectedItem(null);
    }

    const renderSubtasks = (subtasks, parentTaskId, depth = 0) => {
        return subtasks?.map((subtask) => (
            <React.Fragment key={subtask.taskid}>
                <TableRow>
                    <TableCell
                        onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid)}
                        onMouseLeave={handleSubtaskMouseLeave}
                    >
                        <div style={{
                            paddingLeft: `${8 * (depth + 1)}px`,
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: '5px' }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "30px" }}>
                                        <IconButton
                                            id="toggle-task"
                                            aria-label="toggle-task"
                                            aria-labelledby="toggle-task"
                                            size="small"
                                            onClick={() => toggleSubtasks(subtask.taskid, subtask)}
                                        >
                                            <PlayArrowIcon
                                                style={{
                                                    color: expandedTasks[subtask.taskid] ? "#444050" : "#c7c7c7",
                                                    fontSize: "1.2rem",
                                                    transform: expandedTasks[subtask.taskid] ? "rotate(90deg)" : "rotate(0deg)",
                                                    transition: "transform 0.2s ease-in-out",
                                                }}
                                            />
                                        </IconButton>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                                            <span style={{ flex: 1 }}>
                                                {subtask?.taskname?.length > 20 ? `${subtask?.taskname.slice(0, 50)}...` : convertWordsToSpecialChars(subtask?.taskname)}
                                            </span>
                                            {subtask?.subtasks?.length > 0 && (
                                                <div className="task-sub_count">
                                                    {subtask?.subtasks?.length}
                                                </div>
                                            )}
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
                                        title={assignee?.firstname + " " + assignee?.lastname}
                                        arrow
                                        classes={{ tooltip: 'custom-tooltip' }}
                                    >
                                        <Avatar
                                            key={teamIdx}
                                            alt={assignee?.firstname + " " + assignee?.lastname}
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
                            color: (subtask?.priority && priorityColors[subtask?.priority]?.color) ?? '#fff',
                            backgroundColor: (subtask?.priority && priorityColors[subtask?.priority]?.backgroundColor) ?? '#7d7f85a1',
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
                            {subtask?.priority ?? '-'}
                        </div>
                    </TableCell>
                    <TableCell>
                        <StatusCircles task={subtask} />
                    </TableCell>
                    <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
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
                        </Box>
                    </TableCell>
                </TableRow>
                {expandedTasks[subtask.taskid] && renderSubtasks(subtask.subtasks, subtask.taskid, depth + 1)}
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
                                                                        onClick={() => toggleSubtasks(task.taskid, task)}
                                                                    >
                                                                        <PlayArrowIcon
                                                                            style={{
                                                                                color: expandedTasks[task.taskid] ? "#444050" : "#c7c7c7",
                                                                                fontSize: "1rem",
                                                                                transform: expandedTasks[task.taskid] ? "rotate(90deg)" : "rotate(0deg)",
                                                                                transition: "transform 0.2s ease-in-out",
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                                </div>
                                                                <div>
                                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                                                                        <span style={{ flex: 1 }}>
                                                                            {task?.taskname?.length > 35 ? `${task?.taskname?.slice(0, 35)}...` : convertWordsToSpecialChars(task?.taskname)}
                                                                        </span>
                                                                        {task?.subtasks?.length > 0 && (
                                                                            <div className="task-sub_count">
                                                                                {task?.subtasks?.length}
                                                                            </div>
                                                                        )}
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
                                                                    title={assignee?.firstname + " " + assignee?.lastname}
                                                                    arrow
                                                                    classes={{ tooltip: 'custom-tooltip' }}
                                                                >
                                                                    <Avatar
                                                                        key={teamIdx}
                                                                        alt={assignee?.firstname + " " + assignee?.lastname}
                                                                        src={ImageUrl(assignee) || null}
                                                                        sx={{
                                                                            backgroundColor: background(assignee?.firstname),
                                                                        }}
                                                                        onClick={() => hanldePAvatarClick(assignee)}
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
                                                        color: (task?.priority && priorityColors[task?.priority]?.color) ?? '#fff',
                                                        backgroundColor: (task?.priority && priorityColors[task?.priority]?.backgroundColor) ?? '#7d7f85a1',
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
                                                    </Box>

                                                </TableCell>
                                            </TableRow>
                                            {expandedTasks[task.taskid] && task?.subtasks?.length > 0 && renderSubtasks(task.subtasks, task.taskid)}
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
                taskData={selectedItem}
                open={openAssigneeModal}
                onClose={handleCloseAssigneeModal}
                handleAssigneSubmit={handleAssigneSubmit}
            />
            <TaskTimeTracking
                isOpen={timeTrackMOpen}
                onClose={() => setTimeTrackMOpen(false)}
                taskData={selectedItem}
                setTaskRunning={setTaskTimeRunning}
                taskRunning={taskTimeRunning}
            />
            <ProfileCardModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                profileData={selectedItem}
                background={background}
            />
        </>
    );
};

export default TableView;

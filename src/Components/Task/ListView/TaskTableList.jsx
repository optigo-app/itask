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
    LinearProgress,
} from "@mui/material";
import { CirclePlus, Eye, Paperclip, Pencil, Timer } from "lucide-react";
import "react-resizable/css/styles.css";
import { useSetRecoilState } from "recoil";
import { assigneeId, fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { cleanDate, formatDate2, getRandomAvatarColor, getStatusColor, ImageUrl, priorityColors, statusColors } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssigneeShortcutModal from "../../ShortcutsComponent/Assignee/AssigneeShortcutModal";
import TaskTimeTracking from "../../ShortcutsComponent/TimerComponent/TaskTimeTracking";
import BurningImage from "../../../Assests/fire.webp";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import StatusCircles from "../../ShortcutsComponent/EstimateComp";
import ProfileCardModal from "../../ShortcutsComponent/ProfileCard";
import SidebarDrawerFile from "../../ShortcutsComponent/Attachment/SidebarDrawerFile";
import useAccess from "../../Auth/Role/useAccess";
import MenuDatePicker from "../../ShortcutsComponent/Date/DeadlineDate";
import PriorityBadge from "../../ShortcutsComponent/PriorityBadge";
import CutPasetContextMenu from "../../ShortcutsComponent/CutPasteMenu";

const TableView = ({
    data,
    page,
    order,
    orderBy,
    rowsPerPage,
    currentData,
    totalPages,
    copiedData,
    contextMenu,
    handleCopy,
    handlePaste,
    handleContextMenu,
    handleCloseContextMenu,
    handleChangePage,
    handleRequestSort,
    handleTaskFavorite,
    handleStatusChange,
    handlePriorityChange,
    handleAssigneeShortcutSubmit,
    handleDeadlineDateChange,
    isLoading }) => {
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
    const setAssigneeId = useSetRecoilState(assigneeId);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openfileDrawerOpen, setFileDrawerOpen] = useState(false);
    const columns = [
        { id: "taskname", label: "Task Name", width: 350 },
        { id: "taskPr", label: "Project", width: 150 },
        { id: "progress", label: "Progress", width: 180 },
        { id: "status", label: "Status", width: 180 },
        { id: "assignee", label: "Assignee", width: 150 },
        { id: "DeadLineDate", label: "Deadline", width: 120 },
        { id: "priority", label: "Priority", width: 120 },
        { id: "estimate", label: "Estimate", width: 100 },
        { id: "actions", label: "Actions", width: 120 },
    ];

    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [openAssigneeModal, setOpenAssigneeModal] = useState(false);
    const [timeTrackMOpen, setTimeTrackMOpen] = useState(false);
    const [taskTimeRunning, setTaskTimeRunning] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const [anchorDeadlineEl, setAnchorDeadlineEl] = useState(null);

    const handleDeadlineClick = (e, task) => {
        setAnchorDeadlineEl(e.currentTarget)
        setSelectedItem(task);
    };
    const handlDeadlineeClose = () => setAnchorDeadlineEl(null);

    const openDeadline = Boolean(anchorDeadlineEl);

    const handleDeadlineChange = (event) => {
        const newValue = event;
        handleDeadlineDateChange(selectedItem, newValue);
        handlDeadlineeClose();
    }

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
        let data = {
            taskid: task?.taskid,
            taskPr: task?.taskPr,
            projectid: task?.projectid,
            taskname: task?.taskname,
            moduleid: task?.moduleid,
            maingroupids: task?.maingroupids,
        }
        setRootSubroot(additionalInfo);
        setFormDataValue(data);
        setFormDrawerOpen(true);
        setSelectedTask(task);
    };

    const handleAddSubtask = (subtask, additionalInfo) => {
        let data = {
            taskid: subtask?.taskid,
            taskPr: subtask?.taskPr,
            projectid: subtask?.projectid,
            taskname: subtask?.taskname,
            moduleid: subtask?.moduleid,
            maingroupids: subtask?.maingroupids,
        }
        setRootSubroot(additionalInfo);
        setFormDataValue(data);
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

    const handleOpenFileDrawer = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFileDrawerOpen(true);
        setSelectedTask(task);
    }

    const onStatusChange = (task, newStatus) => {
        handleStatusChange(task, newStatus);
    };

    const onPriorityChange = (task, newPriority) => {
        handlePriorityChange(task, newPriority);
    };

    const hanldePAvatarClick = (task, id) => {
        setAssigneeId(id);
        setSelectedItem(task);
        setProfileOpen(true);
    }

    const handleAssigneSubmit = (updatedRowData) => {
        handleAssigneeShortcutSubmit(updatedRowData)
    }

    const toggleSubtasks = (taskId, task) => {
        setExpandedTasks((prev) => {
            const isCurrentlyExpanded = prev[taskId];
            const newState = { ...prev, [taskId]: !isCurrentlyExpanded };
            setOpenChildTask(false);
            return newState;
        });
    };

    const handleAssigneeShortcut = (task, additionalInfo) => {
        setSelectedItem(task);
        setRootSubroot(additionalInfo);
        setOpenAssigneeModal(true);
    }

    const handleCloseAssigneeModal = () => {
        setOpenAssigneeModal(false);
        setSelectedItem(null);
    }

    const renderAssigneeAvatars = (assignees, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup
                max={6}
                spacing={2}
                sx={{
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
                {assignees?.map((assignee, teamIdx) => (
                    <Tooltip
                        placement="top"
                        key={assignee?.id}
                        title={`${assignee?.firstname} ${assignee?.lastname}`}
                        arrow
                        classes={{ tooltip: 'custom-tooltip' }}
                    >
                        <Avatar
                            key={teamIdx}
                            alt={`${assignee?.firstname} ${assignee?.lastname}`}
                            src={ImageUrl(assignee) || null}
                            sx={{
                                backgroundColor: background(`${assignee?.firstname + " " + assignee?.lastname}`)
                            }}
                            onClick={() => hanldePAvatarClick(assignees, assignee?.id)}
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
                    visibility: hoveredTaskId === task?.taskid && hoveredColumnname === 'Assignee' ? 'visible' : 'hidden',
                }}
            >
                <CirclePlus size={20} color="#7367f0" />
            </IconButton>
        </Box>
    );

    const renderTaskActions = (
        task,
        taskTimeRunning,
        handleTimeTrackModalOpen,
        handleEditTask,
        handleViewTask
    ) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
                aria-label="Time Track Task button"
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
                <Timer size={20} className="iconbtn" />
            </IconButton>
            <IconButton
                aria-label="View Module button"
                onClick={() => handleOpenFileDrawer(task, { Task: "root" })}
                sx={{
                    '&.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.26)',
                    },
                }}
            >
                <Paperclip
                    size={20}
                    color="#808080"
                    className="iconbtn"
                />
            </IconButton>
            {/* {hasAccess(PERMISSIONS.canEdit) && */}
            <IconButton
                disabled={task?.isFreezed == 1}
                onClick={() => handleEditTask(task, { Task: "root" })}
                sx={{
                    '&.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.26)',
                    },
                }}
                aria-label="Edit-Task button"
            >
                <Pencil
                    size={20}
                    color={task?.isFreezed == 1 ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                    className="iconbtn"
                />
            </IconButton>
            {/* } */}
            <IconButton
                aria-label="view Task button"
                onClick={() => handleViewTask(task, { Task: "root" })}
            >
                <Eye
                    size={20}
                    color="#808080"
                    className="iconbtn"
                />
            </IconButton>
        </Box>
    );

    const renderTaskNameSection = (
        task,
        expandedTasks,
        toggleSubtasks,
    ) => {
        return (
            <>
                <div>
                    <div style={{ display: "flex", alignItems: "center" }}>
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
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'start', cursor: 'pointer' }} onClick={() => toggleSubtasks(task.taskid, task)}>
                                <span style={{ flex: 1 }}>
                                    {task?.taskname?.length > 35
                                        ? `${task?.taskname?.slice(0, 35)}...`
                                        : task?.taskname}
                                </span>
                                {task?.subtasks?.length > 0 && (
                                    <div className="task-sub_count">
                                        {task?.subtasks?.length}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                                {task?.isburning === 1 && (
                                    <img
                                        src={BurningImage}
                                        alt="burningTask"
                                        style={{ width: '15px', height: '15px', borderRadius: '50%' }}
                                    />
                                )}
                                {task?.ticketno !== "" && (
                                    <Chip
                                        label={task?.ticketno || ''}
                                        variant="outlined"
                                        size="small"
                                        sx={{ background: '#d8d8d8', fontSize: '10px', height: '16px', color: '#8863FB' }}
                                    />
                                )}
                                {task?.isnew === 1 && (
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const renderSubtasks = (subtasks, parentTaskId, depth = 0) => {
        return subtasks?.map((subtask) => (
            <React.Fragment key={subtask.taskid}>
                <TableRow sx={{
                    opacity: subtask?.isCopyActive ? '0.7 !important' : '1 !important',
                    pointerEvents: subtask?.isCopyActive ? 'none' : 'auto',
                    cursor: subtask?.isCopyActive ? 'not-allowed' : 'default',
                    backgroundColor: subtask?.isCopyActive
                        ? '#F1EDFE !important'
                        : hoveredSubtaskId === subtask?.taskid
                            ? '#f5f5f5'
                            : expandedTasks[subtask.taskid]
                                ? '#80808030'
                                : 'inherit',
                }}
                    onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid, { Tbcell: 'TaskName' })}
                    onMouseLeave={handleSubtaskMouseLeave}
                    onContextMenu={(e) => handleContextMenu(e, subtask)}
                >
                    <TableCell >
                        <div style={{
                            paddingLeft: `${15 * (depth + 1)}px`,
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            {renderTaskNameSection(
                                subtask,
                                expandedTasks,
                                toggleSubtasks,
                                handleAddTask,
                                hoveredTaskId,
                                hoveredColumnname,
                            )}
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
                        <Box display="flex" alignItems="center" gap={2} width="100%">
                            {!subtask?.isNotShowProgress && (
                                <>
                                    <Box width="100%" position="relative">
                                        <LinearProgress
                                            aria-label="Task progress status"
                                            variant="determinate"
                                            value={subtask?.progress_per}
                                            sx={{
                                                height: 7,
                                                borderRadius: 5,
                                                backgroundColor: "#e0e0e0",
                                                "& .MuiLinearProgress-bar": {
                                                    backgroundColor: getStatusColor(subtask?.progress_per),
                                                },
                                            }}
                                            className="progressBar"
                                        />
                                    </Box>
                                    <Typography className="progressBarText" variant="body2" minWidth={100}>
                                        {`${subtask?.progress_per}%`}
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </TableCell>
                    <TableCell>
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange} disable={false} />
                    </TableCell>
                    <TableCell
                        onMouseEnter={() => handleTaskMouseEnter(subtask?.taskid, { Tbcell: 'Assignee' })}
                        onMouseLeave={handleTaskMouseLeave}>
                        {renderAssigneeAvatars(subtask?.assignee, subtask, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                    </TableCell>
                    <TableCell onClick={(e) => handleDeadlineClick(e, subtask)}>
                        {cleanDate(subtask?.DeadLineDate) ? formatDate2(subtask.DeadLineDate) : '-'}
                    </TableCell>
                    <TableCell>
                        <PriorityBadge task={subtask} priorityColors={priorityColors} onPriorityChange={onPriorityChange} disable={true} />
                    </TableCell>
                    <TableCell>
                        <StatusCircles task={subtask} />
                    </TableCell>
                    <TableCell align="center">
                        {renderTaskActions(subtask, taskTimeRunning, handleTimeTrackModalOpen, handleEditTask, handleViewTask)}
                    </TableCell>
                </TableRow>
                {expandedTasks[subtask.taskid] && renderSubtasks(subtask.subtasks, subtask.taskid, depth + 1)}
            </React.Fragment>
        ));
    };

    return (
        <>
            {(isLoading == null || isLoading == true || (!data && isLoading !== false)) ? (
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
                                {columns?.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            width: column.width,
                                            maxWidth: column.width,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        className={column.id === "actions" ? "sticky-last-col" : ""}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <TableSortLabel
                                                active={
                                                    column.id !== "estimate" &&
                                                    column.id !== "actions" &&
                                                    column.id !== "assignee" &&
                                                    orderBy === column.id
                                                }
                                                direction={order}
                                                onClick={() => {
                                                    if (column.id !== "estimate" && column.id !== "actions") {
                                                        handleRequestSort(column.id);
                                                    }
                                                }}
                                                hideSortIcon={column.id === "estimate" || column.id === "actions" || column.id === "assignee"}
                                            >
                                                {column.label}
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
                                            <TableRow key={taskIndex}
                                                sx={{
                                                    opacity: task?.isCopyActive == true ? "0.7 !important" : "1 !important",
                                                    pointerEvents: task?.isCopyActive ? 'none' : 'auto',
                                                    cursor: task?.isCopyActive ? 'not-allowed' : 'default',
                                                    backgroundColor: task?.isCopyActive == true
                                                        ? '#F1EDFE !important'
                                                        : hoveredTaskId === task?.taskid
                                                            ? '#f5f5f5'
                                                            : expandedTasks[task.taskid]
                                                                ? '#80808030'
                                                                : 'inherit',
                                                }}
                                                onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                onMouseLeave={handleTaskMouseLeave}
                                                onContextMenu={(e) => handleContextMenu(e, task)}
                                            >
                                                <TableCell
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                    onMouseLeave={handleTaskMouseLeave}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        {renderTaskNameSection(
                                                            task,
                                                            expandedTasks,
                                                            toggleSubtasks,
                                                            handleAddTask,
                                                            hoveredTaskId,
                                                            hoveredColumnname,
                                                        )}
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
                                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                                        {!task?.isNotShowProgress && (
                                                            <>
                                                                <Box width="100%" position="relative">
                                                                    <LinearProgress
                                                                        aria-label="Task progress status"
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
                                                                        className="progressBar"
                                                                    />
                                                                </Box>
                                                                <Typography className="progressBarText" variant="body2" minWidth={100}>
                                                                    {`${task?.progress_per}%`}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange} disable={false} />
                                                </TableCell>
                                                <TableCell
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                    onMouseLeave={handleTaskMouseLeave}>
                                                    {renderAssigneeAvatars(task?.assignee, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                                                </TableCell>
                                                <TableCell onClick={(e) => handleDeadlineClick(e, task)}>
                                                    {cleanDate(task?.DeadLineDate) ? formatDate2(task.DeadLineDate) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <PriorityBadge task={task} priorityColors={priorityColors} onPriorityChange={onPriorityChange} disable={true} />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusCircles task={task} />
                                                </TableCell>
                                                <TableCell align="center" className="sticky-last-col">
                                                    {renderTaskActions(task, taskTimeRunning, handleTimeTrackModalOpen, handleEditTask, handleViewTask)}
                                                </TableCell>
                                            </TableRow>
                                            {expandedTasks[task.taskid] && task?.subtasks?.length > 0 && renderSubtasks(task.subtasks, task.taskid)}
                                        </React.Fragment>
                                    ))}
                                </>
                            ) :
                                <TableRow>
                                    <TableCell colSpan={Object?.keys(columns)?.length} >
                                        <Typography variant="body2" p={2} textAlign="center">No matched tasks found.</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                            {!isLoading && data?.length !== 0 &&
                                <TableRow>
                                    <TableCell colSpan={Object?.keys(columns)?.length} >
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

            <CutPasetContextMenu
                contextMenu={contextMenu}
                onClose={handleCloseContextMenu}
                onCopy={handleCopy}
                onPaste={handlePaste}
                copiedData={copiedData}
            />

            <TaskDetail
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
            <SidebarDrawerFile
                open={openfileDrawerOpen}
                onClose={() => setFileDrawerOpen(false)}
            />
            <MenuDatePicker
                label="Select Deadline"
                anchorEl={anchorDeadlineEl}
                open={openDeadline}
                handleClose={handlDeadlineeClose}
                value={selectedItem}
                onChange={handleDeadlineChange} />

        </>
    );
};

export default TableView;

import React, { useCallback, useEffect, useRef, useState } from "react";
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
    Menu,
    MenuItem,
    Select,
    TextareaAutosize,
    Button,
} from "@mui/material";
import { CirclePlus, CloudUpload, Eye, MessageCircleMore, Paperclip, Pencil, PrinterCheck, Timer, Send } from "lucide-react";
import "react-resizable/css/styles.css";
import { useSetRecoilState } from "recoil";
import { assigneeId, fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { cleanDate, formatDate2, getRandomAvatarColor, getStatusColor, ImageUrl, priorityColors, statusColors, getDaysFromDeadline } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssigneeShortcutModal from "../../ShortcutsComponent/Assignee/AssigneeShortcutModal";
import AssigneeAvatarGroup from "../../ShortcutsComponent/Assignee/AssigneeAvatarGroup";
import TaskTimeTracking from "../../ShortcutsComponent/TimerComponent/TaskTimeTracking";
import BurningImage from "../../../Assests/fire.webp";
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import StatusCircles from "../../ShortcutsComponent/EstimateComp";
import ProfileCardModal from "../../ShortcutsComponent/ProfileCard";
import SidebarDrawerFile from "../../ShortcutsComponent/Attachment/SidebarDrawerFile";
import MenuDatePicker from "../../ShortcutsComponent/Date/DeadlineDate";
import PriorityBadge from "../../ShortcutsComponent/PriorityBadge";
import CutPasetContextMenu from "../../ShortcutsComponent/CutPasteMenu";
import CommentMenuPopup from "../../ShortcutsComponent/Comment/CommentMenuPopup";
import MomSheet from "../../PrintSheet/MomSheet";
import MaintenanceSheet from "../../PrintSheet/MaintenanceSheet";
import { useReactToPrint } from "react-to-print";
import { ResizableBox } from "react-resizable";
import { debounce } from "lodash";
import TablePaginationFooter from "../../ShortcutsComponent/Pagination/TablePaginationFooter";
import useAccess from "../../Auth/Role/useAccess";
import { PERMISSIONS } from "../../Auth/Role/permissions";
import { taskCommentGetApi } from "../../../Api/TaskApi/TaskCommentGetApi";

const initialColumns = [
    { id: "taskname", label: "Task Name", width: 280 },
    { id: "taskPr", label: "Project", width: 110 },
    { id: "progress", label: "Progress", width: 90 },
    { id: "status", label: "Status", width: 100 },
    { id: "secStatus", label: "What Next", width: 100 },
    { id: "assignee", label: "Assignee", width: 100 },
    { id: "DeadLineDate", label: "Deadline", width: 90 },
    { id: "priority", label: "Priority", width: 80 },
    { id: "estimate", label: "Estimate", width: 70 },
    { id: "actions", label: "Actions", width: 165 },
];

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
    handlePageSizeChnage,
    isLoading }) => {
    const { hasAccess } = useAccess();
    const [anchorPrintEl, setAnchorPrintEl] = useState(null);
    const [anchorCommentEl, setAnchorCommentEl] = useState(null);
    const printRef1 = React.useRef(null);
    const printRef2 = React.useRef(null);
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
    const [columns, setColumns] = useState(initialColumns);
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [openAssigneeModal, setOpenAssigneeModal] = useState(false);
    const [timeTrackMOpen, setTimeTrackMOpen] = useState(false);
    const [taskTimeRunning, setTaskTimeRunning] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const [anchorDeadlineEl, setAnchorDeadlineEl] = useState(null);
    const [isHoveredResizable, setIsHoveredResizable] = useState(false);
    const [resizingColumnId, setResizingColumnId] = useState(null);

    const handleDeadlineClick = (e, task, access) => {
        if (access) return;
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

    // Helper function to format days display
    const formatDaysDisplay = (deadlineDate, task) => {
        const days = getDaysFromDeadline(deadlineDate);
        
        if (days === null || !cleanDate(deadlineDate)) {
            return <span>-</span>; // No deadline set
        }
        
        const formattedDate = formatDate2(deadlineDate);
        
        // Check if task is completed
        const isCompleted = task?.status?.toLowerCase() === 'completed' || task?.progress_per === 100;
        
        // Determine chip color based on status and days
        let chipColor, chipBgColor, displayText;
        
        if (isCompleted) {
            // For completed tasks, compare EndDate with DeadLineDate
            if (task?.EndDate && cleanDate(task?.EndDate)) {
                const endDate = new Date(task.EndDate);
                const deadline = new Date(deadlineDate);
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                const deadlineOnly = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
                
                if (endDateOnly.getTime() === deadlineOnly.getTime()) {
                    // Completed on time (same date)
                    chipColor = '#388e3c';
                    chipBgColor = '#dcedc8';
                    displayText = 'On Time';
                } else if (endDateOnly < deadlineOnly) {
                    // Completed before deadline (early) - calculate days early
                    const diffMs = deadlineOnly - endDateOnly;
                    const daysEarly = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    chipColor = '#388e3c';
                    chipBgColor = '#dcedc8';
                    displayText = `${daysEarly} days early`;
                } else {
                    // Completed after deadline (late) - calculate days late
                    const diffMs = endDateOnly - deadlineOnly;
                    const daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    chipColor = '#d32f2f';
                    chipBgColor = '#ffcdd2';
                    displayText = `${daysLate} days late`;
                }
            } else {
                // Completed but no end date
                chipColor = '#388e3c';
                chipBgColor = '#dcedc8';
                displayText = 'Completed';
            }
        } else if (days < 0) {
            // Overdue - Red
            chipColor = '#d32f2f';
            chipBgColor = '#ffcdd2';
            displayText = `${Math.abs(days)} days overdue`;
        } else if (days === 0) {
            // Today - Green
            chipColor = '#388e3c';
            chipBgColor = '#dcedc8';
            displayText = 'Today';
        } else {
            // Future - Blue
            chipColor = '#1976d2';
            chipBgColor = '#bbdefb';
            displayText = `${days} days`;
        }
        
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <span style={{ fontSize: '13px', lineHeight: '1.2' }}>{formattedDate}</span>
                <Chip
                    label={displayText}
                    size="small"
                    sx={{
                        backgroundColor: chipBgColor,
                        color: chipColor,
                        fontSize: '10px',
                        height: '16px',
                        '& .MuiChip-label': {
                            padding: '0 4px',
                            fontWeight: '500'
                        }
                    }}
                />
            </div>
        );
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
            breadcrumbTitles: task?.breadcrumbTitles
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
            breadcrumbTitles: subtask?.breadcrumbTitles
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

    const handleOpenPrintMenu = (event, task) => {
        setAnchorPrintEl(event.currentTarget);
        setSelectedItem(task);
    };

    const handleClosePrintMenu = () => {
        setAnchorPrintEl(null);
    };

    const handleOpenCommentProver = async (event, task) => {
        setAnchorCommentEl(event.currentTarget);
        
        try {
            // Fetch comments for the selected task
            const taskComment = await taskCommentGetApi(task);
            const assigneesMaster = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));

            if (taskComment) {
                const cleanedComments = taskComment.rd.map(comment => ({
                    ...comment,
                    id: comment?.id,
                    user: comment?.user,
                    assignee: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                    attachments: comment?.attachments || []
                }));

                // Set the selected item with comments
                setSelectedItem({
                    ...task,
                    comments: cleanedComments
                });
            } else {
                setSelectedItem({
                    ...task,
                    comments: []
                });
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setSelectedItem({
                ...task,
                comments: []
            });
        }
    };

    const handleCloseCommentMenu = () => {
        setAnchorCommentEl(null);
    };

    const handleCommentAdded = (updatedComments) => {
        // Update the selected item with new comments
        setSelectedItem(prev => ({
            ...prev,
            comments: updatedComments
        }));
    };

    const handleViewAllComments = (task) => {
        // Open task detail drawer to show all comments
        setTaskDetailModalOpen(true);
        setSelectedTask(task);
    };

    const handlePrintA = useReactToPrint({
        contentRef: printRef1,
        documentTitle: "AwesomeFileName",
    });

    const handlePrintB = useReactToPrint({
        contentRef: printRef2,
        documentTitle: "AwesomeFileName",
    });

    const printOptions = [
        {
            label: "MOM Sheet",
            onClick: handlePrintA,
        },
        {
            label: "Maintenance Sheet",
            onClick: handlePrintB,
        },
    ];

    const handleOpenFileDrawer = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFileDrawerOpen(true);
        setSelectedTask(task);
    }

    const onStatusChange = (task, newStatus, flag) => {
        handleStatusChange(task, newStatus, flag);
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
        <AssigneeAvatarGroup
            assignees={assignees}
            task={task}
            maxVisible={3}
            showAddButton={true}
            hoveredTaskId={hoveredTaskId}
            hoveredColumnName={hoveredColumnname}
            onAvatarClick={hanldePAvatarClick}
            onAddClick={(task) => handleAssigneeShortcut(task, { Task: 'root' })}
            size={30}
            spacing={0.5}
        />
    );

    const renderTaskActions = (
        task,
        taskTimeRunning,
        handleTimeTrackModalOpen,
        handleEditTask,
        handleViewTask
    ) => {
        const access = task?.isparentfreeze == 1
        return (
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
                    aria-label="print mom and maintenance Sheet button"
                    onClick={(event) => handleOpenPrintMenu(event, task)}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <PrinterCheck size={20} className="iconbtn" />
                </IconButton>
                <IconButton
                    disabled={access}
                    aria-label="Comment button"
                    onClick={(event) => handleOpenCommentProver(event, task)}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <MessageCircleMore 
                        size={20}
                        color={access ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                        className="iconbtn"
                    />
                </IconButton>
                <IconButton
                    disabled={access}
                    aria-label="View Module button"
                    onClick={() => handleOpenFileDrawer(task, { Task: "root" })}
                    sx={{
                        '&.Mui-disabled': {
                            color: 'rgba(0, 0, 0, 0.26)',
                        },
                    }}
                >
                    <CloudUpload 
                        size={20}
                        color={access ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                        className="iconbtn"
                    />
                </IconButton>
                <IconButton
                    disabled={access || (task?.parentid === 0 && !hasAccess(PERMISSIONS.canEditPrModule))}
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
                        color={(access || (task?.parentid === 0 && !hasAccess(PERMISSIONS.canEditPrModule))) ? "rgba(0, 0, 0, 0.26)" : "#808080"}
                        className="iconbtn"
                    />
                </IconButton>
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
        )
    };

    const renderTaskNameSection = (
        task,
        expandedTasks,
        toggleSubtasks,
        handleAddTask,
        hoveredTaskId,
        hoveredColumnname,
        isResizing = false,
        paddingLeft = 0
    ) => {
        return (
            <div style={{ paddingLeft: `${paddingLeft}px`, width: '100%' }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: '1px' }}>
                        <IconButton
                            id="toggle-task"
                            aria-label="toggle-task"
                            size="small"
                            onClick={() => toggleSubtasks(task.taskid, task)}
                            sx={{
                                padding: '2px',
                                margin: '0'
                            }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', maxWidth: `${columns[0]?.width}` }} title={task?.taskname}>
                            <span
                                style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    lineHeight: '1.2em',
                                    maxHeight: '2.4em',
                                    fontSize: '14px',
                                }}
                                className={`tasknameCl ${task?.isCopyActive ? 'cut-task-name' : ''}`}
                            >
                                {task?.taskname}
                            </span>
                            {task?.subtasks?.length > 0 && (
                                <span className="task-sub_count">
                                    {task?.subtasks?.length}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {task?.isburning === 1 && (
                                <img
                                    src={BurningImage}
                                    alt="burningTask"
                                    style={{ width: '15px', height: '15px', borderRadius: '50%' }}
                                />
                            )}
                            {task?.ticketno && (
                                <Chip
                                    label={task.ticketno}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        background: '#d8d8d8',
                                        fontSize: '10px',
                                        height: '16px',
                                        color: '#8863FB',
                                    }}
                                />
                            )}
                            {task?.isnew === 1 && (
                                <Chip
                                    label="New"
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
                    <IconButton
                        id="add-task"
                        aria-label="add-task"
                        size="small"
                        onClick={() => handleAddTask(task, { Task: 'subroot' })}
                        style={{
                            visibility:
                                hoveredTaskId === task?.taskid && hoveredColumnname === 'TaskName'
                                    ? 'visible'
                                    : 'hidden',
                        }}
                    >
                        <CirclePlus size={20} color="#7367f0" />
                    </IconButton>
                </div>
            </div>
        );
    };

    const renderTaskProgressBar = (progress = 0, isHidden = false) => {
        if (isHidden) return null;
        return (
            <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box mx={1} flex={8} position="relative">
                    <Tooltip title={`${progress}%`} arrow placement="top" classes={{ tooltip: "custom-tooltip" }}>
                        <LinearProgress
                            aria-label="Task progress status"
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 7,
                                borderRadius: 5,
                                backgroundColor: "#e0e0e0",
                                cursor: 'pointer',
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: getStatusColor(progress),
                                },
                            }}
                            className="progressBar"
                        />
                    </Tooltip>
                </Box>
            </Box>
        );
    };

    const renderSubtasks = (subtasks, parentTaskId, depth = 0) => {
        return subtasks?.map((subtask) => (
            <React.Fragment key={subtask.taskid}>
                <TableRow
                    className={subtask?.isCopyActive ? 'cut-task-row' : ''}
                    sx={{
                        pointerEvents: subtask?.isCopyActive ? 'none' : 'auto',
                        cursor: subtask?.isCopyActive ? 'not-allowed' : 'default',
                        backgroundColor: !subtask?.isCopyActive && (
                            hoveredSubtaskId === subtask?.taskid
                                ? '#f5f5f5'
                                : expandedTasks[subtask.taskid]
                                    ? '#f5f5f5'
                                    : 'inherit'
                        ),
                        '&:hover': {
                            backgroundColor: !subtask?.isCopyActive ? '#f8f9fa' : 'inherit'
                        }
                    }}
                    onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid, { Tbcell: 'TaskName' })}
                    onMouseLeave={handleSubtaskMouseLeave}
                    onContextMenu={(e) => handleContextMenu(e, subtask)}
                >
                    <TableCell >
                        <div style={{
                            paddingLeft: `${1 * (depth + 1)}px`,
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
                                false,
                                `${15 * (depth + 1)}`
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
                    <TableCell className="taskPriorityCell" title={subtask?.taskPr}>{subtask?.taskPr}</TableCell>
                    <TableCell>
                        {renderTaskProgressBar(subtask?.progress_per, subtask?.isNotShowProgress)}
                    </TableCell>
                    <TableCell>
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange} disable={false} />
                    </TableCell>
                    <TableCell>
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange} disable={false} flag="secondaryStatus" />
                    </TableCell>
                    <TableCell
                        onMouseEnter={() => handleTaskMouseEnter(subtask?.taskid, { Tbcell: 'Assignee' })}
                        onMouseLeave={handleTaskMouseLeave}>
                        {renderAssigneeAvatars(subtask?.assignee, subtask, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                    </TableCell>
                    <TableCell 
                        data-deadline-column="true"
                        onClick={(e) => handleDeadlineClick(e, subtask)}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                                borderRadius: '4px'
                            },
                            transition: 'background-color 0.2s ease',
                            padding: '8px 16px'
                        }}
                    >
                        {formatDaysDisplay(subtask?.DeadLineDate, subtask)}
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

    const debouncedHandleResize = useCallback(
        debounce((id, width) => {
            setColumns((prev) =>
                prev.map((col) => (col.id === id ? { ...col, width } : col))
            );
        }, 16),
        []
    );

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
                    <Table size="small" aria-label="task details" sx={{ tableLayout: "fixed", width: "100%" }}>
                        <TableHead className="sticky-table-head">
                            <TableRow>
                                {columns?.map((column, index) => (
                                    <TableCell
                                        key={column.id}
                                        className={column.id === 'actions' ? 'sticky-action-column' : ''}
                                        style={{
                                            width: `${column.width}px`,
                                            minWidth: `${column.width}px`,
                                            maxWidth: `${column.width}px`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <ResizableBox
                                            width={column.width}
                                            height={20}
                                            axis="x"
                                            resizeHandles={index !== columns.length - 1 ? ["e"] : []}
                                            minConstraints={[80, 20]}
                                            maxConstraints={[500, 20]}
                                            onResizeStart={() => setResizingColumnId(column.id)}
                                            onResize={(e, data) => {
                                                debouncedHandleResize(column.id, data.size.width);
                                            }}
                                            style={{
                                                minWidth: '100%'
                                            }}
                                            handle={
                                                index !== columns.length - 1 && (
                                                    <span
                                                        className="resize-handle"
                                                        style={{
                                                            position: "absolute",
                                                            right: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width:
                                                                isHoveredResizable === column.id || resizingColumnId === column.id
                                                                    ? "4px"
                                                                    : "2px",
                                                            background:
                                                                isHoveredResizable === column.id || resizingColumnId === column.id
                                                                    ? "#7367f0"
                                                                    : "#e0e0e0",
                                                            cursor: "col-resize",
                                                            zIndex: 2,
                                                        }}
                                                        onMouseEnter={() => setIsHoveredResizable(column.id)}
                                                        onMouseLeave={() => setIsHoveredResizable(null)}
                                                    />
                                                )
                                            }
                                        >
                                            <div
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    padding: "0px 0px 0px 10px",
                                                    boxSizing: "border-box",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    fontWeight: 600,
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
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
                                            </div>
                                        </ResizableBox>
                                    </TableCell>

                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data && data?.length !== 0 ? (
                                <>
                                    {currentData?.map((task, taskIndex) => {
                                        const access = task?.isparentfreeze == 1;
                                        return (
                                            <React.Fragment key={taskIndex}>
                                                <TableRow key={taskIndex}
                                                    className={task?.isCopyActive ? 'cut-task-row' : ''}
                                                    sx={{
                                                        pointerEvents: task?.isCopyActive ? 'none' : 'auto',
                                                        cursor: task?.isCopyActive ? 'not-allowed' : 'default',
                                                        backgroundColor: !task?.isCopyActive && (
                                                            hoveredTaskId === task?.taskid
                                                                ? '#f5f5f5'
                                                                : expandedTasks[task.taskid]
                                                                    ? '#f5f5f5'
                                                                    : 'inherit'
                                                        ),
                                                        '&:hover': {
                                                            backgroundColor: !task?.isCopyActive ? '#f8f9fa' : 'inherit'
                                                        }
                                                    }}
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                    onMouseLeave={handleTaskMouseLeave}
                                                    onContextMenu={(e) => handleContextMenu(e, task)}
                                                >
                                                    <TableCell
                                                        onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                        onMouseLeave={handleTaskMouseLeave}
                                                    >
                                                        {renderTaskNameSection(
                                                            task,
                                                            expandedTasks,
                                                            toggleSubtasks,
                                                            handleAddTask,
                                                            hoveredTaskId,
                                                            hoveredColumnname,
                                                            resizingColumnId === 'task'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="taskPriorityCell" title={task?.taskPr}>{task?.taskPr}</TableCell>
                                                    <TableCell>
                                                        {renderTaskProgressBar(
                                                            task?.progress_per,
                                                            task?.isNotShowProgress,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange} disable={access ? true : false} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange} disable={access ? true : false} flag="secondaryStatus" />
                                                    </TableCell>
                                                    <TableCell
                                                        onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                        onMouseLeave={handleTaskMouseLeave}>
                                                        {renderAssigneeAvatars(task?.assignee, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                                                    </TableCell>
                                                    <TableCell 
                                                        data-deadline-column="true"
                                                        onClick={(e) => handleDeadlineClick(e, task, access)} 
                                                        sx={{ 
                                                            cursor: access ? 'default' : 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: access ? 'inherit' : '#e3f2fd',
                                                                borderRadius: '4px'
                                                            },
                                                            transition: 'background-color 0.2s ease',
                                                            padding: '8px 16px'
                                                        }}
                                                    >
                                                        {formatDaysDisplay(task?.DeadLineDate, task)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <PriorityBadge task={task} priorityColors={priorityColors} onPriorityChange={onPriorityChange} disable={access ? true : false} />
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
                                        )
                                    })}
                                </>
                            ) :
                                <TableRow>
                                    <TableCell colSpan={Object?.keys(columns)?.length} >
                                        <Typography variant="body2" p={2} textAlign="center">No matched tasks found.</Typography>
                                    </TableCell>
                                </TableRow>
                            }
                            {!isLoading && data?.length !== 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                        {currentData?.length !== 0 && (
                                            <TablePaginationFooter
                                                page={page}
                                                rowsPerPage={rowsPerPage}
                                                totalCount={data?.length}
                                                totalPages={totalPages}
                                                onPageChange={handleChangePage}
                                                onPageSizeChange={handlePageSizeChnage}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}

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

            <Menu
                anchorEl={anchorPrintEl}
                open={Boolean(anchorPrintEl)}
                onClose={handleClosePrintMenu}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "8px !important",
                            boxShadow:
                                "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
                            '& "MuiList-root': {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                            },
                        },
                    },
                }}
            >
                {printOptions?.map((option, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => {
                            option.onClick();
                            handleClosePrintMenu();
                        }}
                        sx={{
                            margin: "5px 10px !important",
                            borderRadius: "8px !important",
                            "&:hover": {
                                backgroundColor: "#f0f0f0 !important",
                                borderRadius: "8px !important",
                            },
                        }}
                    >
                        <Typography fontSize={14} variant="body1">
                            {option.label}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>

            <CommentMenuPopup
                anchorEl={anchorCommentEl}
                open={Boolean(anchorCommentEl)}
                onClose={handleCloseCommentMenu}
                selectedTask={selectedItem}
                onCommentAdded={handleCommentAdded}
                onViewAllComments={handleViewAllComments}
            />

            <div style={{ display: 'none' }}>
                <MomSheet selectedData={selectedItem} ref={printRef1} />
                <MaintenanceSheet selectedData={selectedItem} ref={printRef2} />
            </div>

        </>
    );
};

export default TableView;

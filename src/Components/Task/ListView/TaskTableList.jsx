import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    Chip,
    Tooltip,
    LinearProgress,
    Skeleton,
    Menu,
    MenuItem,
} from "@mui/material";
import { Archive, ArchiveRestore, CirclePlus, CloudUpload, Eye, MessageCircleMore, Pencil, PrinterCheck, Star, Undo2 } from "lucide-react";
import "react-resizable/css/styles.css";
import { useSetRecoilState } from "recoil";
import { assigneeId, fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { getArchiveChipStyles, getArchiveInfoFromEndDate, getRandomAvatarColor, getStatusColor, priorityColors, statusColors, formatDaysDisplay, getAuthData, getUserProfileData } from "../../../Utils/globalfun";
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
import DocumentSheet from "../../PrintSheet/DocumentSheet";
import useSafeRedirect from "../../../Utils/useSafeRedirect";
import { toast } from "react-toastify";
import { taskRestoreApi } from "../../../Api/TaskApi/TaskRestoreApi";
import ConfirmationDialog from "../../../Utils/ConfirmationDialog/ConfirmationDialog";
import { taskArchiveApi } from "../../../Api/TaskApi/TaskArchiveApi";

const collectDescendantIds = (task) => {
    const ids = [];
    const visit = (t) => {
        const id = t?.taskid;
        if (id != null && id !== '' && !ids.includes(id)) {
            ids.push(id);
        }
        const children = Array.isArray(t?.subtasks) ? t.subtasks : [];
        children.forEach(visit);
    };
    visit(task);
    return ids;
};

const ArchiveRestoreButton = ({ task, setSelectedArchiveTask, setConfirmArchiveOpen, setArchivingIds, setSelectedUnarchiveTask, setConfirmUnarchiveOpen, setRestoringIds, hasAccess, PERMISSIONS }) => {
    const isCompleted = (task?.status || '').toString().trim().toLowerCase() === 'completed';
    const isArchived = !!task?.Completion_timestamp;

    if (isArchived) {
        return (
            <Tooltip title="Unarchive" arrow placement="top">
                <IconButton
                    onClick={() => {
                        setSelectedUnarchiveTask(task);
                        setConfirmUnarchiveOpen(true);
                        setRestoringIds(new Set(collectDescendantIds(task)));
                    }}
                >
                    <ArchiveRestore size={20} className="iconbtn" />
                </IconButton>
            </Tooltip>
        );
    } else if (isCompleted) {
        return (
            <Tooltip title="Archive" arrow placement="top">
                <IconButton
                    onClick={() => {
                        setSelectedArchiveTask(task);
                        setConfirmArchiveOpen(true);
                        setArchivingIds(new Set(collectDescendantIds(task)));
                    }}
                >
                    <Archive size={20} className="iconbtn" />
                </IconButton>
            </Tooltip>
        );
    }
    return null;
};

const findPathToTask = (tasks = [], targetId) => {
    if (!Array.isArray(tasks) || targetId == null) return null;
    for (const t of tasks) {
        if (t?.taskid === targetId) return [t];
        const childPath = findPathToTask(t?.subtasks || [], targetId);
        if (childPath) return [t, ...childPath];
    }
    return null;
};

const initialColumns = [
    { id: "taskname", label: "Task Name", width: 310 },
    { id: "taskPr", label: "Project", width: 110 },
    { id: "progress", label: "Progress", width: 80 },
    { id: "status", label: "Status", width: 100 },
    { id: "secStatus", label: "What Next", width: 100 },
    { id: "assignee", label: "Assignee", width: 100 },
    { id: "DeadLineDate", label: "Deadline", width: 80 },
    { id: "priority", label: "Priority", width: 80 },
    { id: "estimate", label: "Estimate", width: 70 },
    { id: "actions", label: "Actions", width: 150 },
];

const INITIAL_SUBTASK_BATCH = 220;
const SUBTASK_BATCH_STEP = 320;
const MAX_SKELETON_ROWS = 6;


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
    handlePrintCount,
    isLoading }) => {
    const { hasAccess } = useAccess();
    const navigate = useSafeRedirect();
    const [anchorPrintEl, setAnchorPrintEl] = useState(null);

    // Handle project navigation
    const handleProjectClick = (task) => {
        if (task?.projectid) {
            navigate('/projects');
        }
    };

    const [anchorCommentEl, setAnchorCommentEl] = useState(null);
    const printRef1 = React.useRef(null);
    const printRef2 = React.useRef(null);
    const printRef3 = React.useRef(null);
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
    const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false);
    const [selectedUnarchiveTask, setSelectedUnarchiveTask] = useState(null);
    const [restoringIds, setRestoringIds] = useState(() => new Set());
    const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
    const [selectedArchiveTask, setSelectedArchiveTask] = useState(null);
    const [archivingIds, setArchivingIds] = useState(() => new Set());
    const [taskTimeRunning, setTaskTimeRunning] = useState({});
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileTaskId, setProfileTaskId] = useState("");
    const [anchorDeadlineEl, setAnchorDeadlineEl] = useState(null);
    const [isHoveredResizable, setIsHoveredResizable] = useState(false);
    const [resizingColumnId, setResizingColumnId] = useState(null);
    const [subtaskRenderLimits, setSubtaskRenderLimits] = useState({});
    const [subtaskLoadingByRoot, setSubtaskLoadingByRoot] = useState({});

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
        setSelectedItem(prev => ({
            ...prev,
            comments: updatedComments
        }));
    };

    const handleViewAllComments = (task) => {
        setTaskDetailModalOpen(true);
        setSelectedTask(task);
    };

    const handlePrintA = useReactToPrint({
        contentRef: printRef1,
        documentTitle: "MOMSheet",
        onAfterPrint: async () => {
            if (selectedItem && selectedItem.taskid) {
                await handlePrintCount(selectedItem);
            }
        }
    });

    const handlePrintB = useReactToPrint({
        contentRef: printRef2,
        documentTitle: "MaintenanceSheet",
        onAfterPrint: async () => {
            if (selectedItem && selectedItem.taskid) {
                await handlePrintCount(selectedItem);
            }
        }
    });

    const handlePrintC = useReactToPrint({
        contentRef: printRef3,
        documentTitle: "DocumentSheet",
        onAfterPrint: async () => {
            if (selectedItem && selectedItem.taskid) {
                await handlePrintCount(selectedItem);
            }
        }
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
        {
            label: "Document Sheet",
            onClick: handlePrintC,
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

    const hanldePAvatarClick = (task, clickedAssigneeId, assignees) => {
        setAssigneeId(clickedAssigneeId);
        setSelectedItem(Array.isArray(assignees) ? assignees : []);
        setProfileTaskId(task?.taskid ?? "");
        setProfileOpen(true);
    }

    const handleProfileRemoved = (removedAssigneeId) => {
        setSelectedItem((prev) =>
            Array.isArray(prev)
                ? prev.filter((a) => String(a?.id) !== String(removedAssigneeId))
                : prev
        );
        setOpenChildTask(Date.now());
    };

    const handleAssigneSubmit = (updatedRowData) => {
        handleAssigneeShortcutSubmit(updatedRowData)
    }

    const toggleSubtasks = (taskId, task) => {
        setExpandedTasks((prevExpanded) => {
            const isCurrentlyExpanded = !!prevExpanded[taskId];

            setSubtaskRenderLimits((prevLimits) => {
                const next = { ...prevLimits };
                if (!isCurrentlyExpanded) {
                    next[taskId] = INITIAL_SUBTASK_BATCH;
                } else {
                    delete next[taskId];
                }
                return next;
            });

            return { ...prevExpanded, [taskId]: !isCurrentlyExpanded };
        });

        setSubtaskLoadingByRoot((prev) => {
            const next = { ...prev };
            const isCurrentlyExpanded = !!expandedTasks[taskId];
            if (!isCurrentlyExpanded) {
                const totalSubtasks = Array.isArray(task?.subtasks) ? task.subtasks.length : 0;
                next[taskId] = totalSubtasks > INITIAL_SUBTASK_BATCH;
            } else {
                delete next[taskId];
            }
            return next;
        });
    };

    const visibleSubtasksByRoot = useMemo(() => {
        const map = new Map();

        const collectVisibleSubtasks = (subtasks, parentTask, depth = 0, acc = []) => {
            const parentArchiveInfo = parentTask?.Completion_timestamp ? getArchiveInfoFromEndDate(parentTask, 7) : null;
            const parentArchived = !!parentTask?.Completion_timestamp;

            (subtasks || []).forEach((subtask) => {
                acc.push({
                    subtask,
                    depth,
                    parentArchiveInfo,
                    parentArchived,
                });

                if (expandedTasks[subtask.taskid] && subtask?.subtasks?.length > 0) {
                    collectVisibleSubtasks(subtask.subtasks, subtask, depth + 1, acc);
                }
            });

            return acc;
        };

        (currentData || []).forEach((task) => {
            if (expandedTasks[task.taskid] && task?.subtasks?.length > 0) {
                map.set(task.taskid, collectVisibleSubtasks(task.subtasks, task));
            } else {
                map.set(task.taskid, []);
            }
        });

        return map;
    }, [currentData, expandedTasks]);

    useEffect(() => {
        setSubtaskRenderLimits((prev) => {
            const activeExpandedIds = new Set(
                Object.keys(expandedTasks || {}).filter((id) => expandedTasks[id])
            );
            const next = {};
            let changed = false;

            Object.entries(prev).forEach(([taskId, limit]) => {
                if (activeExpandedIds.has(taskId)) {
                    next[taskId] = limit;
                } else {
                    changed = true;
                }
            });

            return changed ? next : prev;
        });
    }, [expandedTasks]);

    useEffect(() => {
        setSubtaskLoadingByRoot((prev) => {
            const next = {};
            let changed = false;

            (currentData || []).forEach((task) => {
                if (!expandedTasks?.[task.taskid]) return;
                const taskId = task.taskid;
                const totalVisibleRows = (visibleSubtasksByRoot.get(taskId) || []).length;
                const currentLimit = subtaskRenderLimits[taskId] || INITIAL_SUBTASK_BATCH;
                const isLoading = currentLimit < totalVisibleRows;
                next[taskId] = isLoading;

                if (prev[taskId] !== isLoading) {
                    changed = true;
                }
            });

            if (Object.keys(prev).length !== Object.keys(next).length) {
                changed = true;
            }

            return changed ? next : prev;
        });
    }, [expandedTasks, subtaskRenderLimits, visibleSubtasksByRoot, currentData]);

    useEffect(() => {
        if (!currentData?.length) return;

        const expandedRootTasks = currentData.filter((task) => expandedTasks[task.taskid]);
        if (expandedRootTasks.length === 0) return;

        let cancelled = false;
        let frameId = null;

        const growVisibleRows = () => {
            if (cancelled) return;

            let hasPendingRows = false;

            setSubtaskRenderLimits((prev) => {
                let next = prev;

                expandedRootTasks.forEach((task) => {
                    const taskId = task.taskid;
                    const totalVisibleRows = (visibleSubtasksByRoot.get(taskId) || []).length;
                    if (!totalVisibleRows) return;

                    const currentLimit = prev[taskId] || INITIAL_SUBTASK_BATCH;
                    if (currentLimit < totalVisibleRows) {
                        hasPendingRows = true;
                        if (next === prev) {
                            next = { ...prev };
                        }
                        next[taskId] = Math.min(totalVisibleRows, currentLimit + SUBTASK_BATCH_STEP);
                    }
                });

                return next;
            });

            if (hasPendingRows && !cancelled) {
                frameId = requestAnimationFrame(growVisibleRows);
            }
        };

        frameId = requestAnimationFrame(growVisibleRows);

        return () => {
            cancelled = true;
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
        };
    }, [currentData, expandedTasks, visibleSubtasksByRoot]);

    const handleAssigneeShortcut = (task, additionalInfo) => {
        setSelectedItem(task);
        setRootSubroot(additionalInfo);
        setOpenAssigneeModal(true);
    }

    const handleCloseAssigneeModal = () => {
        setOpenAssigneeModal(false);
        setSelectedItem(null);
    }

    const renderAssigneeAvatars = (assignees, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut, showAddButton = true) => (
        <AssigneeAvatarGroup
            assignees={assignees}
            task={task}
            maxVisible={3}
            showAddButton={showAddButton}
            hoveredTaskId={hoveredTaskId}
            hoveredColumnName={hoveredColumnname}
            onAvatarClick={(assigneesList, clickedId) => hanldePAvatarClick(task, clickedId, assigneesList)}
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
        // ===== FLAGS =====
        const isParentFrozen = task?.isFreez == 1;
        const hasTaskActionAccess = hasAccess(PERMISSIONS.canTaskActions);
        const isAdmin = getUserProfileData()?.designation?.toLowerCase() === "admin";
        const isFullAccess = hasTaskActionAccess || isAdmin;

        const isArchived = (task?.status || '').toString().trim().toLowerCase() === 'completed' && task?.Completion_timestamp != null;
        const isCompleted = (task?.status || '').toString().trim().toLowerCase() === 'completed';

        const authData = getAuthData();
        const loginUserId = authData?.uid;
        const currentUserAssignee = task?.assignee?.find(a => a.userid == loginUserId || a.id == loginUserId);
        const isAssignee = !!currentUserAssignee;
        const isReadOnlyUser = currentUserAssignee?.isreadonly === 1;

        // ===== PERMISSIONS (PRIORITY BASED) =====
        const canTimeTrack =
            (isFullAccess
                ? true
                : isAssignee && !isParentFrozen && !isReadOnlyUser);

        const canPrint =
            (isFullAccess
                ? true
                : isAssignee && !isParentFrozen && !isReadOnlyUser);

        const canComment =
            (isFullAccess
                ? true
                : isAssignee && !isParentFrozen && !isReadOnlyUser);

        const canUpload =
            (isFullAccess
                ? true
                : isAssignee && !isParentFrozen && !isReadOnlyUser);

        const canEdit =
            (isFullAccess
                ? true
                : isAssignee && !isParentFrozen && !isReadOnlyUser);

        // ===== COLORS =====
        const disabledColor = "rgba(0, 0, 0, 0.26)";
        const activeColor = "#808080";
        const iconColor = (enabled) => (enabled ? activeColor : disabledColor);
        const isRestoring = restoringIds.has(task?.taskid);
        const isArchiving = archivingIds.has(task?.taskid);

        if (isArchived) {
            if (task?.taskno != '') {
                return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            onClick={() => {
                                if (isRestoring) return;
                                setSelectedUnarchiveTask(task);
                                setConfirmUnarchiveOpen(true);
                            }}
                            disabled={isRestoring}
                        >
                            <ArchiveRestore size={20} className="iconbtn" color={isRestoring ? disabledColor : activeColor} />
                        </IconButton>
                        <IconButton onClick={() => handleViewTask(task, { Task: "root" })}>
                            <Eye size={20} className="iconbtn" color={activeColor} />
                        </IconButton>
                    </Box>
                );
            } else {
                return (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => handleViewTask(task, { Task: "root" })}>
                            <Eye size={20} className="iconbtn" color={activeColor} />
                        </IconButton>
                    </Box>
                );
            }
        }

        return (
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Time Track */}
                {/* <IconButton
                    onClick={() => handleTimeTrackModalOpen(task)}
                    disabled={!canTimeTrack}
                >
                    <Timer size={20} className="iconbtn" color={iconColor(canTimeTrack)} />
                </IconButton> */}


                {/* Print */}
                <div className="print-btn-wrapper">
                    <IconButton
                        onClick={(e) => handleOpenPrintMenu(e, task)}
                        disabled={!canPrint}
                        className={task?.print_count > 0 ? 'print-highlighted' : ''}
                    >
                        <PrinterCheck
                            size={20}
                            className="iconbtn"
                            color={task?.print_count > 0 ? "#388e3c" : iconColor(canPrint)}
                        />
                    </IconButton>
                    {task?.print_count > 0 && (
                        <span className="print-count-outside">{task.print_count}</span>
                    )}
                </div>

                {/* Comment */}
                <IconButton
                    onClick={(e) => handleOpenCommentProver(e, task)}
                    disabled={!canComment}
                >
                    <MessageCircleMore size={20} className="iconbtn" color={iconColor(canComment)} />
                </IconButton>

                {/* Upload */}
                <IconButton
                    onClick={() => handleOpenFileDrawer(task, { Task: "root" })}
                    disabled={!canUpload}
                >
                    <CloudUpload size={20} className="iconbtn" color={iconColor(canUpload)} />
                </IconButton>

                {/* Edit */}
                <IconButton
                    onClick={() => handleEditTask(task, { Task: "root" })}
                    disabled={!canEdit}
                >
                    <Pencil size={20} className="iconbtn" color={iconColor(canEdit)} />
                </IconButton>

                {/* View (ALWAYS ENABLED) */}
                <IconButton onClick={() => handleViewTask(task, { Task: "root" })}>
                    <Eye size={20} className="iconbtn" color={activeColor} />
                </IconButton>
            </Box>
        );
    };

    const renderSubtaskSkeletonRows = (taskId) => {
        const totalVisibleRows = (visibleSubtasksByRoot.get(taskId) || []).length;
        const currentLimit = subtaskRenderLimits[taskId] || INITIAL_SUBTASK_BATCH;
        const remainingRows = Math.max(totalVisibleRows - currentLimit, 0);
        const skeletonRows = Math.min(remainingRows, MAX_SKELETON_ROWS);

        if (!subtaskLoadingByRoot[taskId] || skeletonRows <= 0) return null;

        return Array.from({ length: skeletonRows }).map((_, idx) => (
            <TableRow key={`subtask-skeleton-${taskId}-${idx}`}>
                <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={8} width="90%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={24} width="85%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={24} width="85%" /></TableCell>
                <TableCell><Skeleton variant="circular" width={24} height={24} /></TableCell>
                <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={24} width="75%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={14} width="65%" /></TableCell>
                <TableCell><Skeleton variant="rounded" height={24} width="90%" /></TableCell>
            </TableRow>
        ));
    };

    const renderTaskNameSection = (
        task,
        expandedTasks,
        toggleSubtasks,
        handleAddTask,
        hoveredTaskId,
        hoveredColumnname,
        isResizing = false,
        paddingLeft = 0,
        parentArchiveInfo = null,
        parentArchived = false,
        handleTaskFavorite = null
    ) => {
        const ownArchiveInfo = task?.Completion_timestamp ? getArchiveInfoFromEndDate(task, 7) : null;
        const archiveInfo = ownArchiveInfo || parentArchiveInfo;
        const isCompleted = (task?.status || "").toString().trim().toLowerCase() === 'completed' && task?.Completion_timestamp;
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
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', maxWidth: `${columns[0]?.width}` }}
                                title={`${task?.taskno ? task.taskno + ' - ' : ''}${task?.taskname}`}
                            >
                                {/* Favorite Button at Start */}
                                <Tooltip title={task?.isfavourite === 1 ? "Remove from favorites" : "Add to favorites"} arrow placement="top">
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskFavorite(task);
                                        }}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: '3px',
                                            minWidth: '18px',
                                            minHeight: '18px',
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50% !important',
                                            backgroundColor: task?.isfavourite === 1 ? "#FFD700" : "white",
                                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                            "&:hover": {
                                                backgroundColor: task?.isfavourite === 1 ? "#FFC700" : "#f5f5f5",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                            },
                                        }}
                                    >
                                        <Star
                                            size={14}
                                            fill={task?.isfavourite === 1 ? "#fff" : "transparent"}
                                            color={task?.isfavourite === 1 ? "#fff" : "#0000008a"}
                                        />
                                    </IconButton>
                                </Tooltip>
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
                                        textDecoration: isCompleted ? 'line-through' : 'none',
                                        opacity: isCompleted ? 0.75 : 1,
                                    }}
                                    className={`tasknameCl ${task?.isCopyActive ? 'cut-task-name' : ''}`}
                                >
                                    {task?.taskno && task.taskno != 0 && (
                                        <span style={{ color: '#666', fontWeight: '500', marginRight: '8px' }}>
                                            {task.taskno}
                                        </span>
                                    )}
                                    {task?.taskname}
                                </span>
                                {task?.subtasks?.length > 0 && (
                                    <span className="task-sub_count">
                                        {task?.subtasks?.length}
                                    </span>
                                )}
                            </div>
                            {/* <Tooltip title={task?.isfavourite === 1 ? "Remove from favorites" : "Add to favorites"} arrow placement="top">
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskFavorite(task);
                                        }}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            padding: '3px',
                                            minWidth: '20px',
                                            minHeight: '20px',
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50% !important',
                                            backgroundColor: task?.isfavourite === 1 ? "#FFD700" : "white",
                                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                            "&:hover": {
                                                backgroundColor: task?.isfavourite === 1 ? "#FFC700" : "#f5f5f5",
                                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                            },
                                        }}
                                    >
                                        <Star
                                            size={14}
                                            fill={task?.isfavourite === 1 ? "#fff" : "transparent"}
                                            color={task?.isfavourite === 1 ? "#fff" : "#0000008a"}
                                        />
                                    </IconButton>
                                </Tooltip> */}
                            {archiveInfo?.label && (
                                <div style={{ marginTop: '4px' }}>
                                    <Tooltip
                                        arrow
                                        placement="top"
                                        slotProps={{
                                            tooltip: {
                                                sx: {
                                                    backgroundColor: '#fff',
                                                    color: '#ffffff',
                                                    padding: '10px 12px',
                                                    borderRadius: '10px',
                                                    boxShadow: '0 12px 28px rgba(0,0,0,0.09)',
                                                    maxWidth: 340,
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: '#111827',
                                                },
                                            },
                                        }}
                                        title={(
                                            <Box
                                                sx={{
                                                    minWidth: 230,
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <Typography sx={{ fontSize: '12px', fontWeight: 800 }}>
                                                        Archive info
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '11px',
                                                            fontWeight: 800,
                                                            color: archiveInfo?.isReady ? '#fb923c' : 'inherit',
                                                        }}
                                                    >
                                                        {archiveInfo?.isReady ? 'Ready' : `${archiveInfo?.daysLeft}d left`}
                                                    </Typography>
                                                </Box>

                                                <Box
                                                    sx={{
                                                        borderTop: '1px solid rgba(255,255,255,0.18)',
                                                        paddingTop: '6px',
                                                        display: 'grid',
                                                        gridTemplateColumns: '90px 1fr',
                                                        rowGap: '6px',
                                                        columnGap: '10px',
                                                    }}
                                                >
                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        Completed
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#e5e7eb' }}>
                                                        {archiveInfo?.completedAt ? new Date(archiveInfo.completedAt).toLocaleString() : '-'}
                                                    </Typography>

                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        Archive on
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                                                        {archiveInfo?.archiveAt ? new Date(archiveInfo.archiveAt).toLocaleString() : '-'}
                                                    </Typography>

                                                    <Typography sx={{ fontSize: '11px' }}>
                                                        Status
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 800, color: archiveInfo?.isReady ? '#fb923c !important' : 'inherit' }}>
                                                        {archiveInfo?.label || '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        )}
                                    >
                                        <Chip
                                            label={archiveInfo.label}
                                            variant="filled"
                                            size="small"
                                            sx={{
                                                ...(getArchiveChipStyles(archiveInfo) || {}),
                                                height: '18px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                '& .MuiChip-label': {
                                                    padding: '0 6px',
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                        <div className="second_row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        disabled={task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 || parentArchived}
                    >
                        <CirclePlus size={20} color={
                            (task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1)
                                ? "#e0e0e0"
                                : "#7367f0"
                        } />
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

    const renderSubtaskRow = ({ subtask, parentArchiveInfo, parentArchived, depth }) => {
        return (
            <React.Fragment key={`${subtask.taskid}-${depth}`}>
                <TableRow
                    className={subtask?.isCopyActive ? 'cut-task-row' : ''}
                    sx={{
                        pointerEvents: subtask?.isCopyActive ? 'none' : 'auto',
                        cursor: subtask?.isCopyActive ? 'not-allowed' : 'default',
                        backgroundColor: (() => {
                            if (subtask?.isCopyActive) return undefined;
                            if (hoveredSubtaskId === subtask?.taskid) return '#f5f5f5';
                            if (expandedTasks[subtask.taskid]) return '#f5f5f5';

                            const ownInfo = subtask?.Completion_timestamp ? getArchiveInfoFromEndDate(subtask, 7) : null;
                            const info = ownInfo || parentArchiveInfo;
                            if (!info) return 'inherit';
                            return info?.isReady ? 'rgba(245, 124, 0, 0.10)' : 'rgba(255, 215, 0, 0.10)';
                        })(),
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
                                `${15 * (depth + 1)}`,
                                parentArchiveInfo,
                                parentArchived,
                                handleTaskFavorite
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
                                    width: '32px',
                                    height: '32px',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                    }
                                }}
                                disabled={subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 || parentArchived}
                            >
                                <CirclePlus size={20} color={
                                    (subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1)
                                        ? "#e0e0e0"
                                        : "#7367f0"
                                } />
                            </IconButton>
                        </div>
                    </TableCell>
                    <TableCell
                        className="taskPriorityCell"
                        title={subtask?.taskPr}
                        onClick={() => handleProjectClick(subtask)}
                        sx={{
                            cursor: subtask?.projectid ? 'pointer' : 'default',
                            color: subtask?.projectid ? '#1976d2' : 'inherit',
                            '&:hover': {
                                color: '#7367f0 !important'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {subtask?.taskPr}
                    </TableCell>
                    <TableCell>
                        {renderTaskProgressBar(subtask?.progress_per, subtask?.isNotShowProgress)}
                    </TableCell>
                    <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange}
                                disable={(subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))} />
                            {/* <ArchiveRestoreButton
                                task={subtask}
                                setSelectedArchiveTask={setSelectedArchiveTask}
                                setConfirmArchiveOpen={setConfirmArchiveOpen}
                                setArchivingIds={setArchivingIds}
                                setSelectedUnarchiveTask={setSelectedUnarchiveTask}
                                setConfirmUnarchiveOpen={setConfirmUnarchiveOpen}
                                setRestoringIds={setRestoringIds}
                                hasAccess={hasAccess}
                                PERMISSIONS={PERMISSIONS}
                            /> */}
                        </Box>
                    </TableCell>
                    <TableCell>
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange}
                            disable={(subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))} flag="secondaryStatus" />
                    </TableCell>
                    <TableCell
                        onMouseEnter={() => handleTaskMouseEnter(subtask?.taskid, { Tbcell: 'Assignee' })}
                        onMouseLeave={handleTaskMouseLeave}>
                        {renderAssigneeAvatars(subtask?.assignee, subtask, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut, !parentArchived)}
                    </TableCell>
                    <TableCell
                        data-deadline-column="true"
                        onClick={(e) => {
                            const isReadOnly = subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1;
                            const isFullAccess = hasAccess(PERMISSIONS.canTaskActions) || getUserProfileData()?.designation?.toLowerCase() === "admin";
                            if (!isReadOnly || isFullAccess) handleDeadlineClick(e, subtask);
                        }}
                        sx={{
                            cursor: (subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !(hasAccess(PERMISSIONS.canTaskActions))) ? 'default' : 'pointer',
                            '&:hover': {
                                backgroundColor: (subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !(hasAccess(PERMISSIONS.canTaskActions))) ? 'inherit' : '#e3f2fd',
                                borderRadius: '4px'
                            },
                            transition: 'background-color 0.2s ease',
                            padding: '8px 16px'
                        }}
                    >
                        {formatDaysDisplay(subtask?.DeadLineDate, subtask)}
                    </TableCell>
                    <TableCell>
                        <PriorityBadge task={subtask} priorityColors={priorityColors} onPriorityChange={onPriorityChange}
                            disable={(subtask?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))} />
                    </TableCell>
                    <TableCell>
                        <StatusCircles task={subtask} />
                    </TableCell>
                    <TableCell align="center">
                        {renderTaskActions(subtask, taskTimeRunning, handleTimeTrackModalOpen, handleEditTask, handleViewTask)}
                    </TableCell>
                </TableRow>
            </React.Fragment >
        );
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
                                        const access = task?.isFreez === 0;
                                        return (
                                            <React.Fragment key={taskIndex}>
                                                <TableRow
                                                    className={task?.isCopyActive ? 'cut-task-row' : ''}
                                                    sx={{
                                                        pointerEvents: task?.isCopyActive ? 'none' : 'auto',
                                                        cursor: task?.isCopyActive ? 'not-allowed' : 'default',
                                                        backgroundColor: (() => {
                                                            if (task?.isCopyActive) return undefined;
                                                            if (hoveredTaskId === task?.taskid) return '#f5f5f5';
                                                            if (expandedTasks[task.taskid]) return '#f5f5f5';

                                                            const info = task?.Completion_timestamp ? getArchiveInfoFromEndDate(task, 7) : null;
                                                            if (!info) return 'inherit';
                                                            return info?.isReady ? 'rgba(245, 124, 0, 0.10)' : 'rgba(255, 215, 0, 0.10)';
                                                        })(),
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
                                                            resizingColumnId === 'task',
                                                            0,
                                                            null,
                                                            false,
                                                            handleTaskFavorite
                                                        )}
                                                    </TableCell>
                                                    <TableCell
                                                        className="taskPriorityCell"
                                                        title={task?.taskPr}
                                                        onClick={() => handleProjectClick(task)}
                                                        sx={{
                                                            cursor: task?.projectid ? 'pointer' : 'default',
                                                            color: task?.projectid ? '#1976d2' : 'inherit',
                                                            '&:hover': {
                                                                color: '#7367f0 !important'
                                                            },
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {task?.taskPr}
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderTaskProgressBar(
                                                            task?.progress_per,
                                                            task?.isNotShowProgress,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange}
                                                                disable={((task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))) || access} />
                                                            {/* <ArchiveRestoreButton
                                                                task={task}
                                                                setSelectedArchiveTask={setSelectedArchiveTask}
                                                                setConfirmArchiveOpen={setConfirmArchiveOpen}
                                                                setArchivingIds={setArchivingIds}
                                                                setSelectedUnarchiveTask={setSelectedUnarchiveTask}
                                                                setConfirmUnarchiveOpen={setConfirmUnarchiveOpen}
                                                                setRestoringIds={setRestoringIds}
                                                                hasAccess={hasAccess}
                                                                PERMISSIONS={PERMISSIONS}
                                                            /> */}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange}
                                                            disable={((task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))) || access} flag="secondaryStatus" />
                                                    </TableCell>
                                                    <TableCell
                                                        onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                        onMouseLeave={handleTaskMouseLeave}>
                                                        {renderAssigneeAvatars(task?.assignee, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                                                    </TableCell>
                                                    <TableCell
                                                        data-deadline-column="true"
                                                        onClick={(e) => {
                                                            const isReadOnly = task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1;
                                                            const isFullAccess = hasAccess(PERMISSIONS.canTaskActions) || getUserProfileData()?.designation?.toLowerCase() === "admin";
                                                            if (!isReadOnly || isFullAccess) handleDeadlineClick(e, task, access);
                                                        }}
                                                        sx={{
                                                            cursor: (access || (task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !(hasAccess(PERMISSIONS.canTaskActions)))) ? 'default' : 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: (access || (task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !(hasAccess(PERMISSIONS.canTaskActions)))) ? 'inherit' : '#e3f2fd',
                                                                borderRadius: '4px'
                                                            },
                                                            transition: 'background-color 0.2s ease',
                                                            padding: '8px 16px'
                                                        }}
                                                    >
                                                        {formatDaysDisplay(task?.DeadLineDate, task)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <PriorityBadge task={task} priorityColors={priorityColors} onPriorityChange={onPriorityChange} disable={((task?.assignee?.find(a => a.id == getUserProfileData()?.id)?.isreadonly === 1 && !hasAccess(PERMISSIONS.canTaskActions))) || access} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusCircles task={task} />
                                                    </TableCell>
                                                    <TableCell align="center" className="sticky-last-col">
                                                        {renderTaskActions(task, taskTimeRunning, handleTimeTrackModalOpen, handleEditTask, handleViewTask)}
                                                    </TableCell>
                                                </TableRow>
                                                {(visibleSubtasksByRoot.get(task.taskid) || [])
                                                    .slice(0, subtaskRenderLimits[task.taskid] || INITIAL_SUBTASK_BATCH)
                                                    .map((row) => renderSubtaskRow(row))}
                                                {renderSubtaskSkeletonRows(task.taskid)}
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
                taskId={profileTaskId}
                onRemoved={handleProfileRemoved}
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

            <ConfirmationDialog
                open={confirmUnarchiveOpen}
                onClose={() => {
                    setConfirmUnarchiveOpen(false);
                    setSelectedUnarchiveTask(null);
                }}
                onConfirm={async () => {
                    const task = selectedUnarchiveTask;
                    setConfirmUnarchiveOpen(false);
                    setSelectedUnarchiveTask(null);
                    const taskId = task?.taskid;
                    if (!taskId) {
                        toast.error('Task id not found');
                        return;
                    }

                    setRestoringIds((prev) => {
                        const next = new Set(prev);
                        next.add(taskId);
                        return next;
                    });

                    try {
                        const res = await taskRestoreApi(task);
                        if (res) {
                            toast.success('Task restored');
                            setOpenChildTask(Date.now());
                        } else {
                            toast.error('Restore failed');
                        }
                    } catch (e) {
                        toast.error('Restore failed');
                    } finally {
                        setRestoringIds((prev) => {
                            const next = new Set(prev);
                            next.delete(taskId);
                            return next;
                        });
                    }
                }}
                title="Restore task"
                content="Are you sure you want to unarchive this task?"
                confirmLabel="Unarchive"
                cancelLabel="Cancel"
            />

            <ConfirmationDialog
                open={confirmArchiveOpen}
                onClose={() => {
                    setConfirmArchiveOpen(false);
                    setSelectedArchiveTask(null);
                }}
                onConfirm={async () => {
                    const task = selectedArchiveTask;
                    setConfirmArchiveOpen(false);
                    setSelectedArchiveTask(null);
                    const taskId = task?.taskid;
                    if (!taskId) {
                        toast.error('Task id not found');
                        return;
                    }
                    setArchivingIds((prev) => {
                        const next = new Set(prev);
                        next.add(taskId);
                        return next;
                    });

                    try {
                        const res = await taskArchiveApi(task);
                        if (res) {
                            toast.success('Task archived');
                            setOpenChildTask(Date.now());
                        } else {
                            toast.error('Archive failed');
                        }
                    } catch (e) {
                        toast.error('Archive failed');
                    } finally {
                        setArchivingIds((prev) => {
                            const next = new Set(prev);
                            next.delete(taskId);
                            return next;
                        });
                    }
                }}
                title="Complete parent task"
                content="This task has incomplete sub tasks. Completing it will also archive the task tree. Do you want to proceed?"
                confirmLabel="Archive"
                cancelLabel="Cancel"
            />

            <div style={{ display: 'none' }}>
                <MomSheet selectedData={selectedItem} ref={printRef1} />
                <MaintenanceSheet selectedData={selectedItem} ref={printRef2} />
                <DocumentSheet selectedData={selectedItem} ref={printRef3} />
            </div>

        </>
    );
};

export default TableView;

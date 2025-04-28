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
import { CirclePlus, Eye, Paperclip, Pencil, Timer } from "lucide-react";
import "react-resizable/css/styles.css";
import { useSetRecoilState } from "recoil";
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, taskActionMode } from "../../../Recoil/atom";
import TaskDetail from "../TaskDetails/TaskDetails";
import LoadingBackdrop from "../../../Utils/Common/LoadingBackdrop";
import { cleanDate, convertWordsToSpecialChars, formatDate2, getRandomAvatarColor, ImageUrl, priorityColors, statusColors } from "../../../Utils/globalfun";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AssigneeShortcutModal from "../../ShortcutsComponent/AssigneeShortcutModal";
import TaskTimeTracking from "../../ShortcutsComponent/TaskTimeTracking";
import BurningImg from "../../../Assests/fire.webp"
import StatusBadge from "../../ShortcutsComponent/StatusBadge";
import StatusCircles from "../../ShortcutsComponent/EstimateComp";
import ProfileCardModal from "../../ShortcutsComponent/ProfileCard";
import SidebarDrawerFile from "../../ShortcutsComponent/Attachment/SidebarDrawerFile";

const TableView = ({ data, page, order, orderBy, rowsPerPage, currentData, totalPages, handleChangePage, handleRequestSort, handleTaskFavorite, handleStatusChange, handleAssigneeShortcutSubmit, isLoading }) => {
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
    const [openfileDrawerOpen, setFileDrawerOpen] = useState(false);
    const columns = [
        { id: "taskname", label: "Task Name", width: 350 },
        { id: "project", label: "Project", width: 150 },
        { id: "status", label: "Status", width: 180 },
        { id: "assignee", label: "Assignee", width: 150 },
        { id: "DeadLineDate", label: "Deadline", width: 150 },
        { id: "priority", label: "Priority", width: 150 },
        { id: "estimate", label: "Estimate", width: 150 },
        { id: "actions", label: "Actions", width: 120 },
    ];

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
        let data = {
            taskid: task?.taskid,
            taskPr: task?.taskPr,
            projectid: task?.projectid,
            taskname: task?.taskname,
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
                max={10}
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
                                backgroundColor: background(assignee?.firstname),
                            }}
                            onClick={() => hanldePAvatarClick(assignees)}
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
                onClick={() => setFileDrawerOpen(true)}
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

    const renderPriorityLabel = (priority, priorityColors) => {
        const color = priority && priorityColors[priority]?.color || '#fff';
        const backgroundColor = priority && priorityColors[priority]?.backgroundColor || '#7d7f85a1';

        return (
            <div style={{
                color,
                backgroundColor,
                width: 'fit-content',
                padding: '0.2rem 0.8rem',
                borderRadius: '5px',
                textAlign: 'center',
                fontSize: '13.5px',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
            }}
                className="priority-label"
            >
                {priority ?? '-'}
            </div>
        );
    };

    const renderTaskNameSection = (
        task,
        expandedTasks,
        toggleSubtasks,
        convertWordsToSpecialChars,
        BurningImg
    ) => {
        return (
            <>
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
                                    {task?.taskname?.length > 35
                                        ? `${task?.taskname?.slice(0, 35)}...`
                                        : convertWordsToSpecialChars(task?.taskname)}
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
                                        src={BurningImg}
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
                    backgroundColor: hoveredSubtaskId === subtask?.taskid ? '#f5f5f5' : 'inherit',
                }}
                    onMouseEnter={() => handleSubtaskMouseEnter(subtask?.taskid, { Tbcell: 'TaskName' })}
                    onMouseLeave={handleSubtaskMouseLeave}
                >
                    <TableCell >
                        <div style={{
                            paddingLeft: `${8 * (depth + 1)}px`,
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            {renderTaskNameSection(
                                subtask,
                                expandedTasks,
                                toggleSubtasks,
                                convertWordsToSpecialChars,
                                handleAddTask,
                                hoveredTaskId,
                                hoveredColumnname,
                                BurningImg
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
                        <StatusBadge task={subtask} statusColors={statusColors} onStatusChange={onStatusChange} />
                    </TableCell>
                    <TableCell
                        onMouseEnter={() => handleTaskMouseEnter(subtask?.taskid, { Tbcell: 'Assignee' })}
                        onMouseLeave={handleTaskMouseLeave}>
                        {renderAssigneeAvatars(subtask?.assignee, subtask, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                    </TableCell>
                    <TableCell>
                        {cleanDate(subtask?.DeadLineDate) ? formatDate2(subtask.DeadLineDate) : '-'}
                    </TableCell>
                    <TableCell>
                        {renderPriorityLabel(subtask?.priority, priorityColors)}
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
                                                    backgroundColor: hoveredTaskId === task?.taskid ? '#f5f5f5' : 'inherit',
                                                    // opacity: task?.isnew == 0 ? 0.5 : 1,
                                                    // pointerEvents: task?.isnew == 0 ? 'none' : 'auto',
                                                    // cursor: task?.isnew == 0 ? 'not-allowed' : 'pointer',
                                                }}
                                                onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'TaskName' })}
                                                onMouseLeave={handleTaskMouseLeave}
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
                                                            convertWordsToSpecialChars,
                                                            handleAddTask,
                                                            hoveredTaskId,
                                                            hoveredColumnname,
                                                            BurningImg
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
                                                    <StatusBadge task={task} statusColors={statusColors} onStatusChange={onStatusChange} />
                                                </TableCell>
                                                <TableCell
                                                    onMouseEnter={() => handleTaskMouseEnter(task?.taskid, { Tbcell: 'Assignee' })}
                                                    onMouseLeave={handleTaskMouseLeave}>
                                                    {renderAssigneeAvatars(task?.assignee, task, hoveredTaskId, hoveredColumnname, hanldePAvatarClick, handleAssigneeShortcut)}
                                                </TableCell>
                                                <TableCell>
                                                    {cleanDate(task?.DeadLineDate) ? formatDate2(task.DeadLineDate) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {renderPriorityLabel(task?.priority, priorityColors)}
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
        </>
    );
};

export default TableView;

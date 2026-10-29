import React, { useEffect, useState } from 'react';
import {
    Box, IconButton, Typography, Grid, Tabs, Tab,
    Avatar,
    useTheme,
    Drawer,
    Button,
    AvatarGroup,
    Tooltip,
    CircularProgress,
    TextField,
    InputAdornment,
} from '@mui/material';
import { CircleX, Search } from 'lucide-react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './TaskDetails.scss';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, TaskData } from '../../../Recoil/atom';
import { taskDescGetApi } from '../../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskCommentUpdateApi } from '../../../Api/TaskApi/TaskCommentUpdateApi';
import { taskCommentDeleteApi } from '../../../Api/TaskApi/TaskCommentDeleteApi';
import { taskCommentReactionApi } from '../../../Api/TaskApi/TaskCommentReactionApi';
import { taskDescAddApi } from '../../../Api/TaskApi/TaskDescAddApi';
import { cleanDate, formatDate2, ImageUrl, mapKeyValuePair, priorityColors, statusColors, transformAttachments, getUserProfileData, getAuthData, processCommentData, getAssigneeMaster, removeTaskRecursively, getAvatarColors, getInitials } from '../../../Utils/globalfun';
import SafeAvatar from '../../ShortcutsComponent/SafeAvatar';
import useAccess from '../../Auth/Role/useAccess';
import { PERMISSIONS } from '../../Auth/Role/permissions';
import { deleteTaskDataApi } from '../../../Api/TaskApi/DeleteTaskApi';
import { clearAllTabDataCache } from '../../../Utils/IndexedDB/taskDataCache';
import { invalidateTaskCache } from '../../../Utils/QueryClient/queryClient';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';
import CommentSection from '../../ShortcutsComponent/Comment/TaskComment';
import SubtaskCard from './SubTaskcard';
import { TaskDescription } from '../../ShortcutsComponent/TaskDescription';
import { getAttachmentApi } from '../../../Api/UploadApi/GetAttachmentApi';
import AttachmentSidebar from './AttachmentSidebar';
import Breadcrumb from '../../BreadCrumbs/Breadcrumb';
import { useLocation } from 'react-router-dom';

const TaskDetail = ({ open, onClose, taskData, handleTaskFavorite, onOpenDrawer, onDeleteTask }) => {
    const location = useLocation();
    const theme = useTheme();
    const { hasAccess } = useAccess();

    // ===== PERMISSION FLAGS =====
    const profileData = getUserProfileData();
    const isAdmin = profileData?.designation?.toLowerCase() === "admin";
    const hasTaskActionAccess = hasAccess(PERMISSIONS.canTaskActions);
    const isFullAccess = isAdmin || hasTaskActionAccess;
    const authData = getUserProfileData();
    const loginUserId = authData?.id;
    const currentUserAssignee = taskData?.assignee?.find(a => a.id == loginUserId);
    const isAssignee = !!currentUserAssignee;
    const isReadOnlyUser = currentUserAssignee?.isreadonly === 1;
    const isAlowed = !isReadOnlyUser && isAssignee


    const [isLoading, setIsLoading] = useState(
        {
            isAtttLoading: false,
        }
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [taskArr, setTaskArr] = useRecoilState(TaskData);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const [uploadedFile, setUploadedFile] = useState([]);
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDescEdit, setTaskDescEdit] = useState(false);
    const [comments, setComments] = useState([]);
    const [subtaskSearch, setSubtaskSearch] = useState('');
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const actualTaskDataValue = useRecoilValue(TaskData);

    useEffect(() => {
        setIsLoading({ isAtttLoading: true });
        const getAttachment = async () => {
            try {
                const res = await getAttachmentApi(taskData);
                if (res) {
                    const labeledTasks = mapKeyValuePair(res);
                    const transformedData = transformAttachments(labeledTasks);
                    setUploadedFile(transformedData);
                }
            } catch (error) {
                console.error("Failed to fetch attachments:", error);
            } finally {
                setIsLoading({ isAtttLoading: false });
            }
        };
        if (taskData?.taskid && open) {
            getAttachment();
        }
    }, [open]);

    const handleRemoveEvent = () => {
        setCnfDialogOpen(true);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        setIsDeleting(true);
        try {
            const taskId = formDataValue?.taskid;
            // If the parent provided a delete handler, let it update the UI and caches instantly.
            if (onDeleteTask) {
                await onDeleteTask(taskId);
                setFormDrawerOpen(false);
                setFormDataValue(null);
                onClose();
            } else {
                // Fallback: update the global task array directly (legacy non-parented usage)
                const deleteTaskApi = await deleteTaskDataApi(formDataValue);
                if (deleteTaskApi?.rd[0]?.stat === 1) {
                    const updatedTaskArr = removeTaskRecursively(taskArr, taskId);
                    setTaskArr(updatedTaskArr);
                    setOpenChildTask(Date.now());
                    clearAllTabDataCache().catch(() => {});
                    invalidateTaskCache();
                    setFormDrawerOpen(false);
                    setFormDataValue(null);
                    onClose();
                    toast.success("Task deleted successfully!");
                } else {
                    throw new Error("Failed to delete task");
                }
            }
        } catch (error) {
            console.error("Error while deleting task:", error);
            if (!onDeleteTask) {
                toast.error("Failed to delete task.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleShowEditDesc = () => {
        setTaskDescEdit(!taskDescEdit);
    };

    const handleClose = () => {
        onClose();
        setUploadedFile([]);
        setNewComment('');
    }

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    useEffect(() => {
        const assigneesMaster = getAssigneeMaster();
        const fetchTaskDesc = async () => {
            try {
                const taskdesc = await taskDescGetApi(taskData);
                if (taskdesc) {
                    setTaskDesc(taskdesc.rd[0]);
                }

                const taskComment = await taskCommentGetApi(taskData);
                if (taskComment) {
                    const processedComments = processCommentData(taskComment.rd, assigneesMaster);
                    setComments(processedComments);
                }
            } catch (error) {
                console.error('Error fetching task description: ', error);
            }
        };

        if (open) {
            fetchTaskDesc();
        }
    }, [open]);

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleSendComment = async (attachments = []) => {
        const assigneesMaster = getAssigneeMaster();
        if (!newComment.trim()) return;

        try {
            await taskCommentAddApi(taskData, newComment, attachments);

            setNewComment('');

            const taskComment = await taskCommentGetApi(taskData);

            if (taskComment) {
                const processedComments = processCommentData(taskComment.rd, assigneesMaster);
                setComments(processedComments);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const refreshComments = async () => {
        const assigneesMaster = getAssigneeMaster();
        const taskComment = await taskCommentGetApi(taskData);
        if (taskComment) {
            setComments(processCommentData(taskComment.rd, assigneesMaster));
        }
    };

    const handleEditComment = async (comment, newText) => {
        try {
            await taskCommentUpdateApi(comment?.id, newText);
            await refreshComments();
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleRemoveComment = async (comment) => {
        try {
            await taskCommentDeleteApi(comment?.id ?? comment);
            await refreshComments();
        } catch (error) {
            console.error('Error while removing comment:', error);
        }
    };

    const handleToggleReaction = async (comment, emoji = '👍') => {
        try {
            await taskCommentReactionApi(comment?.id, taskData?.taskid, emoji);
            await refreshComments();
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    };

    const handleReplyComment = async (parentComment, text) => {
        try {
            await taskCommentAddApi(taskData, text, [], parentComment?.id);
            await refreshComments();
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleDescChange = (event) => {
        setTaskDesc(event.target.value);
    };

    const handleUpdateDesc = async () => {
        let desc = typeof taskDesc === 'string' ? taskDesc : taskDesc?.descr;
        try {
            const updateDescResponse = await taskDescAddApi(taskData, desc);
            if (updateDescResponse) {
                setTaskDesc(desc);  // This line is crucial
                setTaskDescEdit(false);
            } else {
                console.error('Failed to update description');
            }
        } catch (error) {
            console.error('Error while updating description:', error);
        }
    };

    const handleDescCancel = () => {
        setTaskDescEdit(false);
    }

    const handleAddSubTask = (task, additionalInfo) => {
        if (onOpenDrawer) {
            onOpenDrawer(task, additionalInfo);
        } else {
            setRootSubroot(additionalInfo);
            setFormDataValue(task);
            setFormDrawerOpen(true);
        }
        setSelectedTask(task);
    }

    const attachmentCount = Object.values(uploadedFile?.attachment || {})
        .reduce((sum, arr) => sum + (arr?.length || 0), 0);

    const urlCount = Object.values(uploadedFile?.url || {})
        .reduce((sum, arr) => sum + (arr?.length || 0), 0);

    const totalCount = attachmentCount + urlCount;

    const TagLabel = ({ value, colorMap }) => {
        const colors = colorMap?.[value] || {};

        return (
            <Typography
                sx={{
                    color: `${colors.color || "#7d7f85"} !important`,
                    backgroundColor: colors.backgroundColor || "#fff",
                    width: 'fit-content',
                    padding: '0.3rem 1rem',
                    borderRadius: '5px',
                    textAlign: 'center',
                    fontSize: '14px !important',
                    fontWeight: '500',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {value}
            </Typography>
        );
    };

    return (
        <div>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                className="MainDrawer"
                sx={{ display: open == true ? 'block' : 'none', zIndex: theme.zIndex.drawer + 2, }}
            >
                <Box className={`modal-container`}>
                    <div className='modal-container2'>
                        <Box className="modal-header">
                            <div className="header-left">
                                <IconButton
                                    onClick={() => handleTaskFavorite(taskData)}
                                    size="small"
                                    aria-label="add-favorite"
                                    aria-labelledby="add-favorite"
                                    sx={{
                                        width: '30px',
                                        height: '30px',
                                        padding: '4px',
                                        boxShadow: taskData?.isfavourite
                                            ? '0px 0px 8px rgba(255, 215, 0, 0.6)'
                                            : '0px 2px 8px rgba(99, 99, 99, 0.2)',
                                        transition: 'box-shadow 0.3s ease-in-out, background 0.3s ease-in-out',
                                        background: taskData?.isfavourite ? '#FFD700' : '#fff',
                                        '&:hover': {
                                            boxShadow: taskData?.isfavourite
                                                ? '0px 0px 12px rgba(255, 215, 0, 0.9)'
                                                : '0px 4px 12px rgba(99, 99, 99, 0.3)',
                                            background: taskData?.isfavourite ? '#FFC107' : '#f5f5f5',
                                        },
                                    }}
                                >
                                    {taskData?.isfavourite ? (
                                        <StarIcon sx={{ fontSize: '20px', color: '#fff' }} />
                                    ) : (
                                        <StarBorderIcon sx={{ fontSize: '20px', color: '#7d7f85' }} />
                                    )}
                                </IconButton>
                                <Typography variant="h6">{taskData?.taskname ?? taskData?.title}</Typography>
                            </div>
                            <IconButton onClick={handleClose}>
                                <CircleX />
                            </IconButton>
                        </Box>
                        <div
                            style={{
                                margin: "10px 0",
                                border: "1px dashed #7d7f85",
                                opacity: 0.3,
                            }}
                        />
                        <Box className="modal-body">
                            <Box className="titlebox">
                                <Typography variant="caption" sx={{ color: '#7D7f85 !important' }}>
                                    <Breadcrumb breadcrumbTitles={taskData?.breadcrumbTitles} />
                                </Typography>
                                {(isFullAccess || (taskData?.parentid !== 0 && isAlowed)) && location.pathname != "/teamCalReport" && (
                                    <Button
                                        size='small'
                                        variant="contained"
                                        onClick={() => handleRemoveEvent()}
                                        sx={{ marginRight: "10px" }}
                                        className="dangerbtnClassname"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </Button>
                                )}
                            </Box>
                            <Grid container className="task-details">
                                <Grid container spacing={2}>
                                    {/* Status */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Status</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <TagLabel value={taskData?.status} colorMap={statusColors} />
                                    </Grid>

                                    {/* Priority */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Priority</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <TagLabel value={taskData?.priority} colorMap={priorityColors} />
                                    </Grid>

                                    {/* Assignees */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Assignees</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <AvatarGroup
                                            max={10}
                                            spacing={2}
                                            sx={{
                                                justifyContent: 'start !important',
                                                '& .MuiAvatar-root': {
                                                    width: 30,
                                                    height: 30,
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
                                            {taskData?.assignee?.map((assignee, teamIdx) => (
                                                <Tooltip
                                                    placement="top"
                                                    key={assignee?.id}
                                                    title={`${assignee?.firstname} ${assignee?.lastname}`}
                                                    arrow
                                                    classes={{ tooltip: 'custom-tooltip' }}
                                                >
                                                    <SafeAvatar
                                                        key={teamIdx}
                                                        alt={`${assignee?.firstname} ${assignee?.lastname}`}
                                                        src={ImageUrl(assignee) || null}
                                                        sx={{
                                                            ...getAvatarColors(`${assignee?.firstname + " " + assignee?.lastname}`),
                                                        }}
                                                    >
                                                        {!assignee.avatar && getInitials(assignee?.firstname, assignee?.lastname)}
                                                    </SafeAvatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Due Date</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography>{taskData?.DeadLineDate && cleanDate(taskData?.DeadLineDate)
                                            ? formatDate2(cleanDate(taskData?.DeadLineDate))
                                            : '-'}</Typography>
                                    </Grid>
                                </Grid>
                                {/* description */}
                                <TaskDescription
                                    taskDesc={taskDesc}
                                    taskDescEdit={taskDescEdit}
                                    handleShowEditDesc={handleShowEditDesc}
                                    handleDescChange={handleDescChange}
                                    handleUpdateDesc={handleUpdateDesc}
                                    handleDescCancel={handleDescCancel}
                                />
                                <Grid item xs={12} className='tabDataMain'>
                                    <Tabs value={activeTab} onChange={handleTabChange} className='muiTaskTabs'>
                                        <Tab label={`Comments (${comments?.length})`} />
                                        <Tab label={`Attachment (${totalCount})`} />
                                        {(location.pathname != "/teamCalReport" && location.pathname != "/myTasks") &&
                                            < Tab label={`Subtasks`} />
                                        }
                                    </Tabs>
                                    <Box
                                        className="tab-content"
                                        sx={{ justifyContent: activeTab === 0 ? 'flex-end' : 'flex-start' }}
                                    >
                                        {activeTab === 0 && (
                                            <CommentSection
                                                comments={comments}
                                                newComment={newComment}
                                                onCommentChange={handleCommentChange}
                                                onSendComment={handleSendComment}
                                                onEditComment={handleEditComment}
                                                onDeleteComment={handleRemoveComment}
                                                onToggleReaction={handleToggleReaction}
                                                onReply={handleReplyComment}
                                                taskData={taskData}
                                            />
                                        )}

                                        {activeTab === 1 &&
                                            <Box>
                                                <AttachmentSidebar uploadedFile={uploadedFile} isAtttLoading={isLoading?.isAtttLoading} />
                                            </Box>
                                        }

                                        {activeTab === 2 &&
                                            <Box className="subtask_CardBox">
                                                <Box className="addNewTaskBtn" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                                    <TextField
                                                        placeholder="Search subtasks..."
                                                        value={subtaskSearch}
                                                        onChange={(e) => setSubtaskSearch(e.target.value)}
                                                        size="small"
                                                        className="textfieldsClass"
                                                        sx={{ width: '50%' }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Search size={16} color="#9a9ab0" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleAddSubTask(taskData, { Task: 'subroot' })}
                                                        className="buttonClassname"
                                                        sx={{
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            px: 2.5,
                                                            py: 0.75,
                                                            mr: 1.5,
                                                            borderRadius: '8px',
                                                            textTransform: 'none',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        Add task
                                                    </Button>
                                                </Box>
                                                <div
                                                    style={{
                                                        margin: "15px 0",
                                                        border: "1px dashed #7d7f85",
                                                        opacity: 0.3,
                                                    }}
                                                />
                                                <SubtaskCard subtasks={taskData?.subtasks} onAddDubTask={handleAddSubTask} searchTerm={subtaskSearch} />
                                            </Box>
                                        }
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </div>
                </Box >
            </Drawer >
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this task?"
            />
        </div >
    );
};

export default TaskDetail;

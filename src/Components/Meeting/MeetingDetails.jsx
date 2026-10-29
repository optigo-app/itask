import React, { useEffect, useState } from 'react';
import {
    Box, IconButton, Typography, Grid, Tabs, Tab,
    Avatar,
    useTheme,
    Drawer,
    Button,
    AvatarGroup,
    Tooltip,
} from '@mui/material';
import { CircleX, Download } from 'lucide-react';
import './Styles/MeetingDetail.scss';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { CalformData, fetchlistApiCall, formData, openFormDrawer, TaskData } from '../../Recoil/atom';
import { taskDescGetApi } from '../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../Api/TaskApi/TaskCommentAddApi';
import { taskCommentUpdateApi } from '../../Api/TaskApi/TaskCommentUpdateApi';
import { taskCommentDeleteApi } from '../../Api/TaskApi/TaskCommentDeleteApi';
import { taskCommentReactionApi } from '../../Api/TaskApi/TaskCommentReactionApi';
import { taskDescAddApi } from '../../Api/TaskApi/TaskDescAddApi';
import AttachmentImg from "../../Assests/Attachment.webp";
import { ImageUrl, processCommentData, getAssigneeMaster, getAvatarColors, getInitials } from '../../Utils/globalfun';
import { deleteTaskDataApi } from '../../Api/TaskApi/DeleteTaskApi';
import { clearAllTabDataCache } from '../../Utils/IndexedDB/taskDataCache';
import { invalidateTaskCache } from '../../Utils/QueryClient/queryClient';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';
import CommentSection from '../ShortcutsComponent/Comment/TaskComment';
import AttachmentGrid from '../ShortcutsComponent/AttachmentGrid';
import SafeAvatar from '../ShortcutsComponent/SafeAvatar';
import { TaskDescription } from '../ShortcutsComponent/TaskDescription';

const MeetingDetail = ({ open, onClose, taskData, handleMeetingEdit }) => {
    const theme = useTheme();
    const [taskArr, setTaskArr] = useRecoilState(TaskData);
    const setCallTaskApi = useSetRecoilState(fetchlistApiCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [count, setCount] = useState(2);
    const [taskDesc, setTaskDesc] = useState();
    const [taskDescEdit, setTaskDescEdit] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const placeholderImage = AttachmentImg;

    // Dummy attachment data
    const dummyAttachments = [
        { filename: 'document.pdf', url: 'https://example.com/document.pdf', size: '2.5 MB' },
        { filename: 'image.jpg', url: 'https://example.com/image.jpg', size: '1.8 MB' },
        { filename: 'spreadsheet.xlsx', url: 'https://example.com/spreadsheet.xlsx', size: '3.2 MB' },
    ];

    // remove Task
    const removeTaskRecursively = (tasks, taskIdToRemove) => {
        return tasks
            .map(task => {
                if (task.subtasks) {
                    return {
                        ...task,
                        subtasks: removeTaskRecursively(task.subtasks, taskIdToRemove)
                    };
                }
                return task;
            })
            .filter(task => task.taskid !== taskIdToRemove);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        try {
            const deleteTaskApi = await deleteTaskDataApi(formDataValue);
            if (deleteTaskApi?.rd[0]?.stat === 1) {
                const updatedTaskArr = removeTaskRecursively(taskArr, formDataValue.taskid);
                setTaskArr(updatedTaskArr);
                setCallTaskApi(true);
                setFormDrawerOpen(false);
                setFormDataValue(null);
                onClose();
                toast.success("Task deleted successfully!");
                // Clear IndexedDB + React Query caches so next load gets fresh data
                clearAllTabDataCache().catch(() => {});
                invalidateTaskCache();
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

    const handleShowEditDesc = () => {
        setTaskDescEdit(!taskDescEdit);
    };

    const handleClose = () => {
        onClose();
    }

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    useEffect(() => {
        const assigneesMaster = getAssigneeMaster();
        const fetchTaskDesc = async () => {
            try {
                const taskdesc = await taskDescGetApi(taskData);
                if (taskdesc) {
                    if (taskdesc.rd[0]?.descr != '') {
                        setTaskDesc(taskdesc.rd[0]);
                    } else {
                        setTaskDesc(taskData?.description);
                    }
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
                setTaskDesc(desc);
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

    const colorPalette = {
        "challanges": { color: "#fff", backgroundColor: "#F5222D" },
        "Change request": { color: "#fff", backgroundColor: "#1677FF" },
        "creative": { color: "#000", backgroundColor: "#FAAD14" },
        "New Request": { color: "#fff", backgroundColor: "#52C41A" },
        "Professional Services": { color: "#fff", backgroundColor: "#13C2C2" },
        "RND": { color: "#fff", backgroundColor: "#722ED1" },
        "Tech Support": { color: "#fff", backgroundColor: "#EB2F96" },
        "Training": { color: "#fff", backgroundColor: "#000000" },
        "unassigned": { color: "#000", backgroundColor: "#f5f5f5" },
    };

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


    const onEditClick = (formData) => {
        if (handleMeetingEdit) {
            handleMeetingEdit(formData);
        } else {
            console.warn("handleMeetingEdit is undefined");
        }
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
                                <Typography variant="h6">Meeting Details</Typography>
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
                                <Box sx={{ width: '80%', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Typography variant="h5" className="task-title"
                                        sx={{
                                            "&:hover": {
                                                cursor: "pointer",
                                                color: '#7367f0'
                                            }
                                        }}
                                        onClick={() => onEditClick(formData)}>{taskData?.meetingtitle || taskData?.title}</Typography>
                                </Box>
                                <Button
                                    size='small'
                                    variant="contained"
                                    sx={{ marginRight: "10px", width: '20%', }}
                                    className="dangerbtnClassname"
                                >
                                    End Meeting
                                </Button>
                            </Box>
                            <Grid container className="task-details">
                                <Grid container spacing={2}>
                                    {/* Status */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">ProjectName/Module</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography className="taskvalue">{(taskData?.ProjectName || taskData?.prModule?.projectname) + " / " + (taskData?.taskname || taskData?.prModule?.taskname)}</Typography>
                                    </Grid>

                                    {/* Priority */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Category</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <TagLabel value={taskData?.category?.labelname || taskData?.category} colorMap={colorPalette} />
                                    </Grid>

                                    {/* Assignees */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Assignees</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <AvatarGroup max={10}
                                            spacing={2}
                                            sx={{
                                                flexDirection: 'row',
                                                '& .MuiAvatar-root': {
                                                    width: 30,
                                                    height: 30,
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
                                            {taskData?.guests?.map((assignee, teamIdx) => (
                                                <Tooltip
                                                    placement="top"
                                                    key={assignee?.id}
                                                    title={assignee?.firstname + " " + assignee?.lastname}
                                                    arrow
                                                    classes={{ tooltip: 'custom-tooltip' }}
                                                >
                                                    <SafeAvatar
                                                        key={teamIdx}
                                                        alt={assignee?.firstname + " " + assignee?.lastname}
                                                        src={ImageUrl(assignee) || null}
                                                        sx={{
                                                            ...getAvatarColors(assignee),
                                                        }}
                                                    >
                                                        {!assignee.avatar && getInitials(assignee?.firstname, assignee?.lastname)}
                                                    </SafeAvatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Grid>
                                </Grid>
                                {/* description */}
                                <TaskDescription
                                    taskDesc={taskDesc || taskData?.description}
                                    taskDescEdit={taskDescEdit}
                                    handleShowEditDesc={handleShowEditDesc}
                                    handleDescChange={handleDescChange}
                                    handleUpdateDesc={handleUpdateDesc}
                                    handleDescCancel={handleDescCancel}
                                />
                                <Grid item xs={12} className='tabDataMain'>
                                    <Tabs value={activeTab} onChange={handleTabChange} className='muiTaskTabs'>
                                        <Tab label="Attachment" />
                                        <Tab label={`Comments (${comments?.length})`} />
                                    </Tabs>
                                    <Box
                                        className="tab-content"
                                        sx={{ justifyContent: activeTab === 1 ? 'flex-end' : 'flex-start' }}
                                    >
                                        {activeTab === 0 &&
                                            <Box>
                                                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'end', mb: .2 }}>
                                                    <Button
                                                        variant="text"
                                                        onClick={() => alert('Download Attachment')}
                                                        startIcon={<Download color='#7367f0' size={20} />}>
                                                        <Typography sx={{ textTransform: 'capitalize', color: '#7367f0 !important' }}>Download All</Typography>
                                                    </Button>
                                                </Box>
                                                <AttachmentGrid count={count} placeholderImage={placeholderImage} />
                                            </Box>
                                        }
                                        {activeTab === 1 && (
                                            <CommentSection
                                                comments={comments}
                                                newComment={newComment}
                                                onCommentChange={handleCommentChange}
                                                onSendComment={handleSendComment}
                                                onEditComment={handleEditComment}
                                                onDeleteComment={handleRemoveComment}
                                                onToggleReaction={handleToggleReaction}
                                                onReply={handleReplyComment}
                                            />
                                        )}
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

export default MeetingDetail;

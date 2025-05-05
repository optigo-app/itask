import React, { useEffect, useState } from 'react';
import {
    Box, IconButton, Typography, Grid, Tabs, Tab,
    Avatar,
    useTheme,
    Drawer,
    Button,
    AvatarGroup,
    Tooltip,
    ToggleButtonGroup,
    ToggleButton,
} from '@mui/material';
import { CircleX, Download } from 'lucide-react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './TaskDetails.scss';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { fetchlistApiCall, formData, openFormDrawer, rootSubrootflag, selectedRowData, TaskData } from '../../../Recoil/atom';
import { taskDescGetApi } from '../../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskDescAddApi } from '../../../Api/TaskApi/TaskDescAddApi';
import AttachmentImg from "../../../Assests/Attachment.webp";
import { formatDate2, getRandomAvatarColor, ImageUrl, mapKeyValuePair, priorityColors, statusColors, transformAttachments } from '../../../Utils/globalfun';
import { deleteTaskDataApi } from '../../../Api/TaskApi/DeleteTaskApi';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';
import CommentSection from '../../ShortcutsComponent/Comment/TaskComment';
import SubtaskCard from './SubTaskcard';
import AttachmentGrid from '../../ShortcutsComponent/AttachmentGrid';
import { TaskDescription } from '../../ShortcutsComponent/TaskDescription';
import { getAttachmentApi } from '../../../Api/UploadApi/GetAttachmentApi';
import AttachmentSidebar from './AttachmentSidebar';

const TaskDetail = ({ open, onClose, taskData, handleTaskFavorite }) => {
    console.log('taskData: ', taskData);
    const theme = useTheme();
    const [taskArr, setTaskArr] = useRecoilState(TaskData);
    const setCallTaskApi = useSetRecoilState(fetchlistApiCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState([]);
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDescEdit, setTaskDescEdit] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [selectedFolder, setSelectedFolder] = useState("Project_Ref");

    // Dummy attachment data
    const dummyAttachments = [
        { filename: 'document.pdf', url: 'https://example.com/document.pdf', size: '2.5 MB' },
        { filename: 'image.jpg', url: 'https://example.com/image.jpg', size: '1.8 MB' },
        { filename: 'spreadsheet.xlsx', url: 'https://example.com/spreadsheet.xlsx', size: '3.2 MB' },
    ];

    useEffect(() => {
        const getAttachment = async () => {
            try {
                const res = await getAttachmentApi(taskData);
                if (res) {
                    const labeledTasks = mapKeyValuePair(res);
                    const transformedData = transformAttachments(labeledTasks);
                    console.log('transformedData: ', transformedData);
                    setUploadedFile(transformedData);
                }
            } catch (error) {
                console.error("Failed to fetch attachments:", error);
            } finally {
            }
        };
        if (taskData?.taskid && open) {
            getAttachment();
        }
    }, [open]);

    const handleRemoveEvent = () => {
        setCnfDialogOpen(true);
    };

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

    const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    useEffect(() => {
        const fetchTaskDesc = async () => {
            try {
                const taskdesc = await taskDescGetApi(taskData);
                if (taskdesc) {
                    setTaskDesc(taskdesc.rd[0]);
                }

                const taskComment = await taskCommentGetApi(taskData);
                if (taskComment) {
                    const commentsWithAttachments = taskComment.rd.map(comment => ({
                        ...comment,
                        user: { name: 'John Doe', avatar: null },
                        attachments: dummyAttachments.slice(0, Math.floor(Math.random() * 3))
                    }));
                    setComments(commentsWithAttachments);
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

    const handleSendComment = async () => {
        if (!newComment.trim()) return;

        try {
            await taskCommentAddApi(taskData, newComment);

            setNewComment('');

            const taskComment = await taskCommentGetApi(taskData);

            if (taskComment) {
                const cleanedComments = taskComment.rd.map(comment => ({
                    ...comment,
                    id: comment?.id,
                    user: comment?.user,
                    attachments: comment?.attachments || []
                }));

                setComments(cleanedComments);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = (comment) => {
        setNewComment(comment.comment);
    };

    const handleRemoveComment = async (commentId) => {
        try {
            const deleteCommentResponse = await taskCommentAddApi(taskData, commentId);
            if (deleteCommentResponse) {
                setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
            } else {
                console.error('Failed to remove comment');
            }
        } catch (error) {
            console.error('Error while removing comment:', error);
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
                // Update the state with the new description
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

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee?.firstname);
        return avatarBackgroundColor;
    };

    const handleAddSubTask = (task, additionalInfo) => {
        setRootSubroot(additionalInfo);
        setFormDataValue(task);
        setFormDrawerOpen(true);
        setSelectedTask(task);
    }

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
                                {/* <IconButton onClick={toggleFullScreen}>
                                    {isFullScreen && isFullScreen ? <Shrink /> : <Expand />}
                                </IconButton>
                                <Divider orientation="vertical" variant="middle" flexItem /> */}
                                <Typography variant="h6">{taskData?.taskPr} / {taskData?.taskname}</Typography>
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
                                <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                                    <Typography variant="h4" className="task-title">{taskData?.taskname}</Typography>
                                </Box>
                                <Button
                                    size='small'
                                    variant="contained"
                                    onClick={() => handleRemoveEvent()}
                                    sx={{ marginRight: "10px" }}
                                    className="dangerbtnClassname"
                                // disabled={isLoading}
                                >
                                    Delete
                                </Button>
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
                                            {taskData?.assignee?.map((assignee, teamIdx) => (
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
                                                            backgroundColor: background(assignee),
                                                        }}
                                                    >
                                                        {!assignee.avatar && assignee?.firstname?.charAt(0)}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Due Date</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography>{formatDate2(taskData?.DeadLineDate)}</Typography>
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
                                        <Tab label={`Subtasks`} />
                                        <Tab label="Attachment" />
                                        <Tab label={`Comments (${comments?.length})`} />
                                    </Tabs>
                                    <Box
                                        className="tab-content"
                                        sx={{ justifyContent: activeTab === 2 ? 'flex-end' : 'flex-start' }}
                                    >
                                        {activeTab === 0 &&
                                            <Box className="subtask_CardBox">
                                                <Box className="addNewTaskBtn">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleAddSubTask(taskData, { Task: 'subroot' })}
                                                        className="buttonClassname"
                                                        sx={{ fontSize: '12px', marginTop: '5px' }}
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
                                                <SubtaskCard subtasks={taskData?.subtasks} onAddDubTask={handleAddSubTask} />
                                            </Box>
                                        }
                                        {activeTab === 1 &&
                                            <Box>
                                                <AttachmentSidebar uploadedFile={uploadedFile} />
                                            </Box>
                                        }
                                        {activeTab === 2 && (
                                            <CommentSection
                                                comments={comments}
                                                newComment={newComment}
                                                onCommentChange={handleCommentChange}
                                                onSendComment={handleSendComment}
                                                onEditComment={handleEditComment}
                                                onDeleteComment={handleRemoveComment}
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

export default TaskDetail;

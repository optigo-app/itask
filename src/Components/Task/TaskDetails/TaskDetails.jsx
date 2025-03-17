import React, { useEffect, useState } from 'react';
import {
    Modal, Box, IconButton, Typography, Divider, Grid, Card, CardContent, CardMedia, Tabs, Tab, TextareaAutosize,
    Avatar,
    useTheme,
    Drawer,
    Button,
    AvatarGroup,
    Tooltip,
} from '@mui/material';
import { CircleX, Expand, Shrink, Download, Send, Edit } from 'lucide-react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import './TaskDetails.scss';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { fetchlistApiCall, formData, openFormDrawer, selectedRowData, TaskData } from '../../../Recoil/atom';
import { taskDescGetApi } from '../../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskDescAddApi } from '../../../Api/TaskApi/TaskDescAddApi';
import AttachmentImg from "../../../Assests/Attachment.webp";
import { findParentTask, formatDate2, formatDate3, getRandomAvatarColor, priorityColors, statusColors } from '../../../Utils/globalfun';
import { deleteTaskDataApi } from '../../../Api/TaskApi/DeleteTaskApi';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';
import AttachmentGrid from './AttachmentGrid';
import CommentSection from './Comment/TaskComment';
import { TaskDescription } from './TaskDescription';
import SubtaskCard from './SubTaskcard';

const TaskDetail = ({ open, onClose, taskData, handleTaskFavorite }) => {
    const theme = useTheme();
    const [taskArr, setTaskArr] = useRecoilState(TaskData);
    console.log('taskArr: ', taskArr);
    // const taskData = useRecoilValue(formData);
    console.log('taskData: ', taskData);
    const setCallTaskApi = useSetRecoilState(fetchlistApiCall);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [count, setCount] = useState(2);
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDescEdit, setTaskDescEdit] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const placeholderImage = AttachmentImg;

    // Dummy attachment data
    const dummyAttachments = [
        { filename: 'document.pdf', url: 'https://example.com/document.pdf', size: '2.5 MB' },
        { filename: 'image.jpg', url: 'https://example.com/image.jpg', size: '1.8 MB' },
        { filename: 'spreadsheet.xlsx', url: 'https://example.com/spreadsheet.xlsx', size: '3.2 MB' },
    ];

    const handleRemoveEvent = () => {
        setCnfDialogOpen(true);
    };

    // const handleConfirmRemoveAll = async () => {
    //     setCnfDialogOpen(false);
    //     const parentTask = findParentTask(taskArr, taskData.taskid);
    //     try {
    //         const deleteTaskApi = await deleteTaskDataApi(formDataValue);
    //         if (deleteTaskApi?.rd[0]?.stat == 1) {
    //             setCallTaskApi(true);
    //             setSelectedTask(parentTask);
    //             setFormDrawerOpen(false);
    //             setFormDataValue(null);
    //             onClose()
    //             toast.success("Task deleted successfully!");
    //         } else {
    //             console.error("Failed to delete task");
    //         }
    //     } catch (error) {
    //         console.error("Error while deleting task:", error);
    //     }
    // };

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
    }, [open, taskData]);

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleSendComment = async () => {
        if (newComment.trim()) {
            const newCommentData = {
                title: `Comment ${comments.length + 1}`,
                description: newComment,
                timestamp: Date.now(),
            };

            try {
                const addCommentResponse = await taskCommentAddApi(taskData, newCommentData);
                if (addCommentResponse) {
                    setComments((prevComments) => [...prevComments, newCommentData]);
                    setNewComment('');
                } else {
                    console.error('Failed to add comment');
                }
            } catch (error) {
                console.error('Error while sending comment:', error);
            }
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
            : getRandomAvatarColor(assignee?.name);
        return avatarBackgroundColor;
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
                <Box className={`modal-container ${isFullScreen && isFullScreen ? '' : 'full-screen'}`}>
                    <div className='modal-container2'>
                        <Box className="modal-header">
                            <div className="header-left">
                                <IconButton onClick={toggleFullScreen}>
                                    {isFullScreen && isFullScreen ? <Shrink /> : <Expand />}
                                </IconButton>
                                <Divider orientation="vertical" variant="middle" flexItem />
                                <Typography variant="h6">{taskData?.taskDpt} / {taskData?.taskPr}</Typography>
                            </div>
                            <IconButton onClick={handleClose}>
                                <CircleX />
                            </IconButton>
                        </Box>
                        <div
                            style={{
                                margin: "0 0 10px 0",
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
                                            boxShadow: taskData?.isFav
                                                ? '0px 0px 8px rgba(255, 215, 0, 0.6)'
                                                : '0px 2px 8px rgba(99, 99, 99, 0.2)',
                                            transition: 'box-shadow 0.3s ease-in-out, background 0.3s ease-in-out',
                                            background: taskData?.isFav ? '#FFD700' : '#fff',
                                            '&:hover': {
                                                boxShadow: taskData?.isFav
                                                    ? '0px 0px 12px rgba(255, 215, 0, 0.9)'
                                                    : '0px 4px 12px rgba(99, 99, 99, 0.3)',
                                                background: taskData?.isFav ? '#FFC107' : '#f5f5f5',
                                            },
                                        }}
                                    >
                                        {taskData?.isFav ? (
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
                                    className="danger-btn"
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
                                        <Typography
                                            sx={{
                                                color: `${statusColors[taskData?.status]?.color} !important`,
                                                backgroundColor: statusColors[taskData?.status]?.backgroundColor,
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
                                            {taskData?.status}
                                        </Typography>
                                    </Grid>

                                    {/* Priority */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Priority</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography
                                            sx={{
                                                color: `${priorityColors[taskData?.priority]?.color} !important`,
                                                backgroundColor: priorityColors[taskData?.priority]?.backgroundColor,
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
                                            {taskData?.priority}
                                        </Typography>
                                    </Grid>

                                    {/* Assignees */}
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Assignees</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        {/* <AvatarGroup
                                            max={10}
                                            sx={{
                                                flexDirection: 'row',
                                                '& .MuiAvatar-root': {
                                                    width: 30,
                                                    height: 30,
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    border: 'none',
                                                    transition: 'transform 0.3s ease-in-out',
                                                    '&:hover': {
                                                        transform: 'translateY(-5px)',
                                                    },
                                                },
                                            }}
                                        >
                                            {assignees?.map((teamMember, teamIdx) => (
                                                <Tooltip key={teamIdx} placement="top" title={teamMember.name} arrow>
                                                    <Avatar
                                                        alt={teamMember.name}
                                                        src={teamMember.avatar}
                                                        sx={{
                                                            backgroundColor: background(teamMember),
                                                        }}
                                                    >
                                                        {!teamMember.avatar && teamMember.name.charAt(0)}
                                                    </Avatar>
                                                </Tooltip>
                                            ))}
                                        </AvatarGroup> */}
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
                                    <Box className="tab-content">
                                        {activeTab === 0 &&
                                            <Box className="subtask_CardBox">
                                                <SubtaskCard subtasks={taskData?.subtasks} />
                                            </Box>
                                        }
                                        {activeTab === 1 &&
                                            <Box>
                                                <IconButton onClick={() => alert('Download Attachment')} sx={{ width: '100%', display: 'flex', justifyContent: 'end', borderRadius: '8px' }}>
                                                    <Download color='#7367f0' size={20} />
                                                    <span style={{ color: '#7367f0', fontSize: '15px', paddingLeft: '5px' }}>Download All</span>
                                                </IconButton>
                                                <AttachmentGrid count={count} placeholderImage={placeholderImage} />
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

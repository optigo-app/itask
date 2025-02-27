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
import './TaskDetails.scss';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { fetchlistApiCall, formData, openFormDrawer, selectedRowData, TaskData } from '../../../Recoil/atom';
import { taskDescGetApi } from '../../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskDescAddApi } from '../../../Api/TaskApi/TaskDescAddApi';
import AttachmentImg from "../../../Assests/Attachment.jpg"
import { findParentTask, formatDate2, formatDate3, getRandomAvatarColor, priorityColors, statusColors } from '../../../Utils/globalfun';
import { deleteTaskDataApi } from '../../../Api/TaskApi/DeleteTaskApi';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';
import AttachmentGrid from './AttachmentGrid';
import CommentSection from './TaskComment';
import { TaskDescription } from './TaskDescription';
import SubtaskCard from './SubTaskcard';

const TaskDetail = ({ open, onClose }) => {
    const theme = useTheme();
    const [taskArr, setTaskArr] = useRecoilState(TaskData);
    const taskData = useRecoilValue(formData);
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

    const assignees = [
        { name: "Aarav Sharma", avatar: "" },
        { name: "Ishita Verma", avatar: "" },
        { name: "Rajesh Iyer", avatar: "" },
        { name: "Priya Nair", avatar: "" },
        { name: "Vikram Singh", avatar: "" },
        { name: "Ananya Reddy", avatar: "" },
        { name: "Karthik Menon", avatar: "" },
        { name: "Neha Gupta", avatar: "" },
        { name: "Suresh Patil", avatar: "" },
        { name: "Meera Joshi", avatar: "" }
    ];

    const colors = [
        '#FF5722', '#4CAF50', '#2196F3', '#FFC107',
        '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'
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
                    setComments(taskComment?.rd);
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
                                <Typography variant="h4" className="task-title">{taskData?.taskname}</Typography>
                                <Button
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
                                        <AvatarGroup
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
                                            <SubtaskCard subtasks={taskData?.subtasks} />
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

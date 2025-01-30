import React, { useEffect, useState } from 'react';
import {
    Modal, Box, IconButton, Typography, Divider, Grid, Card, CardContent, CardMedia, Tabs, Tab, TextareaAutosize,
    Avatar,
    useTheme,
    Drawer,
    Button,
} from '@mui/material';
import { CircleX, Expand, Shrink, Download, Send, Edit } from 'lucide-react';
import './TaskDetails.scss';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { fetchlistApiCall, formData, openFormDrawer, selectedRowData } from '../../../Recoil/atom';
import { taskDescGetApi } from '../../../Api/TaskApi/TaskDescGetApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskDescAddApi } from '../../../Api/TaskApi/TaskDescAddApi';
import AttachmentImg from "../../../Assests/Attachment.jpg"
import { getRandomAvatarColor, priorityColors, statusColors } from '../../../Utils/globalfun';
import { deleteTaskDataApi } from '../../../Api/TaskApi/DeleteTaskApi';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';

const TaskDetail = ({ open, onClose }) => {
    const theme = useTheme();
    const taskData = useRecoilValue(formData);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [count, setCount] = useState(2);
    const [taskDesc, setTaskDesc] = useState('');
    const [taskDescEdit, setTaskDescEdit] = useState(false);
    console.log('taskDescEdit: ', taskDescEdit);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [cnfDialogOpen, setCnfDialogOpen] = React.useState(false);
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const [formDataValue, setFormDataValue] = useRecoilState(formData);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const setSelectedTask = useSetRecoilState(selectedRowData);
    const placeholderImage = AttachmentImg;

    const assignees = [
        { name: "John Doe", avatar: "https://via.placeholder.com/30" },
        { name: "Jane Smith", avatar: "https://via.placeholder.com/30" },
    ];

    const colors = [
        '#FF5722', '#4CAF50', '#2196F3', '#FFC107',
        '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'
    ];

    const handleRemoveEvent = () => {
        setCnfDialogOpen(true);
    };

    const handleConfirmRemoveAll = async () => {
        setCnfDialogOpen(false);
        try {
            const deleteTaskApi = await deleteTaskDataApi(formDataValue);
            if (deleteTaskApi) {
                setOpenChildTask(true);
                setSelectedTask(null);
                setFormDrawerOpen(false);
                setFormDataValue(null);
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


    console.log(taskDesc, 'dlkjwsjdlkj')

    const getRandomColor = (name) => {
        const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charSum % colors.length];
    };

    // for date format
    const formatDate = (date) => {
        if (!date) return '';

        const formattedDate = new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

        return formattedDate;
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
                            <Grid container rowSpacing={2} className="task-details">
                                <Grid container spacing={2}>
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Status</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography
                                            sx={{
                                                color: `${statusColors[taskData?.status]?.color} !important`,
                                                backgroundColor: statusColors[taskData?.status]?.backgroundColor,
                                                width: 'fit-content',
                                                padding: '0.2rem 0.8rem',
                                                borderRadius: '5px',
                                                textAlign: 'center',
                                                fontSize: '13.5px !important',
                                                fontWeight: '500',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >{taskData?.status}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography className="tasklable">Priority</Typography>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Typography
                                            sx={{
                                                color: `${priorityColors[taskData?.priority]?.color} !important`,
                                                backgroundColor: priorityColors[taskData?.priority]?.backgroundColor,
                                                width: 'fit-content',
                                                padding: '0.2rem 0.8rem',
                                                borderRadius: '5px',
                                                textAlign: 'center',
                                                fontSize: '13.5px !important',
                                                fontWeight: '500',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >{taskData?.priority}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                <Grid item xs={3}>
                                    <Typography className="tasklable">Assignees</Typography>
                                </Grid>
                                <Grid item xs={9}>
                                    <Grid container spacing={1}>
                                        {assignees.map((assignee, index) => (
                                            <Grid item key={index}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        background: '#4c4c4c0d',
                                                        padding: '0px 10px 0px 0px',
                                                        borderRadius: '30px',
                                                    }}
                                                >
                                                    <Avatar
                                                        alt={assignee.name}
                                                        src={assignee.avatars || undefined}
                                                        sx={{
                                                            backgroundColor: getRandomColor(assignee.name),
                                                            color: '#fff',
                                                            width: '25px',
                                                            height: '25px',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {assignee.avatars ? null : assignee.name.charAt(0)}
                                                    </Avatar>
                                                    <span>{assignee.name}</span>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography className='tasklable'>Description</Typography>
                                        <IconButton
                                            onClick={handleShowEditDesc}
                                            color="primary"
                                        >
                                            <Edit color='#7367f0' size={20} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} paddingTop='5px !important'>
                                    <Box sx={{ position: 'relative' }}>
                                        {!taskDescEdit ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography>{typeof taskDesc === 'string' ? taskDesc : taskDesc?.descr}</Typography>
                                            </Box>
                                        ) : (
                                            <>
                                                <TextareaAutosize
                                                    value={typeof taskDesc === 'string' ? taskDesc : taskDesc?.descr}
                                                    rows={8}
                                                    onChange={handleDescChange}
                                                    placeholder="Enter description here..."
                                                    className="textarea"
                                                />
                                                <Button
                                                    className='buttonClassname'
                                                    onClick={handleUpdateDesc}
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: '10px',
                                                        right: '10px',
                                                    }}
                                                    color="primary"
                                                >
                                                    Update
                                                </Button>
                                            </>
                                        )}

                                    </Box>
                                </Grid>
                                <Grid item xs={12} className="attachment-header">
                                    <Typography className='tasklable'>Attachment ({count})</Typography>
                                    <IconButton onClick={() => alert('Download Attachment')} sx={{ borderRadius: '8px' }}>
                                        <Download color='#7367f0' size={20} />
                                        <span style={{ color: '#7367f0', fontSize: '15px', paddingLeft: '5px' }}>Download All</span>
                                    </IconButton>
                                </Grid>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        {[...Array(count)]?.map((_, index) => (
                                            <Grid item xs={6} key={index}>
                                                <Card className="attachment-card">
                                                    <CardMedia
                                                        component="img"
                                                        className="attachment-image"
                                                        image={placeholderImage}
                                                        alt="Attachment"
                                                    />
                                                    <CardContent>
                                                        <Typography variant="body1">Attachment Name</Typography>
                                                        <Typography variant="body2" color="text.secondary">Details about the attachment</Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                                <Grid item xs={12}>
                                    <Tabs value={activeTab} onChange={handleTabChange} className='muiTaskTabs'>
                                        <Tab label={`Subtasks`} />
                                        <Tab label={`Comments (${comments?.length})`} />
                                        {/* <Tab label="Activities" /> */}
                                    </Tabs>
                                    <Box className="tab-content">
                                        {activeTab === 0 &&
                                            <>
                                                {taskData?.subtasks?.map((subtask, index) => (
                                                    <Card key={index} className="subtask-card">
                                                        <Grid container spacing={2} padding={2}>
                                                            <Grid item xs={12} sm={8}>
                                                                {/* Title and Description */}
                                                                <Typography variant="h6">{subtask?.taskname}</Typography>
                                                            </Grid>
                                                            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                                {/* Date/Time */}
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px !important' }}>
                                                                    {formatDate(subtask?.DeadLineDate)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Card>
                                                ))}
                                            </>
                                        }
                                        {activeTab === 1 && (
                                            <>
                                                {/* Mapping through multiple comments */}
                                                {comments?.map((comment, index) => (
                                                    <Card key={index} className="comment-card">
                                                        <Grid container spacing={2} padding={2}>
                                                            <Grid item xs={12} sm={8}>
                                                                {/* Title and Description */}
                                                                <Typography variant="h6">{comment?.comment}</Typography>
                                                                <Typography variant="body1">{comment?.description}</Typography>
                                                            </Grid>
                                                            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                                {/* Date/Time */}
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '12px !important' }}>
                                                                    {formatDate(comment?.entrydate)}
                                                                </Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </Card>
                                                ))}

                                                {/* Add New Comment Section */}
                                                <Box sx={{ position: 'sticky', bottom: '0', background: '#fff' }}>
                                                    <TextareaAutosize
                                                        value={newComment}
                                                        onChange={handleCommentChange}
                                                        rows={4}
                                                        placeholder="Add a comment..."
                                                        className="textarea"
                                                        style={{ minWidth: '25px' }}

                                                    />
                                                    <IconButton
                                                        onClick={handleSendComment}
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: '10px',
                                                            right: '10px',
                                                        }}
                                                        color="primary"
                                                    >
                                                        <Send color='#7367f0' size={25} />
                                                    </IconButton>
                                                </Box>
                                            </>
                                        )}
                                        {/* {activeTab === 2 && <Typography>Activities content...</Typography>} */}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </div>
                </Box>
            </Drawer>
            <ConfirmationDialog
                open={cnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this task?"
            />
        </div>
    );
};

export default TaskDetail;

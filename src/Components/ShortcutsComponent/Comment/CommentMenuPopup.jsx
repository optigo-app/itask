import React, { useEffect, useState } from 'react';
import {
    Menu,
    Box,
    Typography,
    TextareaAutosize,
    Button,
    IconButton,
    Avatar,
    Chip,
    CircularProgress
} from '@mui/material';
import { Send, Eye, Paperclip, MessageCircle, Clock } from 'lucide-react';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { background, formatDate4, ImageUrl } from '../../../Utils/globalfun';

const CommentMenuPopup = ({
    anchorEl,
    open,
    onClose,
    selectedTask,
    onCommentAdded,
    onViewAllComments
}) => {
    const [newComment, setNewComment] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [comments, setComments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    useEffect(() => {
        const assigneesMaster = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"))
        const fetchTaskComment = async () => {
            setIsLoadingComments(true);
            try {
                const taskComment = await taskCommentGetApi(selectedTask);
                if (taskComment) {
                    const commentsWithAttachments = taskComment.rd.map(comment => ({
                        ...comment,
                        assignee: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                    }));
                    setComments(commentsWithAttachments);
                }
            } catch (error) {
                console.error('Error fetching task comments: ', error);
                setComments([]);
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (open && selectedTask) {
            fetchTaskComment();
        } else if (!open) {
            // Reset comments when menu closes
            setComments([]);
            setIsLoadingComments(false);
        }
    }, [open, selectedTask]);

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleKeyPress = (event) => {
        // Send comment on Enter (but not Shift+Enter for new lines)
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendComment();
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !selectedTask || isSubmitting) return;

        setIsSubmitting(true);
        const assigneesMaster = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));

        try {
            // Call the API to add comment
            await taskCommentAddApi(selectedTask, newComment.trim());

            // Fetch updated comments to refresh the data
            const taskComment = await taskCommentGetApi(selectedTask);

            if (taskComment) {
                const cleanedComments = taskComment.rd.map(comment => ({
                    ...comment,
                    id: comment?.id,
                    user: comment?.user,
                    assignee: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                    attachments: comment?.attachments || []
                }));

                // Update local comments state
                setComments(cleanedComments);

                // Notify parent component
                if (onCommentAdded) {
                    onCommentAdded(cleanedComments);
                }
            }

            // Reset form but DON'T close menu
            setNewComment('');
            setSelectedFile(null);
            setFilePreview(null);

            console.log('Comment added successfully');

        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleClose = () => {
        setNewComment('');
        setSelectedFile(null);
        setFilePreview(null);
        onClose();
    };

    const handleViewAllComments = () => {
        onViewAllComments(selectedTask);
        handleClose();
    };

    // Use local comments state and show latest 2 comments
    const latestComments = comments?.slice(-2);

    // Compact comment display
    const CompactComment = ({ comment }) => (
        <Box sx={{
            display: 'flex',
            gap: 1,
            p: 1.5,
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        }}>
            <Avatar
                alt={comment?.assignee?.firstname}
                src={ImageUrl(comment?.assignee)}
                sx={{
                    width: 25,
                    height: 25,
                    fontSize: '12px',
                    backgroundColor: background(comment?.assignee?.firstname + " " + comment?.assignee?.lastname),
                }}
            >
                {!comment?.assignee?.avatar && comment?.assignee?.firstname?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#333' }}>
                        {comment?.assignee?.firstname || comment?.user || 'User'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                        {formatDate4(comment?.entrydate)}
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{
                    fontSize: '13px',
                    lineHeight: 1.4,
                    color: '#555',
                    wordBreak: 'break-word'
                }}>
                    {comment?.comment}
                </Typography>
            </Box>
        </Box>
    );

    const handleMenuClose = (event, reason) => {
        // Prevent closing on Tab key press or backdrop click while typing
        if (reason === 'tabKeyDown') {
            return;
        }
        handleClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            disableAutoFocus={true}
            disableEnforceFocus={true}
            disableRestoreFocus={true}
            slotProps={{
                paper: {
                    sx: {
                        width: '380px',
                        maxWidth: '90vw',
                        maxHeight: '65vh',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        "& .MuiList-root": {
                            padding: '0 !important'
                        }
                    }
                }
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Compact Header */}
                <Box sx={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                            <MessageCircle size={15} color="#7367f0" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                                Comments
                            </Typography>
                            {comments?.length > 0 && (
                                <Chip
                                    label={comments?.length}
                                    size="small"
                                    sx={{
                                        height: '18px',
                                        fontSize: '10px',
                                        backgroundColor: '#7367f0',
                                        color: 'white'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px', mt: 0.5 }}>
                        {selectedTask?.taskname || 'Task'}
                    </Typography>
                </Box>

                {/* Compact Comments Section */}
                <Box sx={{
                    maxHeight: '240px',
                    overflow: 'auto',
                    padding: (latestComments?.length > 0 || isLoadingComments) ? '8px 12px' : '0'
                }}>
                    {isLoadingComments ? (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 3,
                            gap: 1
                        }}>
                            <CircularProgress
                                size={24}
                                sx={{ color: '#7367f0' }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                                Loading comments...
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {latestComments.map((comment, index) => (
                                <CompactComment key={index} comment={comment} />
                            ))}

                            {comments?.length > 2 && (
                                <Box sx={{ textAlign: 'center', mt: 1 }}>
                                    <Button
                                        size="small"
                                        variant="text"
                                        onClick={handleViewAllComments}
                                        sx={{
                                            color: '#7367f0',
                                            fontSize: '11px',
                                            textTransform: 'none',
                                            minHeight: '28px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(115, 103, 240, 0.08)'
                                            }
                                        }}
                                    >
                                        + {comments?.length - 2} more comments
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Compact Input Section */}
                <Box sx={{
                    padding: '12px 16px',
                    borderTop: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa'
                }}>
                    <TextareaAutosize
                        value={newComment}
                        onChange={handleCommentChange}
                        minRows={2}
                        maxRows={3}
                        placeholder="Add a comment... (Press Enter to send)"
                        onKeyPress={handleKeyPress}
                        style={{
                            width: '100%',
                            maxWidth: '100%',
                            minWidth: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontFamily: 'inherit',
                            fontSize: '13px',
                            resize: 'none',
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box',
                            backgroundColor: 'white'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#7367f0';
                            e.target.style.boxShadow = '0 0 0 2px rgba(115, 103, 240, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1
                    }}>
                        {/* File Upload */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="comment-file-upload"
                                disabled
                            />
                            <label htmlFor="comment-file-upload">
                                <IconButton
                                    component="span"
                                    size="small"
                                    sx={{
                                        p: 0.5,
                                        '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' }
                                    }}
                                >
                                    <Paperclip size={16} color='#7367f0' />
                                </IconButton>
                            </label>
                            {selectedFile && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => window.open(filePreview, '_blank')}
                                        sx={{ p: 0.5, ml: 0.5 }}
                                    >
                                        <Eye size={16} color='#7367f0' />
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontSize: '10px' }}>
                                        {selectedFile.name.length > 15 ? selectedFile.name.substring(0, 15) + '...' : selectedFile.name}
                                    </Typography>
                                </>
                            )}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Button
                                size="small"
                                onClick={handleClose}
                                sx={{
                                    color: '#666',
                                    fontSize: '11px',
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    minHeight: '28px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleSendComment}
                                disabled={!newComment.trim() || isSubmitting}
                                startIcon={<Send size={12} />}
                                sx={{
                                    backgroundColor: '#7367f0',
                                    fontSize: '11px',
                                    minWidth: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    minHeight: '28px',
                                    '&:hover': {
                                        backgroundColor: '#5e57d1'
                                    },
                                    '&:disabled': {
                                        backgroundColor: 'rgba(0,0,0,0.12)'
                                    }
                                }}
                            >
                                {isSubmitting ? 'Sending...' : 'Send'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Menu>
    );
};

export default CommentMenuPopup;

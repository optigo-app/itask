import React, { useEffect, useState, memo } from 'react';
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
import { Send, Paperclip, MessageCircle } from 'lucide-react';
import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { background, formatDate4, ImageUrl } from '../../../Utils/globalfun';
import { uploadFilesForComment } from '../../../Utils/uploadHelpers';
import { toast } from 'react-toastify';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';

// Memoized CompactComment component to prevent re-renders
const CompactComment = memo(({ comment, onClose, selectedTask, onViewAllComments, onAttachmentClick }) => (
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
            
            {/* Attachments Display */}
            {comment?.attachments?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.5,
                        maxHeight: '60px',
                        overflowY: 'auto'
                    }}>
                        {comment.attachments.slice(0, 4).map((attachment, index) => (
                            <Box key={index} sx={{
                                position: 'relative',
                                width: '48px',
                                height: '48px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                border: '1px solid #e1e5e9',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }
                            }}
                            onClick={() => {
                                if (attachment.extension === 'url') {
                                    window.open(attachment.url, '_blank');
                                } else {
                                    onAttachmentClick(attachment, comment.attachments);
                                }
                            }}
                            >
                                {attachment.isImage ? (
                                    <img 
                                        src={attachment.url} 
                                        alt={attachment.filename}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : attachment.extension === 'url' ? (
                                    <Box sx={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#fff3e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Typography sx={{ fontSize: '8px', color: '#ff9800' }}>🔗</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: '#e3f2fd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Paperclip size={10} color='#1976d2' />
                                    </Box>
                                )}
                            </Box>
                        ))}
                        {comment.attachments.length > 4 && (
                            <Box sx={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '4px',
                                backgroundColor: '#f5f5f5',
                                border: '1px solid #e1e5e9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    backgroundColor: '#eeeeee'
                                }
                            }}
                            onClick={() => {
                                onClose();
                                onViewAllComments(selectedTask);
                            }}
                            >
                                <Typography sx={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>
                                    +{comment.attachments.length - 4}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    </Box>
));

const CommentMenuPopup = ({
    anchorEl,
    open,
    onClose,
    selectedTask,
    onCommentAdded,
    onViewAllComments
}) => {
    const [newComment, setNewComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [comments, setComments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);

    useEffect(() => {
        const assigneesMaster = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));
        const fetchTaskComment = async () => {
            setIsLoadingComments(true);
            try {
                const taskComment = await taskCommentGetApi(selectedTask);
                if (taskComment) {
                    const commentsWithAttachments = taskComment.rd.map(comment => {
                        let attachments = [];
                        if (comment?.DocumentName) {
                            const documentUrls = comment.DocumentName.split(',').filter(Boolean);
                            const documentLinks = comment?.DocumentUrl ? comment.DocumentUrl.split(',').filter(Boolean) : [];

                            attachments = documentUrls.map((url, index) => {
                                const fileName = url.substring(url.lastIndexOf('/') + 1);
                                const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
                                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

                                return {
                                    url: url,
                                    filename: fileName,
                                    extension: ext,
                                    isImage: isImage,
                                    folderName: comment?.foldername || 'Comments'
                                };
                            });
                            documentLinks.forEach((link, index) => {
                                attachments.push({
                                    url: link,
                                    filename: `Link ${index + 1}`,
                                    extension: 'url',
                                    isImage: false,
                                    folderName: comment?.foldername || 'Comments'
                                });
                            });
                        }

                        return {
                            ...comment,
                            assignee: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                            attachments: attachments
                        };
                    });
                    setComments(commentsWithAttachments);
                }
            } catch (error) {
                console.error('Error fetching task comments: ', error);
                setComments([]);
            } finally {
                setIsLoadingComments(false);
            }
        };

        if (open && selectedTask && selectedTask.taskid) {
            setComments([]);
            setIsLoadingComments(true);
            fetchTaskComment();
        } else if (!open) {
            setComments([]);
            setIsLoadingComments(false);
        }
    }, [open, selectedTask?.taskid]);

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleKeyPress = (event) => {
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
            let attachments = [];
            if (selectedFiles.length > 0) {
                try {
                    const uploadResult = await uploadFilesForComment({
                        folderName: 'Comments',
                        files: selectedFiles,
                    });
                    if (uploadResult.success) {
                        attachments = uploadResult.attachments;
                    }
                } catch (err) {
                    console.error('Comment file upload failed:', err);
                }
            }

            // Call the API to add comment with attachments
            await taskCommentAddApi(selectedTask, newComment.trim(), attachments);

            // Fetch updated comments to refresh the data
            const taskComment = await taskCommentGetApi(selectedTask);

            if (taskComment) {
                const cleanedComments = taskComment.rd.map(comment => {
                    // Process attachments from new format
                    let attachments = [];
                    if (comment?.DocumentName) {
                        const documentUrls = comment.DocumentName.split(',').filter(Boolean);
                        const documentLinks = comment?.DocumentUrl ? comment.DocumentUrl.split(',').filter(Boolean) : [];

                        attachments = documentUrls.map((url, index) => {
                            const fileName = url.substring(url.lastIndexOf('/') + 1);
                            const ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);

                            return {
                                url: url,
                                filename: fileName,
                                extension: ext,
                                isImage: isImage,
                                folderName: comment?.foldername || 'Comments'
                            };
                        });

                        // Add document URLs if any
                        documentLinks.forEach((link, index) => {
                            attachments.push({
                                url: link,
                                filename: `Link ${index + 1}`,
                                extension: 'url',
                                isImage: false,
                                folderName: comment?.foldername || 'Comments'
                            });
                        });
                    }

                    return {
                        ...comment,
                        id: comment?.id,
                        user: comment?.user,
                        assignee: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                        attachments: attachments
                    };
                });
                setComments(cleanedComments);
                if (onCommentAdded) {
                    onCommentAdded(cleanedComments);
                }
            }
            setNewComment('');
            filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
            setSelectedFiles([]);
            setFilePreviews([]);
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const totalFilesAfterAdd = selectedFiles.length + files.length;
            if (totalFilesAfterAdd > 10) {
                const allowedCount = 10 - selectedFiles.length;
                if (allowedCount <= 0) {
                    toast.error('Maximum 10 files allowed. Please remove some files first.');
                    return;
                } else {
                    toast.warning(`You can only add ${allowedCount} more file(s). Maximum 10 files allowed.`);
                    files.splice(allowedCount);
                }
            }

            const existingNames = new Set(selectedFiles.map(f => f.name));
            const newFiles = [];
            const duplicateFiles = [];
            const oversizedFiles = [];

            for (const file of files) {
                const isDuplicate = existingNames.has(file.name);
                const isOversized = file.size > 25 * 1024 * 1024;

                if (isDuplicate) {
                    duplicateFiles.push(file.name);
                } else if (isOversized) {
                    oversizedFiles.push(file.name);
                } else {
                    newFiles.push(file);
                }
            }

            if (duplicateFiles.length > 0) {
                toast.warning(`Skipped duplicate file(s): ${duplicateFiles.join(', ')}`);
            }
            if (oversizedFiles.length > 0) {
                toast.error(`Skipped file(s) exceeding 25MB: ${oversizedFiles.join(', ')}`);
            }

            if (newFiles.length > 0) {
                setSelectedFiles(prev => [...prev, ...newFiles]);
                const newPreviews = newFiles.map(file => ({
                    file,
                    url: URL.createObjectURL(file)
                }));
                setFilePreviews(prev => [...prev, ...newPreviews]);
            }
        }
        event.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => {
            if (prev[index]) {
                URL.revokeObjectURL(prev[index].url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    // Handle attachment click from CompactComment
    const handleAttachmentClick = (attachment, allAttachments) => {
        const fileAttachments = allAttachments
            .filter(att => att.extension !== 'url')
            .map(att => ({
                url: att.url,
                filename: att.filename,
                extension: att.extension,
                fileObject: null
            }));
        
        if (fileAttachments.length > 0) {
            setCurrentAttachments(fileAttachments);
            const attachmentIndex = fileAttachments.findIndex(att => att.url === attachment.url);
            setInitialSlideIndex(attachmentIndex >= 0 ? attachmentIndex : 0);
            setViewerOpen(true);
        }
    };

    // Handle file preview click in input section
    const handleFilePreviewClick = (preview, index) => {
        const allFiles = filePreviews.map(p => ({
            url: p.url,
            filename: p.file.name,
            extension: p.file.name?.split('.').pop()?.toLowerCase(),
            fileObject: p.file
        }));
        
        setCurrentAttachments(allFiles);
        setInitialSlideIndex(index);
        setViewerOpen(true);
    };

    const handleClose = () => {
        setNewComment('');
        filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setSelectedFiles([]);
        setFilePreviews([]);
        setViewerOpen(false);
        setCurrentAttachments([]);
        setInitialSlideIndex(0);
        onClose();
    };

    const handleViewAllComments = () => {
        onViewAllComments(selectedTask);
        handleClose();
    };

    const latestComments = comments?.slice(-2);

    const handleMenuClose = (event, reason) => {
        if (reason === 'tabKeyDown') {
            return;
        }
        handleClose();
    };

    const handleMenuKeyDown = (event) => {
        if (event.key === 'c' || event.key === 'C' || 
            event.key === 'Escape' || event.key === 'Enter' || 
            event.key === 'Tab' || event.key === 'Shift') {
            event.stopPropagation();
        }
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onKeyDown={handleMenuKeyDown}
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
                                <CompactComment 
                                    key={index} 
                                    comment={comment} 
                                    onClose={handleClose}
                                    selectedTask={selectedTask}
                                    onViewAllComments={onViewAllComments}
                                    onAttachmentClick={handleAttachmentClick}
                                />
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
                        onKeyDown={(e) => {
                            // Prevent event bubbling to parent Menu component
                            e.stopPropagation();
                        }}
                        onFocus={(e) => {
                            // Ensure textarea stays focused
                            e.target.focus();
                            // Apply focus styling
                            e.target.style.borderColor = '#7367f0';
                            e.target.style.boxShadow = '0 0 0 2px rgba(115, 103, 240, 0.1)';
                        }}
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
                        onBlur={(e) => {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = 'none';
                        }}
                    />

                    {/* File Attachment Section */}
                    <Box sx={{
                        mt: 1,
                        pb: 1,
                        borderBottom: selectedFiles.length > 0 ? '1px solid #f0f0f0' : 'none'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: selectedFiles.length > 0 ? 1 : 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="comment-file-upload"
                                />
                                <label htmlFor="comment-file-upload">
                                    <IconButton
                                        component="span"
                                        size="small"
                                        sx={{
                                            p: 0.5,
                                            backgroundColor: '#f8f9fa',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '6px',
                                            '&:hover': {
                                                backgroundColor: '#e9ecef',
                                                borderColor: '#7367f0'
                                            }
                                        }}
                                    >
                                        <Paperclip size={16} color='#7367f0' />
                                    </IconButton>
                                </label>
                                {selectedFiles.length > 0 && (
                                    <Typography variant="caption" sx={{
                                        ml: 1,
                                        color: '#6c757d',
                                        fontSize: '11px',
                                        fontWeight: '500'
                                    }}>
                                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                    </Typography>
                                )}
                            </Box>

                            {selectedFiles.length > 0 && (
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        // Clear files and previews
                                        filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
                                        setSelectedFiles([]);
                                        setFilePreviews([]);
                                    }}
                                    sx={{
                                        color: '#dc3545',
                                        borderColor: '#dc3545',
                                        fontSize: '9px',
                                        fontWeight: '500',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        textTransform: 'none',
                                        minWidth: 'auto',
                                        height: '24px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(220, 53, 69, 0.04)',
                                            borderColor: '#c82333'
                                        }
                                    }}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Box>

                        {selectedFiles.length > 0 && (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(48px, 1fr))',
                                gap: 0.8,
                                maxWidth: '320px',
                                maxHeight: '120px',
                                overflowY: 'auto',
                                backgroundColor: '#fafbfc',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                                '&::-webkit-scrollbar': {
                                    width: '3px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'transparent',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '2px',
                                },
                            }}>
                                {filePreviews.map((preview, index) => {
                                    const isImage = preview.file.type.startsWith('image/');
                                    return (
                                        <Box sx={{ position: 'relative' }}>
                                            <Box key={index} sx={{
                                                width: '48px',
                                                height: '48px',
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #e1e5e9',
                                                overflow: 'hidden',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                transition: 'all 0.15s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                                                    borderColor: '#7367f0'
                                                }
                                            }}
                                                onClick={() => handleFilePreviewClick(preview, index)}
                                            >
                                                {isImage ? (
                                                    // Image preview - square thumbnail
                                                    <Box sx={{
                                                        position: 'relative',
                                                        width: '100%',
                                                        height: '100%',
                                                        '&:hover': {
                                                            '&::after': {
                                                                content: '"👁"',
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundColor: 'rgba(115, 103, 240, 0.7)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '14px',
                                                                color: 'white',
                                                                zIndex: 1,
                                                                pointerEvents: 'none'
                                                            }
                                                        }
                                                    }}>
                                                        <img
                                                            src={preview.url}
                                                            alt={preview.file.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                display: 'block'
                                                            }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    // File preview - compact card
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '6px',
                                                        height: '100%',
                                                        textAlign: 'center',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(115, 103, 240, 0.02)'
                                                        }
                                                    }}>
                                                        <Box sx={{
                                                            backgroundColor: '#e8f4fd',
                                                            borderRadius: '4px',
                                                            padding: '4px',
                                                            marginBottom: '4px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <Paperclip size={12} color='#1976d2' />
                                                        </Box>
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '7px',
                                                            fontWeight: '600',
                                                            display: 'block',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            color: '#2c3e50',
                                                            width: '100%',
                                                            lineHeight: 1
                                                        }}>
                                                            {preview.file.name.length > 8 ? preview.file.name.substring(0, 8) + '...' : preview.file.name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            {/* Remove button - inside top right */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile(index);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '-5px',
                                                    right: '-5px',
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                                    color: 'white',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    borderRadius: '50%',
                                                    border: '1px solid rgba(255,255,255,0.8)',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(200, 35, 51, 0.95)',
                                                        transform: 'scale(1.1)'
                                                    },
                                                    zIndex: 3,
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                ×
                                            </IconButton>
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>

                    {/* Action Buttons Section */}
                    <Box sx={{
                        display: 'flex',
                        gap: 0.5,
                        pt: 1,
                        justifyContent: 'flex-end'
                    }}>
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
            
            <DocsViewerModal
                attachments={currentAttachments}
                initialSlideIndex={initialSlideIndex}
                modalOpen={viewerOpen}
                closeModal={() => {
                    setViewerOpen(false);
                    setCurrentAttachments([]);
                    setInitialSlideIndex(0);
                }}
            />
        </Menu>
    );
};

export default CommentMenuPopup;

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    TextareaAutosize,
    IconButton,
    CircularProgress,
    Skeleton,
    TextField,
    InputAdornment,
    Tooltip,
    Button
} from '@mui/material';
import { Paperclip, MessageCircle, X, Search, ArrowUpDown, ExternalLink } from 'lucide-react';

import { taskCommentAddApi } from '../../../Api/TaskApi/TaskCommentAddApi';
import { taskCommentGetApi } from '../../../Api/TaskApi/TaskCommentGetApi';
import { taskCommentUpdateApi } from '../../../Api/TaskApi/TaskCommentUpdateApi';
import { taskCommentDeleteApi } from '../../../Api/TaskApi/TaskCommentDeleteApi';
import { taskCommentReactionApi } from '../../../Api/TaskApi/TaskCommentReactionApi';
import { processCommentData, getAssigneeMaster, getUserProfileData } from '../../../Utils/globalfun';
import { uploadFilesForComment } from '../../../Utils/uploadHelpers';
import { toast } from 'react-toastify';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';
import CommentCard from './CommentCard';

const CommentMenuPopup = ({
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
    const [commentsTaskId, setCommentsTaskId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAsc, setSortAsc] = useState(false);
    const activeFetchIdRef = useRef(0);
    const listEndRef = useRef(null);

    const profileData = useMemo(() => getUserProfileData(), [open]);

    useLayoutEffect(() => {
        if (open && selectedTask?.taskid) {
            if (commentsTaskId !== selectedTask.taskid) {
                setComments([]);
                setCommentsTaskId(selectedTask.taskid);
            }
            setIsLoadingComments(true);
        }
    }, [open, selectedTask?.taskid]);

    const fetchTaskComment = async ({ showLoader = true } = {}) => {
        const assigneesMaster = getAssigneeMaster();
        const taskId = selectedTask?.taskid;
        const fetchId = ++activeFetchIdRef.current;
        if (showLoader) setIsLoadingComments(true);
        try {
            const taskComment = await taskCommentGetApi(selectedTask);
            if (fetchId !== activeFetchIdRef.current) return;
            if (taskComment) {
                const processedComments = processCommentData(taskComment.rd, assigneesMaster);
                setComments(processedComments);
                setCommentsTaskId(taskId ?? null);
            } else {
                setComments([]);
                setCommentsTaskId(taskId ?? null);
            }
        } catch (error) {
            console.error('Error fetching task comments: ', error);
        } finally {
            if (fetchId !== activeFetchIdRef.current) return;
            setIsLoadingComments(false);
        }
    };

    useEffect(() => {
        if (open && selectedTask && selectedTask.taskid) {
            fetchTaskComment();
        } else if (!open) {
            activeFetchIdRef.current += 1;
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
        if ((!newComment.trim() && selectedFiles.length === 0) || !selectedTask || isSubmitting) return;

        setIsSubmitting(true);
        const assigneesMaster = getAssigneeMaster();

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

            await taskCommentAddApi(selectedTask, newComment.trim(), attachments);

            const taskComment = await taskCommentGetApi(selectedTask);

            if (taskComment) {
                const processedComments = processCommentData(taskComment.rd, assigneesMaster);
                setComments(processedComments);
                if (onCommentAdded) {
                    onCommentAdded(processedComments);
                }
            }
            setNewComment('');
            filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
            setSelectedFiles([]);
            setFilePreviews([]);
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditComment = async (comment, newText) => {
        try {
            await taskCommentUpdateApi(comment?.id, newText);
            await fetchTaskComment({ showLoader: false });
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (comment) => {
        try {
            await taskCommentDeleteApi(comment?.id);
            await fetchTaskComment({ showLoader: false });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const handleToggleReaction = async (comment, emoji = '👍') => {
        try {
            await taskCommentReactionApi(comment?.id, selectedTask?.taskid, emoji);
            await fetchTaskComment({ showLoader: false });
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    };

    const handleReplyComment = async (parentComment, text) => {
        try {
            await taskCommentAddApi(selectedTask, text, [], parentComment?.id);
            await fetchTaskComment({ showLoader: false });
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
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
        setSearchTerm('');
        setSortAsc(false);
        filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        setSelectedFiles([]);
        setFilePreviews([]);
        setViewerOpen(false);
        setCurrentAttachments([]);
        setInitialSlideIndex(0);
        onClose();
    };

    const handleOpenTaskDetails = () => {
        onViewAllComments?.(selectedTask);
        handleClose();
    };

    const isStaleCommentsForAnotherTask =
        open &&
        selectedTask?.taskid &&
        commentsTaskId &&
        commentsTaskId !== selectedTask?.taskid;

    const commentsForDisplay = isStaleCommentsForAnotherTask ? [] : comments;

    const visibleComments = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = term
            ? commentsForDisplay.filter((c) =>
                c?.comment?.toLowerCase().includes(term) ||
                `${c?.assignee?.firstname ?? ''} ${c?.assignee?.lastname ?? ''}`.toLowerCase().includes(term)
            )
            : commentsForDisplay;

        const byId = new Map();
        const roots = [];
        filtered.forEach((c) => {
            byId.set(c?.id, { ...c, replies: [] });
        });
        byId.forEach((node) => {
            const parent = node?.parentid ? byId.get(node.parentid) : null;
            if (parent) {
                parent.replies.push(node);
            } else {
                roots.push(node);
            }
        });

        const sortByDate = (a, b) =>
            sortAsc
                ? new Date(a?.entrydate) - new Date(b?.entrydate)
                : new Date(b?.entrydate) - new Date(a?.entrydate);
        const sortTree = (nodes) => {
            nodes.sort(sortByDate);
            nodes.forEach((n) => {
                if (n.replies?.length) {
                    n.replies.sort((a, b) => new Date(a?.entrydate) - new Date(b?.entrydate));
                    sortTree(n.replies);
                }
            });
        };
        sortTree(roots);
        return roots;
    }, [commentsForDisplay, searchTerm, sortAsc]);


    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: { xs: '100vw', sm: 420 },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        // MUI paper has overflow-y:auto by default — lock it so the
                        // inner list is the ONLY scrollbar (prevents hidden comments
                        // and the composer drifting away on long threads)
                        overflow: 'hidden',
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fff',
                    flexShrink: 0,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            backgroundColor: 'rgba(115, 103, 240, 0.10)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <MessageCircle size={19} color="#7367f0" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333', lineHeight: 1.2 }}>
                                    Comments
                                </Typography>
                                {commentsForDisplay?.length > 0 && (
                                    <Box sx={{
                                        minWidth: 20,
                                        height: 18,
                                        px: 0.6,
                                        borderRadius: '9px',
                                        backgroundColor: 'rgba(115, 103, 240, 0.10)',
                                        color: '#7367f0',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: 1,
                                    }}>
                                        {commentsForDisplay.length > 99 ? '99+' : commentsForDisplay.length}
                                    </Box>
                                )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{
                                fontSize: '11.5px',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {selectedTask?.taskno ? `${selectedTask.taskno} · ` : ''}{selectedTask?.taskname || 'Task'}
                            </Typography>
                        </Box>
                        <Tooltip title={sortAsc ? 'Oldest first — click for newest' : 'Newest first — click for oldest'} arrow>
                            <IconButton size="small" onClick={() => setSortAsc((p) => !p)} sx={{ color: '#7367f0' }}>
                                <ArrowUpDown size={16} />
                            </IconButton>
                        </Tooltip>
                        {onViewAllComments && (
                            <Tooltip title="Open task details" arrow>
                                <IconButton size="small" onClick={handleOpenTaskDetails} sx={{ color: '#7367f0' }}>
                                    <ExternalLink size={16} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton size="small" onClick={handleClose}>
                            <X size={18} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Search — only when there's something to search */}
                {commentsForDisplay?.length > 2 && (
                    <Box sx={{ px: 2, pt: 1.5, flexShrink: 0 }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Search comments or people..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={15} color="#9a9a9a" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '8px', fontSize: '13px' }
                            }}
                        />
                    </Box>
                )}

                {/* Comments list — the only scroll region.
                    NOTE: no flex-column here — column-flex children default to
                    flex-shrink:1, so cards would compress/clip instead of overflowing
                    and the container would never get a scrollbar. */}
                <Box sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    px: 2,
                    py: 1.5,
                    backgroundColor: '#fff',
                    '&::-webkit-scrollbar': { width: '5px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: '3px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                }}>
                    {isLoadingComments && commentsForDisplay.length === 0 ? (
                        [0, 1, 2].map((i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1.5, p: 1.5, border: '1px solid #f0f0f0', borderRadius: '10px' }}>
                                <Skeleton variant="circular" width={32} height={32} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="40%" height={14} />
                                    <Skeleton variant="text" width="90%" height={16} />
                                    <Skeleton variant="text" width="65%" height={16} />
                                </Box>
                            </Box>
                        ))
                    ) : visibleComments.length > 0 ? (
                        visibleComments.map((comment) => (
                            <CommentCard
                                key={comment?.id ?? comment?.entrydate}
                                comment={comment}
                                replies={comment?.replies ?? []}
                                currentUserId={profileData?.id ?? profileData?.userid}
                                onEditComment={handleEditComment}
                                onDeleteComment={handleDeleteComment}
                                onToggleReaction={handleToggleReaction}
                                onReply={handleReplyComment}
                            />
                        ))
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            py: 6,
                            gap: 1,
                            color: '#9a9a9a'
                        }}>
                            <MessageCircle size={34} strokeWidth={1.5} />
                            <Typography variant="body2" sx={{ fontSize: '13px' }}>
                                {searchTerm ? 'No comments match your search' : 'No comments yet — start the conversation'}
                            </Typography>
                        </Box>
                    )}
                    {isLoadingComments && commentsForDisplay.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', py: 0.5 }}>
                            <CircularProgress size={14} sx={{ color: '#7367f0' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                                Updating…
                            </Typography>
                        </Box>
                    )}
                    <div ref={listEndRef} />
                </Box>


                {/* Composer — pinned to drawer bottom; soft shadow separator
                    (borderTop would double up with the last card's border-bottom) */}
                <Box sx={{
                    px: 2,
                    py: 1.5,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                    backgroundColor: '#fff',
                    flexShrink: 0,
                }}>
                    {/* Selected-file previews */}
                    {selectedFiles.length > 0 && (
                        <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid #f0f0f0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#6c757d', fontSize: '11px', fontWeight: 500 }}>
                                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
                                        setSelectedFiles([]);
                                        setFilePreviews([]);
                                    }}
                                    sx={{ color: '#dc3545', fontSize: '11px' }}
                                >
                                    <X size={14} />
                                </IconButton>
                            </Box>
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
                                gap: 0.8,
                                maxHeight: '130px',
                                overflowY: 'auto',
                                backgroundColor: '#fafbfc',
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                            }}>
                                {filePreviews.map((preview, index) => {
                                    const isImage = preview.file.type.startsWith('image/');
                                    return (
                                        <Box key={index} sx={{ position: 'relative' }}>
                                            <Box sx={{
                                                width: '100%',
                                                aspectRatio: '1',
                                                backgroundColor: '#fff',
                                                borderRadius: '8px',
                                                border: '1px solid #e1e5e9',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: '#7367f0' }
                                            }}
                                                onClick={() => handleFilePreviewClick(preview, index)}
                                            >
                                                {isImage ? (
                                                    <img
                                                        src={preview.url}
                                                        alt={preview.file.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: '6px',
                                                        height: '100%',
                                                        textAlign: 'center'
                                                    }}>
                                                        <Paperclip size={14} color='#1976d2' />
                                                        <Typography variant="caption" sx={{
                                                            fontSize: '8px',
                                                            fontWeight: 600,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            color: '#2c3e50',
                                                            width: '100%',
                                                            mt: 0.5
                                                        }}>
                                                            {preview.file.name.length > 10 ? preview.file.name.substring(0, 10) + '…' : preview.file.name}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile(index);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '-6px',
                                                    right: '-6px',
                                                    width: '18px',
                                                    height: '18px',
                                                    backgroundColor: 'rgba(220, 53, 69, 0.95)',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    borderRadius: '50%',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                                    '&:hover': { backgroundColor: '#c82333' },
                                                    zIndex: 3,
                                                }}
                                            >
                                                ×
                                            </IconButton>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Composer box: "Add a comment" + toolbar + Submit */}
                    <Box sx={{
                        border: 'none',
                        borderRadius: '10px',
                        backgroundColor: '#f5f5f5',
                        px: 1.5,
                        pt: 1,
                        pb: 0.75,
                        transition: 'background-color 0.2s, box-shadow 0.2s',
                        '&:focus-within': {
                            backgroundColor: '#eeeeee',
                            boxShadow: '0 0 0 2px rgba(115, 103, 240, 0.15)'
                        }
                    }}>
                        <TextareaAutosize
                            value={newComment}
                            onChange={handleCommentChange}
                            onKeyDown={handleKeyPress}
                            placeholder="Add a comment"
                            minRows={2}
                            maxRows={6}
                            style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                resize: 'none',
                                fontFamily: '"Public Sans", sans-serif',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                color: '#333',
                                background: 'transparent',
                                boxSizing: 'border-box',
                            }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                    id="comment-file-upload"
                                />
                                <label htmlFor="comment-file-upload">
                                    <Tooltip title="Attach files (max 10, 25MB each)" arrow>
                                        <IconButton
                                            component="span"
                                            size="small"
                                            sx={{ width: 28, height: 28, color: '#8a8a8a', '&:hover': { color: '#7367f0' } }}
                                        >
                                            <Paperclip size={15} />
                                        </IconButton>
                                    </Tooltip>
                                </label>
                            </Box>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleSendComment}
                                disabled={(!newComment.trim() && selectedFiles.length === 0) || isSubmitting}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '12.5px',
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    px: 2,
                                    py: 0.4,
                                    minWidth: 0,
                                    backgroundColor: '#7367f0',
                                    boxShadow: 'none',
                                    '&:hover': { backgroundColor: '#5e57d1', boxShadow: 'none' },
                                    '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
                                }}
                            >
                                {isSubmitting ? <CircularProgress size={13} sx={{ color: 'white' }} /> : 'Submit'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

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
        </>
    );
};

export default CommentMenuPopup;

import React, { useMemo, useState } from 'react';
import { Box, IconButton, TextareaAutosize, Button, Typography } from '@mui/material';
import { Paperclip } from 'lucide-react';
import CommentCard from './CommentCard';
import { uploadFilesForComment } from '../../../Utils/uploadHelpers';
import { getUserProfileData } from '../../../Utils/globalfun';
import { toast } from 'react-toastify';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';

const CommentSection = ({ comments, newComment, onCommentChange, onEditComment, onDeleteComment, onSendComment, onToggleReaction, onReply, taskData }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);
    const profileData = useMemo(() => getUserProfileData(), []);

    const sortedComments = useMemo(() => {
        const byId = new Map();
        const roots = [];
        (comments || []).forEach((c) => {
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
        roots.sort((a, b) => new Date(b?.entrydate) - new Date(a?.entrydate));
        roots.forEach((n) => n.replies?.sort((a, b) => new Date(a?.entrydate) - new Date(b?.entrydate)));
        return roots;
    }, [comments]);

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Check file limit (10 files max)
            const totalFilesAfterAdd = selectedFiles.length + files.length;
            if (totalFilesAfterAdd > 10) {
                const allowedCount = 10 - selectedFiles.length;
                if (allowedCount <= 0) {
                    toast.error('Maximum 10 files allowed. Please remove some files first.');
                    return;
                } else {
                    toast.warning(`You can only add ${allowedCount} more file(s). Maximum 10 files allowed.`);
                    // Take only the allowed number of files
                    files.splice(allowedCount);
                }
            }

            // Check for duplicates and file size (25MB limit like SidebarDrawerFile)
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
        
        // Reset the input value to allow selecting the same files again
        event.target.value = '';
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setFilePreviews(prev => {
            // Revoke object URL to prevent memory leaks
            if (prev[index]) {
                URL.revokeObjectURL(prev[index].url);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleAddComment = async () => {
        try {
            let attachments = [];
            if (selectedFiles.length > 0) {
                const uploadResult = await uploadFilesForComment({
                    folderName: 'Comments',
                    files: selectedFiles,
                });
                if (uploadResult.success) {
                    attachments = uploadResult.attachments;
                }
            }
            // Pass structured attachments to the comment handler
            onSendComment(attachments);
        } catch (e) {
            console.error('File upload in comment failed:', e);
            onSendComment([]); // Still post comment without attachment
        } finally {
            // Clear files and previews
            filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
            setSelectedFiles([]);
            setFilePreviews([]);
        }
    };

    return (
        <>
            {/* Mapping through multiple comments */}
            {sortedComments.map((comment, index) => (
                <CommentCard
                    key={comment?.id ?? index}
                    comment={comment}
                    replies={comment?.replies ?? []}
                    currentUserId={profileData?.id ?? profileData?.userid}
                    onEditComment={onEditComment}
                    onDeleteComment={onDeleteComment}
                    onToggleReaction={onToggleReaction}
                    onReply={onReply}
                />
            ))}

            {/* Add New Comment Section */}
            <Box sx={{ position: 'sticky', bottom: '0', background: '#fff', boxShadow: '0 -2px 10px rgba(0,0,0,0.06)', px: 1.5, py: 1.5, zIndex: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* File attachment section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {selectedFiles.length > 0 && (
                                    <Typography variant="caption" sx={{ 
                                        color: '#6c757d',
                                        fontSize: '12px',
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
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        textTransform: 'none',
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
                        
                        {selectedFiles?.length > 0 && (
                            <Box sx={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                gap: 1,
                                mt: 1.5,
                                maxHeight: '180px',
                                overflowY: 'auto',
                                padding: '4px',
                                backgroundColor: '#fafbfc',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    backgroundColor: '#f1f1f1',
                                    borderRadius: '3px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: '#c1c1c1',
                                    borderRadius: '3px',
                                    '&:hover': {
                                        backgroundColor: '#a8a8a8',
                                    }
                                },
                            }}>
                                {filePreviews?.map((preview, index) => {
                                    const isImage = preview.file.type.startsWith('image/');
                                    return (
                                        <Box key={index} sx={{ 
                                            position: 'relative',
                                            aspectRatio: isImage ? '1' : 'auto',
                                            minHeight: isImage ? '70px' : '55px',
                                            backgroundColor: '#fff',
                                            borderRadius: '8px',
                                            border: '1px solid #e1e5e9',
                                            overflow: 'hidden',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                borderColor: '#7367f0'
                                            }
                                        }}
                                        onClick={() => {
                                            const allFiles = filePreviews?.map((p, idx) => ({
                                                url: p.url,
                                                filename: p.file.name,
                                                extension: p.file.name?.split('.').pop()?.toLowerCase(),
                                                fileObject: p.file
                                            }));
                                      
                                            setCurrentAttachments(allFiles);
                                            setInitialSlideIndex(index);
                                            setViewerOpen(true);
                                        }}
                                        >
                                            {/* Remove button */}
                                            <IconButton 
                                                size="small" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile(index);
                                                }}
                                                sx={{ 
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '18px',
                                                    height: '18px',
                                                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                                                    color: 'white',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    borderRadius: '50%',
                                                    border: '1px solid rgba(255,255,255,0.8)',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                    opacity: 0.8,
                                                    '&:hover': { 
                                                        backgroundColor: 'rgba(200, 35, 51, 0.95)',
                                                        transform: 'scale(1.1)',
                                                        opacity: 1
                                                    },
                                                    zIndex: 3,
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                ×
                                            </IconButton>

                                            {isImage ? (
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
                                                            fontSize: '16px',
                                                            color: 'white'
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
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '8px 4px',
                                                    height: '100%',
                                                    textAlign: 'center',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(115, 103, 240, 0.02)'
                                                    }
                                                }}>
                                                    <Box sx={{ 
                                                        backgroundColor: '#e8f4fd',
                                                        borderRadius: '6px',
                                                        padding: '4px',
                                                        marginBottom: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Paperclip size={12} color='#1976d2' />
                                                    </Box>
                                                    <Typography variant="caption" sx={{ 
                                                        fontSize: '9px',
                                                        fontWeight: '600',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        color: '#2c3e50',
                                                        width: '100%',
                                                        marginBottom: '1px'
                                                    }}>
                                                        {preview.file.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ 
                                                        fontSize: '7px',
                                                        color: '#7f8c8d',
                                                        fontWeight: '500'
                                                    }}>
                                                        {(preview.file.size / 1024).toFixed(1)}KB
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>

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
                            onChange={onCommentChange}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (newComment.trim()) handleAddComment();
                                }
                            }}
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
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <IconButton
                                        component="span"
                                        size="small"
                                        sx={{ width: 28, height: 28, color: '#8a8a8a', '&:hover': { color: '#7367f0' } }}
                                    >
                                        <Paperclip size={15} />
                                    </IconButton>
                                </label>
                            </Box>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleAddComment}
                                disabled={!newComment.trim() && selectedFiles.length === 0}
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
                                Submit
                            </Button>
                        </Box>
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
        </>
    );
};

export default CommentSection;

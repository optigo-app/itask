import React, { useState } from 'react';
import { Box, IconButton, TextareaAutosize, Button, Typography } from '@mui/material';
import { Eye, Paperclip, Send } from 'lucide-react';
import CommentCard from './CommentCard';
import { uploadFilesForComment } from '../../../Utils/uploadHelpers';
import { toast } from 'react-toastify';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';

const CommentSection = ({ comments, newComment, onCommentChange, onEditComment, onDeleteComment, onSendComment, taskData }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);

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
            {comments.map((comment, index) => (
                <CommentCard key={index} comment={comment} onEditComment={onEditComment} onDeleteComment={onDeleteComment} />
            ))}

            {/* Add New Comment Section */}
            <Box sx={{ position: 'sticky', bottom: '0', background: '#fff', padding: '10px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', borderRadius: '8px', padding: '12px', zIndex: 3 }}>
                <TextareaAutosize
                    value={newComment}
                    onChange={onCommentChange}
                    rows={4}
                    placeholder="Add a comment..."
                    className="textarea"
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, marginTop: '12px' }}>
                    {/* File attachment section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                        sx={{
                                            backgroundColor: '#f8f9fa',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            '&:hover': {
                                                backgroundColor: '#e9ecef',
                                                borderColor: '#7367f0'
                                            }
                                        }}
                                    >
                                        <Paperclip size={18} color='#7367f0' />
                                    </IconButton>
                                </label>
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
                        
                        {selectedFiles.length > 0 && (
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
                                {filePreviews.map((preview, index) => {
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
                                            const allFiles = filePreviews.map((p, idx) => ({
                                                url: p.url,
                                                filename: p.file.name,
                                                extension: p.file.name?.split('.').pop()?.toLowerCase(),
                                                fileObject: p.file
                                            }));
                                            const fileData = {
                                                url: preview.url,
                                                filename: preview.file.name,
                                                extension: preview.file.name?.split('.').pop()?.toLowerCase(),
                                                fileObject: preview.file
                                            };
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

                    {/* Button section */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                        <Button
                            size='medium'
                            variant="contained"
                            onClick={handleAddComment}
                            startIcon={<Send size={18} />}
                            disabled={!newComment.trim()}
                            sx={{
                                backgroundColor: '#7367f0',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                textTransform: 'none',
                                boxShadow: '0 2px 8px rgba(115, 103, 240, 0.3)',
                                '&:hover': {
                                    backgroundColor: '#5e57d1',
                                    boxShadow: '0 4px 12px rgba(115, 103, 240, 0.4)',
                                    transform: 'translateY(-1px)'
                                },
                                '&:disabled': {
                                    backgroundColor: '#e9ecef',
                                    color: '#6c757d',
                                    boxShadow: 'none'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Add Comment
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
        </>
    );
};

export default CommentSection;

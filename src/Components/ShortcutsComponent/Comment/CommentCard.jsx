import React, { useState } from "react";
import { Card, Grid, Typography, Box, Avatar, Link, IconButton, Button } from "@mui/material";
import { Download, Eye, ExternalLink, Paperclip } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import { formatDate4, getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';
import './style.scss';

const CommentCard = ({ comment }) => {
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);
    
    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    // Handle single file preview with multiple attachments support
    const handlePreviewClick = (attachment, allAttachments = [], startIndex = 0) => {
        const fileData = {
            url: attachment.url,
            filename: attachment.filename,
            extension: attachment.extension,
            fileObject: null
        };
        
        if (allAttachments.length > 0) {
            // Multiple files - use Swiper
            const attachmentFiles = allAttachments
                .filter(att => att.extension !== 'url') // Exclude URL links from Swiper
                .map(att => ({
                    url: att.url,
                    filename: att.filename,
                    extension: att.extension,
                    fileObject: null
                }));
            
            if (attachmentFiles.length > 0) {
                setCurrentAttachments(attachmentFiles);
                // Find the correct index in the filtered array
                const filteredIndex = attachmentFiles.findIndex(att => att.url === attachment.url);
                setInitialSlideIndex(filteredIndex >= 0 ? filteredIndex : 0);
                setViewerOpen(true);
            }
        } else {
            // Single file - backward compatibility
            setCurrentAttachments([fileData]);
            setInitialSlideIndex(0);
            setViewerOpen(true);
        }
    };

    // Handle viewing all file attachments (excluding URLs)
    const handleViewAllAttachments = (startIndex = 0) => {
        const fileAttachments = comment.attachments
            ?.filter(att => att.extension !== 'url')
            ?.map(att => ({
                url: att.url,
                filename: att.filename,
                extension: att.extension,
                fileObject: null
            })) || [];
        
        if (fileAttachments.length > 0) {
            setCurrentAttachments(fileAttachments);
            setInitialSlideIndex(startIndex);
            setViewerOpen(true);
        }
    };
    return (
        <Card className="commentCard">
            <Grid container spacing={2} alignItems="start">
                {/* User Profile & Name */}
                <Grid item>
                    <Avatar
                        alt={comment?.assignee?.firstname}
                        src={ImageUrl(comment?.assignee)}
                        sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: background(comment?.assignee?.firstname + " " + comment?.assignee?.lastname),
                        }}
                    >
                        {!comment?.assignee?.avatar && comment?.assignee?.firstname?.charAt(0)}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography className="title">
                        {comment?.assignee?.firstname + " " + comment?.assignee?.lastname}
                    </Typography>
                    <Typography className="caption">
                        {formatDate4(comment?.entrydate)}
                    </Typography>
                </Grid>
            </Grid>

            {/* Comment Text */}
            <Typography variant="body1" sx={{ marginTop: 1, color: "#444" }}>
                {comment?.comment}
            </Typography>

            {/* Attachment Section */}
            {comment.attachments?.length > 0 && (
                <Box sx={{ marginTop: 1.5 }}>
                    <Box sx={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                        gap: 0.8,
                        maxHeight: comment.attachments.length > 6 ? '160px' : 'auto',
                        overflowY: comment.attachments.length > 6 ? 'auto' : 'visible',
                        padding: comment.attachments.length > 6 ? '4px' : '0',
                        backgroundColor: comment.attachments.length > 6 ? '#fafbfc' : 'transparent',
                        borderRadius: comment.attachments.length > 6 ? '6px' : '0',
                        border: comment.attachments.length > 6 ? '1px solid #e9ecef' : 'none',
                        '&::-webkit-scrollbar': {
                            width: '3px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                            borderRadius: '2px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#c1c1c1',
                            borderRadius: '2px',
                            '&:hover': {
                                backgroundColor: '#a8a8a8',
                            }
                        },
                    }}>
                        {comment.attachments.map((attachment, index) => (
                            <Box key={index} sx={{
                                position: 'relative',
                                aspectRatio: attachment.isImage ? '1' : 'auto',
                                minHeight: attachment.isImage ? '60px' : '45px',
                                backgroundColor: '#fff',
                                borderRadius: '6px',
                                border: '1px solid #e1e5e9',
                                overflow: 'hidden',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                transition: 'all 0.15s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-0.5px)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    borderColor: '#7367f0'
                                }
                            }}
                            onClick={() => {
                                if (attachment.extension === 'url') {
                                    window.open(attachment.url, '_blank');
                                } else {
                                    handlePreviewClick(attachment, comment.attachments);
                                }
                            }}
                            >
                                {attachment.isImage ? (
                                    // Image attachment - compact card
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
                                                color: 'white',
                                                zIndex: 1,
                                                pointerEvents: 'none'
                                            }
                                        }
                                    }}>
                                        <img 
                                            src={attachment.url} 
                                            alt={attachment.filename}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                        {/* Download button overlay */}
                                        <IconButton 
                                            size="small" 
                                            component="a" 
                                            href={attachment.url} 
                                            download={attachment.filename}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ 
                                                position: 'absolute',
                                                bottom: '3px',
                                                right: '3px',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: 'rgba(255,255,255,0.95)',
                                                color: '#7367f0',
                                                borderRadius: '50%',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                zIndex: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255,255,255,1)',
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 3px 6px rgba(0,0,0,0.15)'
                                                }
                                            }}
                                        >
                                            <Download size={12} />
                                        </IconButton>
                                    </Box>
                                ) : attachment.extension === 'url' ? (
                                    // URL link - compact card
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px',
                                        height: '100%',
                                        textAlign: 'center',
                                        backgroundColor: '#fff3e0',
                                        '&:hover': {
                                            backgroundColor: '#ffecb3'
                                        }
                                    }}>
                                        <ExternalLink size={14} color="#ff9800" style={{ marginBottom: '2px' }} />
                                        <Typography variant="caption" sx={{ 
                                            fontSize: '7px',
                                            fontWeight: '600',
                                            color: '#ff9800',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            width: '100%'
                                        }}>
                                            {attachment.filename}
                                        </Typography>
                                    </Box>
                                ) : (
                                    // File attachment - compact card
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px',
                                        height: '100%',
                                        textAlign: 'center',
                                        '&:hover': {
                                            backgroundColor: 'rgba(115, 103, 240, 0.02)'
                                        }
                                    }}>
                                        <Box sx={{ 
                                            backgroundColor: '#e8f4fd',
                                            borderRadius: '4px',
                                            padding: '3px',
                                            marginBottom: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <DescriptionIcon sx={{ color: "#2196f3", fontSize: 12 }} />
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
                                            marginBottom: '1px'
                                        }}>
                                            {attachment.filename}
                                        </Typography>
                                        <Typography variant="caption" sx={{ 
                                            fontSize: '5px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>
                                            {attachment.extension.toUpperCase()}
                                        </Typography>
                                        {/* Download button */}
                                        <IconButton 
                                            size="small" 
                                            component="a" 
                                            href={attachment.url} 
                                            download={attachment.filename}
                                            onClick={(e) => e.stopPropagation()}
                                            sx={{ 
                                                position: 'absolute',
                                                bottom: '2px',
                                                right: '2px',
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: 'rgba(33, 150, 243, 0.15)',
                                                color: '#2196f3',
                                                borderRadius: '50%',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(33, 150, 243, 0.25)',
                                                    transform: 'scale(1.1)',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                                }
                                            }}
                                        >
                                            <Download size={10} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {/* {comment.attachments?.length > 0 && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        background: "#EEF7FF",
                        borderRadius: "8px",
                        padding: "10px",
                        marginTop: 2,
                    }}
                >
                    <DescriptionIcon sx={{ color: "#007BFF", fontSize: 32 }} />
                    <Box sx={{ flexGrow: 1, marginLeft: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                            {comment.attachments[0].filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Preview File {comment.attachments[0].size}
                        </Typography>
                    </Box>
                    <IconButton component="a" href={comment.attachments[0].url} download>
                        <Download size={20} />
                    </IconButton>
                </Box>
            )} */}
            
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
        </Card>
    );
};

export default CommentCard;

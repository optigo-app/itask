import React, { useState } from "react";
import { Card, Grid, Typography, Box, IconButton, Avatar, Link } from "@mui/material";
import { Download, MoreVertical, FileText, Image, Video, File, Eye, ExternalLink } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { formatDate4, getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';
import './style.scss';

const AnnouncementCard = ({announcement}) => {
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);
    
    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    // Helper function to get file extension
    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    // Helper function to determine if file is image
    const isImageFile = (filename) => {
        const extension = getFileExtension(filename);
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        return imageExtensions.includes(extension);
    };

    // Handle single file preview with multiple attachments support
    const handlePreviewClick = (attachment, allAttachments = [], startIndex = 0) => {
        const fileData = {
            url: attachment.url,
            filename: attachment.filename,
            extension: getFileExtension(attachment.filename),
            fileObject: null
        };
        
        if (allAttachments.length > 0) {
            // Multiple files - use Swiper
            const attachmentFiles = allAttachments.map(att => ({
                url: att.url,
                filename: att.filename,
                extension: getFileExtension(att.filename),
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
    return (
        <Card className="commentCard">
            <Grid container spacing={2} alignItems="start">
                {/* User Profile & Name */}
                <Grid item>
                    <Avatar
                        alt={announcement?.user?.firstname}
                        src={ImageUrl(announcement?.user)}
                        sx={{
                            width: 30,
                            height: 30,
                            backgroundColor: background(announcement?.user?.firstname + " " + announcement?.user?.lastname),
                        }}
                    >
                        {!announcement?.user?.avatar && announcement?.user?.firstname?.charAt(0)}
                    </Avatar>
                </Grid>
                <Grid item xs>
                    <Typography className="title">
                        {announcement?.user?.firstname + " " + announcement?.user?.lastname}
                    </Typography>
                    <Typography className="caption">
                        {formatDate4(announcement?.entrydate)}
                    </Typography>
                </Grid>
            </Grid>

            {/* Comment Text */}
            <Typography variant="body1" sx={{ marginTop: 1, color: "#444" }}>
                {announcement?.comment}
            </Typography>

            {/* Attachment Section */}
            {announcement.attachments?.length > 0 && (
                <Box sx={{ marginTop: 1.5 }}>
                    <Box sx={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                        gap: 0.8,
                        maxHeight: announcement.attachments.length > 6 ? '160px' : 'auto',
                        overflowY: announcement.attachments.length > 6 ? 'auto' : 'visible',
                        padding: announcement.attachments.length > 6 ? '4px' : '0',
                        backgroundColor: announcement.attachments.length > 6 ? '#fafbfc' : 'transparent',
                        borderRadius: announcement.attachments.length > 6 ? '6px' : '0',
                        border: announcement.attachments.length > 6 ? '1px solid #e9ecef' : 'none',
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
                        {announcement.attachments.map((attachment, index) => {
                            const isImage = isImageFile(attachment.filename);
                            return (
                                <Box key={index} sx={{
                                    position: 'relative',
                                    aspectRatio: isImage ? '1' : 'auto',
                                    minHeight: isImage ? '60px' : '45px',
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
                                    handlePreviewClick(attachment, announcement.attachments);
                                }}
                                >
                                    {isImage ? (
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
                                                {getFileExtension(attachment.filename).toUpperCase()}
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
                            );
                        })}
                    </Box>
                </Box>
            )}
            
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

export default AnnouncementCard;

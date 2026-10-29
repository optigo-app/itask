import React, { useState } from "react";
import { Card, Typography, Box, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, TextareaAutosize, Button } from "@mui/material";
import { Download, ExternalLink, MoreHorizontal, Pencil, Trash2, ThumbsUp, ThumbsDown, Send, X, CircleMinus, CirclePlus } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { formatTimeAgo, ImageUrl, getAvatarColors, getInitials } from '../../../Utils/globalfun';
import DocsViewerModal from '../../DocumentViewer/DocsViewerModal';
import SafeAvatar from '../SafeAvatar';
import './style.scss';

// Reddit-style threading: small per-level indent with a thread line.
// Replies deeper than this render flat + "Replying to" context line.
const MAX_VISUAL_DEPTH = 6;
// Reply button hides at/after this depth so threads can't grow unusably deep.
const MAX_REPLY_DEPTH = 6;

const CommentCard = ({
    comment,
    replies = [],
    depth = 0,
    parentName = '',
    currentUserId,
    onEditComment,
    onDeleteComment,
    onToggleReaction,
    onReply,
}) => {
    const [currentAttachments, setCurrentAttachments] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [initialSlideIndex, setInitialSlideIndex] = useState(0);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment?.comment ?? '');
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [repliesCollapsed, setRepliesCollapsed] = useState(false);

    const isOwn = currentUserId != null && String(comment?.appuserid) === String(currentUserId);
    const canManage = isOwn && (onEditComment || onDeleteComment);
    // Each nested level indents ~28px; pull inline composers back that much so
    // the input keeps a usable width on deep threads.
    const composerPullBack = Math.min(depth, MAX_VISUAL_DEPTH) * 28;

    const handlePreviewClick = (attachment, allAttachments = [], startIndex = 0) => {
        const fileData = {
            url: attachment.url,
            filename: attachment.filename,
            extension: attachment.extension,
            fileObject: null
        };

        if (allAttachments.length > 0) {
            const attachmentFiles = allAttachments
                .filter(att => att.extension !== 'url')
                .map(att => ({
                    url: att.url,
                    filename: att.filename,
                    extension: att.extension,
                    fileObject: null
                }));

            if (attachmentFiles.length > 0) {
                setCurrentAttachments(attachmentFiles);
                const filteredIndex = attachmentFiles.findIndex(att => att.url === attachment.url);
                setInitialSlideIndex(filteredIndex >= 0 ? filteredIndex : 0);
                setViewerOpen(true);
            }
        } else {
            setCurrentAttachments([fileData]);
            setInitialSlideIndex(0);
            setViewerOpen(true);
        }
    };

    const handleSaveEdit = () => {
        const trimmed = editText.trim();
        if (!trimmed || trimmed === comment?.comment) {
            setIsEditing(false);
            setEditText(comment?.comment ?? '');
            return;
        }
        onEditComment?.(comment, trimmed);
        setIsEditing(false);
    };

    const handleSendReply = () => {
        const trimmed = replyText.trim();
        if (!trimmed) return;
        onReply?.(comment, trimmed);
        setReplyText('');
        setIsReplying(false);
    };

    const likeCount = Number(comment?.likecount) || 0;
    const myLike = Number(comment?.mylike) === 1;
    const dislikeCount = Number(comment?.dislikecount) || 0;
    const myDislike = Number(comment?.mydislike) === 1;

    return (
        <Card className="commentCard">
            <Box className="commentHead">
                <SafeAvatar
                    alt={comment?.assignee?.firstname}
                    src={ImageUrl(comment?.assignee)}
                    sx={{
                        width: 32,
                        height: 32,
                        ...getAvatarColors(comment?.assignee?.firstname + " " + comment?.assignee?.lastname),
                    }}
                >
                    {!comment?.assignee?.avatar && getInitials(comment?.assignee?.firstname, comment?.assignee?.lastname)}
                </SafeAvatar>
                <Box className="commentMeta">
                    {depth > MAX_VISUAL_DEPTH && !!parentName && (
                        <Typography className="replyToLabel">
                            Replying to {parentName}
                        </Typography>
                    )}
                    <Typography className="title" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                        {comment?.assignee?.firstname + " " + comment?.assignee?.lastname}
                        <Typography component="span" className="caption" sx={{ fontSize: '11px', fontWeight: 400 }}>
                            · {formatTimeAgo(comment?.entrydate)}
                            {comment?.editdate && ' (edited)'}
                        </Typography>
                    </Typography>
                </Box>
                {canManage && (
                    <IconButton
                        size="small"
                        className="commentMenuBtn"
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        sx={{ color: '#9a9a9a', width: 26, height: 26, '&:hover': { color: '#333' } }}
                    >
                        <MoreHorizontal size={16} />
                    </IconButton>
                )}
            </Box>

            <Box className="commentContent">
            {/* Comment Text / inline edit */}
            {isEditing ? (
                <Box sx={{ mt: 1, ml: `-${composerPullBack}px` }}>
                    <TextareaAutosize
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        minRows={2}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #d0d0d0',
                            fontFamily: '"Public Sans", sans-serif',
                            fontSize: '13.5px',
                            lineHeight: 1.5,
                            resize: 'none',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#7367f0'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#d0d0d0'; }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
                        <Button
                            size="small"
                            onClick={() => { setIsEditing(false); setEditText(comment?.comment ?? ''); }}
                            sx={{ textTransform: 'none', fontSize: '12px', color: '#6c757d', minWidth: 0 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveEdit}
                            disabled={!editText.trim()}
                            sx={{
                                textTransform: 'none',
                                fontSize: '12px',
                                backgroundColor: '#7367f0',
                                borderRadius: '6px',
                                boxShadow: 'none',
                                '&:hover': { backgroundColor: '#5e57d1', boxShadow: 'none' }
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Typography variant="body1" className="commentBody">
                    {comment?.comment}
                </Typography>
            )}

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
                                            {attachment?.filename}
                                        </Typography>
                                        <Typography variant="caption" sx={{
                                            fontSize: '5px',
                                            color: '#7f8c8d',
                                            fontWeight: '500'
                                        }}>
                                            {attachment?.extension?.toUpperCase()}
                                        </Typography>
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

            {/* Footer: collapse + reaction + reply */}
            {(onToggleReaction || onReply || replies.length > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {replies.length > 0 && (
                        <Box
                            component="span"
                            onClick={() => setRepliesCollapsed((p) => !p)}
                            title={repliesCollapsed ? 'Show replies' : 'Hide replies'}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.4,
                                cursor: 'pointer',
                                userSelect: 'none',
                                color: '#9a9a9a',
                                fontSize: '11px',
                                fontWeight: 600,
                                transition: 'color 0.15s ease',
                                // Reddit-style: sits on the thread line under the avatar,
                                // not inside the text column
                                ml: '-28px',
                                mr: '4px',
                                '&:hover': { color: '#7367f0' },
                            }}
                        >
                            {repliesCollapsed ? <CirclePlus size={16} /> : <CircleMinus size={16} />}
                            {repliesCollapsed && `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
                        </Box>
                    )}
                    {onToggleReaction && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                            <Box
                                component="span"
                                onClick={() => onToggleReaction(comment, '👍')}
                                title="Like"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: myLike ? '#7367f0' : '#9a9a9a',
                                    fontSize: '12px',
                                    fontWeight: myLike ? 700 : 500,
                                    userSelect: 'none',
                                    borderRadius: '4px',
                                    transition: 'color 0.15s ease',
                                    '&:hover': { color: '#7367f0' }
                                }}
                            >
                                <ThumbsUp size={14} fill={myLike ? '#7367f0' : 'none'} />
                                {likeCount > 0 && <span style={{ marginLeft: 2 }}>{likeCount}</span>}
                            </Box>
                            <Box
                                component="span"
                                onClick={() => onToggleReaction(comment, '👎')}
                                title="Dislike"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    color: myDislike ? '#dc3545' : '#9a9a9a',
                                    fontSize: '12px',
                                    fontWeight: myDislike ? 700 : 500,
                                    userSelect: 'none',
                                    borderRadius: '4px',
                                    transition: 'color 0.15s ease',
                                    '&:hover': { color: '#dc3545' }
                                }}
                            >
                                <ThumbsDown size={14} fill={myDislike ? '#dc3545' : 'none'} />
                                {dislikeCount > 0 && <span style={{ marginLeft: 2 }}>{dislikeCount}</span>}
                            </Box>
                        </Box>
                    )}
                    {onReply && depth < MAX_REPLY_DEPTH && (
                        <Typography
                            component="span"
                            onClick={() => setIsReplying(p => !p)}
                            sx={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#3a3f4b',
                                cursor: 'pointer',
                                borderLeft: '1px solid #e4e4e8',
                                pl: 1.5,
                                height: 14,
                                lineHeight: '14px',
                                '&:hover': { color: '#7367f0' }
                            }}
                        >
                            Reply
                        </Typography>
                    )}
                </Box>
            )}

            {/* Inline reply composer — pulled back left by the accumulated
                thread indent so it keeps a usable width on deep replies */}
            {isReplying && (
                <Box sx={{
                    mt: 1,
                    ml: `-${composerPullBack}px`,
                    borderRadius: '10px',
                    backgroundColor: '#f1f3f6',
                    px: 1.5,
                    pt: 1,
                    pb: 0.75,
                    position: 'relative',
                    transition: 'background-color 0.2s, box-shadow 0.2s',
                    '&:focus-within': {
                        backgroundColor: '#eceef3',
                        boxShadow: '0 0 0 2px rgba(115, 103, 240, 0.15)'
                    }
                }}>
                    <IconButton
                        size="small"
                        onClick={() => { setIsReplying(false); setReplyText(''); }}
                        sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            color: '#9a9a9a',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                                color: '#fff',
                                backgroundColor: '#dc3545'
                            }
                        }}
                    >
                        <X size={15} />
                    </IconButton>
                    <TextareaAutosize
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply();
                            }
                        }}
                        placeholder={`Reply to ${comment?.assignee?.firstname ?? 'comment'}…`}
                        minRows={2}
                        maxRows={6}
                        autoFocus
                        style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            resize: 'none',
                            fontFamily: '"Public Sans", sans-serif',
                            fontSize: '12.5px',
                            lineHeight: 1.5,
                            color: '#333',
                            background: 'transparent',
                            boxSizing: 'border-box',
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                            size="small"
                            onClick={handleSendReply}
                            disabled={!replyText.trim()}
                            sx={{
                                width: 28,
                                height: 28,
                                backgroundColor: '#7367f0',
                                color: 'white',
                                '&:hover': { backgroundColor: '#5f58d6' },
                                '&.Mui-disabled': { backgroundColor: '#e0e0e0', color: '#9e9e9e' }
                            }}
                        >
                            <Send size={13} />
                        </IconButton>
                    </Box>
                </Box>
            )}

            {/* ⋯ menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: 120 } }}
            >
                {onEditComment && (
                    <MenuItem
                        dense
                        onClick={() => {
                            setMenuAnchor(null);
                            setEditText(comment?.comment ?? '');
                            setIsEditing(true);
                        }}
                        sx={{ fontSize: '13px' }}
                    >
                        <ListItemIcon sx={{ minWidth: 28 }}><Pencil size={14} /></ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '13px' }}>Edit</ListItemText>
                    </MenuItem>
                )}
                {onDeleteComment && (
                    <MenuItem
                        dense
                        onClick={() => {
                            setMenuAnchor(null);
                            onDeleteComment(comment);
                        }}
                        sx={{ fontSize: '13px', color: '#dc3545' }}
                    >
                        <ListItemIcon sx={{ minWidth: 28, color: '#dc3545' }}><Trash2 size={14} /></ListItemIcon>
                        <ListItemText primaryTypographyProps={{ fontSize: '13px' }}>Delete</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            {/* Nested replies */}
            {replies.length > 0 && !repliesCollapsed && (
                <Box className={`commentReplies${depth >= MAX_VISUAL_DEPTH ? ' flat' : ''}`}>
                    {replies.map((reply) => (
                        <CommentCard
                            key={reply?.id ?? reply?.entrydate}
                            comment={reply}
                            replies={reply?.replies ?? []}
                            depth={depth + 1}
                            parentName={`${comment?.assignee?.firstname ?? ''} ${comment?.assignee?.lastname ?? ''}`.trim()}
                            currentUserId={currentUserId}
                            onEditComment={onEditComment}
                            onDeleteComment={onDeleteComment}
                            onToggleReaction={onToggleReaction}
                            onReply={onReply}
                        />
                    ))}
                </Box>
            )}
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
        </Card>
    );
};

export default CommentCard;

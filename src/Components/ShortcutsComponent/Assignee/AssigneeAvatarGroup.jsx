import React, { useState, memo } from 'react';
import {
    Box,
    Avatar,
    Tooltip,
    Menu,
    MenuItem,
    Typography,
    IconButton
} from '@mui/material';
import { CirclePlus } from 'lucide-react';
import { ImageUrl, getRandomAvatarColor } from '../../../Utils/globalfun';

const AssigneeAvatarGroup = memo(({
    assignees = [],
    task,
    maxVisible = 3,
    showAddButton = false,
    hoveredTaskId,
    hoveredColumnName,
    onAvatarClick,
    onAddClick,
    size = 25,
    spacing = 0.5
}) => {
    const [anchorAssigneeEl, setAnchorAssigneeEl] = useState(null);
    const [overflowAssignees, setOverflowAssignees] = useState([]);

    const visibleAssignees = assignees?.slice(0, maxVisible) || [];
    const remainingAssignees = assignees?.slice(maxVisible) || [];
    const hasOverflow = remainingAssignees.length > 0;

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    const handleOpenAssigneeOverflow = (event, remainingAssignees) => {
        event.stopPropagation();
        setAnchorAssigneeEl(event.currentTarget);
        setOverflowAssignees(remainingAssignees);
    };

    const handleCloseAssigneeOverflow = () => {
        setAnchorAssigneeEl(null);
        setOverflowAssignees([]);
    };

    const handleAvatarClick = (assignee) => {
        if (onAvatarClick) {
            onAvatarClick(assignees, assignee?.id);
        }
        handleCloseAssigneeOverflow();
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Visible Avatars */}
                    {visibleAssignees?.map((assignee, index) => (
                        <Tooltip
                            placement="top"
                            key={assignee?.id || index}
                            title={`${assignee?.firstname} ${assignee?.lastname}`}
                            arrow
                            classes={{ tooltip: 'custom-tooltip' }}
                        >
                            <Avatar
                                alt={`${assignee?.firstname} ${assignee?.lastname}`}
                                src={ImageUrl(assignee) || null}
                                sx={{
                                    width: size,
                                    height: size,
                                    fontSize: `${size * 0.4}px`,
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                    backgroundColor: background(`${assignee?.firstname + " " + assignee?.lastname}`),
                                    '&:hover': {
                                        transform: 'scale(1.2)',
                                        zIndex: 10,
                                    },
                                }}
                                onClick={() => handleAvatarClick(assignee)}
                            >
                                {!assignee.avatar && assignee?.firstname?.charAt(0)}
                            </Avatar>
                        </Tooltip>
                    ))}
                    
                    {/* Overflow Avatar */}
                    {hasOverflow && (
                        <Tooltip
                            placement="top"
                            title={`+${remainingAssignees.length} more assignees`}
                            arrow
                            classes={{ tooltip: 'custom-tooltip' }}
                        >
                            <Avatar
                                sx={{
                                    width: size,
                                    height: size,
                                    fontSize: `${size * 0.35}px`,
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'transform 0.3s ease-in-out',
                                    backgroundColor: '#e0e0e0',
                                    color: '#666',
                                    '&:hover': {
                                        transform: 'scale(1.2)',
                                        zIndex: 10,
                                        backgroundColor: '#d0d0d0',
                                    },
                                }}
                                onClick={(e) => handleOpenAssigneeOverflow(e, remainingAssignees)}
                            >
                                +{remainingAssignees.length}
                            </Avatar>
                        </Tooltip>
                    )}
                </Box>

                {/* Add Button */}
                {task?.parentid != 0 && showAddButton && onAddClick && (
                    <IconButton
                        id="add-assignee"
                        aria-label="add-assignee"
                        size="small"
                        onClick={() => onAddClick(task)}
                        style={{
                            visibility: hoveredTaskId === task?.taskid && hoveredColumnName === 'Assignee' ? 'visible' : 'hidden',
                        }}
                    >
                        <CirclePlus size={20} color="#7367f0" />
                    </IconButton>
                )}
            </Box>

            {/* Assignee Overflow Menu */}
            <Menu
                anchorEl={anchorAssigneeEl}
                open={Boolean(anchorAssigneeEl)}
                onClose={handleCloseAssigneeOverflow}
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "8px !important",
                            boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                            minWidth: '200px',
                            maxWidth: '300px',
                            '& .MuiList-root': {
                                paddingTop: "8px !important",
                                paddingBottom: "8px !important",
                            },
                        },
                    },
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {overflowAssignees?.map((assignee, index) => (
                    <MenuItem
                        key={assignee?.id || index}
                        onClick={() => handleAvatarClick(assignee)}
                        sx={{
                            margin: "2px 8px !important",
                            borderRadius: "6px !important",
                            padding: "8px 12px !important",
                            "&:hover": {
                                backgroundColor: "#f5f5f5 !important",
                                borderRadius: "6px !important",
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Avatar
                                alt={`${assignee?.firstname} ${assignee?.lastname}`}
                                src={ImageUrl(assignee) || null}
                                sx={{
                                    width: 32,
                                    height: 32,
                                    fontSize: '0.9rem',
                                    backgroundColor: background(`${assignee?.firstname + " " + assignee?.lastname}`)
                                }}
                            >
                                {!assignee.avatar && assignee?.firstname?.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 500, 
                                        color: '#333',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {assignee?.firstname} {assignee?.lastname}
                                </Typography>
                                {assignee?.email && (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: '#666',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'block'
                                        }}
                                    >
                                        {assignee?.email}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
});

AssigneeAvatarGroup.displayName = 'AssigneeAvatarGroup';

export default AssigneeAvatarGroup;

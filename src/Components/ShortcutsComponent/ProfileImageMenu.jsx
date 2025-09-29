import React, { useState, useRef } from 'react';
import {
    Avatar,
    Menu,
    Typography,
    Box,
    Tooltip,
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import {Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { background, ImageUrl } from '../../Utils/globalfun';

const ProfileImageMenu = ({
    profile,
    allAssignees = [],
    size = 25,
    limit = 5,
    fontSize = '0.8rem',
    showTooltip = true,
    onProfileClick,
    ...avatarProps
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const swiperRef = useRef(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
        if (onProfileClick) {
            onProfileClick(profile);
        }
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSlideChange = (swiper) => {
        setCurrentIndex(swiper.activeIndex);
    };

    const displayName = `${profile?.firstname || ''} ${profile?.lastname || ''}`.trim() || 'Employee';
    const initials = (profile?.firstname?.[0] || '') + (profile?.lastname?.[0] || '');

    const avatarElement = (
        <Avatar
            alt={displayName}
            src={ImageUrl(profile) || undefined}
            onClick={handleAvatarClick}
            sx={{
                width: size,
                height: size,
            
                fontSize: fontSize,
                cursor: 'pointer',
                backgroundColor: background(displayName),
                border: 'none',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.2)',
                    zIndex: 10,
                },
                ...avatarProps.sx
            }}
            {...avatarProps}
        >
            {!ImageUrl(profile) && initials}
        </Avatar>
    );

    return (
        <>
            {showTooltip ? (
                <Tooltip
                    title={displayName}
                    arrow
                    classes={{ tooltip: 'custom-tooltip' }}
                >
                    {avatarElement}
                </Tooltip>
            ) : (
                avatarElement
            )}

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        width: 170,
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        '& .swiper': {
                            height: '220px'
                        },
                        '& .swiper-button-next, & .swiper-button-prev': {
                            display: 'none'
                        },
                        '& .swiper-pagination': {
                            top: '140px',
                            bottom: 'auto',
                            '& .swiper-pagination-bullet': {
                                backgroundColor: '#1976d2',
                                opacity: 0.3,
                                width: '8px',
                                height: '8px',
                                margin: '0 4px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    opacity: 0.7,
                                    transform: 'scale(1.2)'
                                }
                            },
                            '& .swiper-pagination-bullet-active': {
                                opacity: 1,
                                transform: 'scale(1.3)',
                                background: 'linear-gradient(45deg, #1976d2, #42a5f5)'
                            },
                            '& .MuiList-root': {
                                padding: '0 !important'
                            }
                        }
                    }
                }}
            >
                {allAssignees.length > 1 ? (
                    <>
                        <Swiper
                            ref={swiperRef}
                            modules={[Pagination]}
                            pagination={{ clickable: true }}
                            initialSlide={currentIndex}
                            onSlideChange={handleSlideChange}
                            spaceBetween={0}
                            slidesPerView={1}
                            style={{ height: '180px' }}
                        >
                            {allAssignees.map((assignee, index) => {
                                const assigneeDisplayName = `${assignee?.firstname || ''} ${assignee?.lastname || ''}`.trim() || 'Employee';
                                const assigneeInitials = (assignee?.firstname?.[0] || '') + (assignee?.lastname?.[0] || '');
                                
                                return (
                                    <SwiperSlide key={assignee?.id || index}>
                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}>
                                            <Box sx={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                mb: 2
                                            }}>
                                                <Avatar
                                                    alt={assigneeDisplayName}
                                                    src={ImageUrl(assignee) || undefined}
                                                    sx={{
                                                        width: 70,
                                                        height: 70,
                                                        fontSize: '1.8rem',
                                                        backgroundColor: background(assigneeDisplayName),
                                                        mx: 'auto',
                                                        border: '4px solid white',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                                        }
                                                    }}
                                                >
                                                    {!ImageUrl(assignee) && assigneeInitials}
                                                </Avatar>
                                            </Box>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    fontWeight: 700, 
                                                    mb: 0.5,
                                                    color: '#1a1a1a',
                                                    fontSize: '1rem',
                                                    lineHeight: 1.2
                                                }}
                                            >
                                                {assigneeDisplayName}
                                            </Typography>
                                            {assignee?.designation && (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        color: '#1976d2',
                                                        fontWeight: 500,
                                                        mb: 0.5,
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {assignee.designation}
                                                </Typography>
                                            )}
                                            {assignee?.email && (
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                        opacity: 0.8
                                                    }}
                                                >
                                                    {assignee.email}
                                                </Typography>
                                            )}
                                        </Box>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </>
                ) : (
                    <Box sx={{ 
                        textAlign: 'center', 
                        height: '170px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <Box sx={{
                            position: 'relative',
                            display: 'inline-block',
                            mb: 2
                        }}>
                            <Avatar
                                alt={displayName}
                                src={ImageUrl(profile) || undefined}
                                sx={{
                                    width: 70,
                                    height: 70,
                                    fontSize: '1.8rem',
                                    backgroundColor: background(displayName),
                                    mx: 'auto',
                                    border: '4px solid white',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {!ImageUrl(profile) && initials}
                            </Avatar>
                        </Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 700, 
                                mb: 0.5,
                                color: '#1a1a1a',
                                fontSize: '1rem',
                                lineHeight: 1.2
                            }}
                        >
                            {displayName}
                        </Typography>
                        {profile?.designation && (
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: '#1976d2',
                                    fontWeight: 500,
                                    mb: 0.5,
                                    fontSize: '0.85rem'
                                }}
                            >
                                {profile.designation}
                            </Typography>
                        )}
                        {profile?.email && (
                            <Typography 
                                variant="caption" 
                                sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    opacity: 0.8
                                }}
                            >
                                {profile.email}
                            </Typography>
                        )}
                    </Box>
                )}
            </Menu>
        </>
    );
};

export default ProfileImageMenu;
 
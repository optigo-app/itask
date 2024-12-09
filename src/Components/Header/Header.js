import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Avatar } from '@mui/material';
import { Bell } from 'lucide-react'; // Import the notification icon
import './header.scss';

const Header = ({ avatarSrc = "" }) => {
    const location = useLocation();

    // Mapping paths to titles and subtitles
    const dataMap = {
        "/": {
            title: "Home",
            subtitle: "Monitor all your project and tasks here"
        },
        "/inbox": {
            title: "Inbox",
            subtitle: "Check your messages and notifications"
        },
        "/calendar": {
            title: "Calendar",
            subtitle: "Keep track of your events and tasks"
        },
        "/meeting": {
            title: "Meetings",
            subtitle: "Manage and schedule your meetings"
        },
        "/task": {
            title: "My Tasks",
            subtitle: "View all of your tasks here"
        },
        "/project": {
            title: "Projects",
            subtitle: "Manage and monitor your projects"
        },
        "/masters": {
            title: "Masters",
            subtitle: "Manage all your masters here"
        }
    };

    // Get current page's title and subtitle
    const { title, subtitle } = dataMap[location.pathname] || {
        title: "Page Not Found",
        subtitle: "The requested page does not exist"
    };

    const userName = 'Shivam';

    // Array of random colors
    const colors = [
        '#FF5722', '#4CAF50', '#2196F3', '#FFC107',
        '#E91E63', '#9C27B0', '#3F51B5', '#00BCD4'
    ];

    const getRandomColor = (name) => {
        const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charSum % colors.length];
    };

    const avatarBackgroundColor = avatarSrc ? 'transparent' : getRandomColor(userName);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px'
            }}
            className='headerContainer'
        >
            <Box>
                <Typography variant="h6" component="div" className='headerTitle'>
                    {title}
                </Typography>
                <Typography variant="subtitle1" component="div" className='headerSubtitle'>
                    {subtitle}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Bell
                    size={24}
                    style={{
                        color: '#7d7f85',
                        marginRight: '10px',
                        cursor: 'pointer'
                    }}
                />
                <Avatar
                    alt={userName}
                    src={avatarSrc}
                    sx={{
                        backgroundColor: avatarBackgroundColor,
                        color: '#fff',
                        borderRadius: '8px'
                    }}
                    variant="square"
                >
                    {!avatarSrc && userName.charAt(0).toUpperCase()}
                </Avatar>
            </Box>
        </Box>
    );
};

export default Header;

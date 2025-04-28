import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import React, { useState } from 'react'
import "./NotificationTable.scss"
import NotificationGrid from '../../Components/NotificationComp/NotificationGrid'
import DasboardTab from '../../Components/Project/Dashboard/dasboardTab';

const notifications = [
    {
        id: 1,
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
        title: "Task Assigned: Design Homepage 🎨",
        message: "You have been assigned to design the homepage for Project X.",
        time: "2h ago",
        markAsUnread: true,
        hasActions: true,
    },
    {
        id: 2,
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
        title: "Meeting Reminder 📅",
        message: "Don't forget the meeting scheduled for 3 PM today.",
        time: "4h ago",
        markAsUnread: false,
        hasActions: true,
    },
];

const tabData = [
    { label: 'All', content: 'allNotification' },
    { label: 'Read', content: 'readNotification' },
    { label: 'Unread', content: 'unreadNotification' },
];

const NotificationTable = () => {
    const [selectedTab, setSelectedTab] = useState(tabData[0]?.label || '');

    const handleTabChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedTab(newValue);
        }
    };

    const handleMarkAsRead = (id) => {
        console.log(`Marked as read: ${id}`);
    };

    const handleMarkAsUnread = (id) => {
        console.log(`Marked as unread: ${id}`);
    };

    const handleDelete = (id) => {
        console.log(`Deleted notification: ${id}`);
    };

    const ViewToggleButtons = ({ tabData, selectedTab, handleChange }) => {
        return (
            <Box className="notification_ToggleBox">
                <ToggleButtonGroup
                    value={selectedTab}
                    exclusive
                    onChange={handleChange}
                    aria-label="dashboard tab selection"
                    className="toggle-group"
                >
                    {tabData.map((item) => (
                        <ToggleButton key={item.label} value={item.label} className="toggle-button">
                            {item.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                padding: "20px",
                borderRadius: "8px",
                overflow: "hidden !important",
            }}
            className="NotificationMainBox"
        >
            <Box sx={{ width: '25%' }}>
                <DasboardTab
                    tabData={tabData}
                    selectedTab={selectedTab}
                    handleChange={handleTabChange}
                />
            </Box>

            <div
                style={{
                    margin: "20px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }}
            />
            <NotificationGrid
                notifications={notifications}
                handleMarkAsRead={handleMarkAsRead}
                handleMarkAsUnread={handleMarkAsUnread}
                handleDelete={handleDelete}
            />
        </Box>
    )
}

export default NotificationTable
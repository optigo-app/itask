import React, { useState } from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Notification.scss";
import MailIcon from '@mui/icons-material/Mail';
import DraftsIcon from '@mui/icons-material/Drafts';
import { useSetRecoilState } from "recoil";
import { notificationList } from "../../Recoil/atom";

const NotificationCard = ({ notification }) => {
    const [hover, setHover] = useState(false);
    const setNotifications = useSetRecoilState(notificationList);

    const handleToggleRead = () => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification?.id ? { ...n, markAsUnread: !n.markAsUnread } : n))
        );
    };

    const handleRemove = () => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification?.id));
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e0e0e0",
                padding: "10px",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="notiCardCo"
        >
            <Box sx={{ display: "flex", alignItems: "center", position: "relative", width: "100%" }}>
                <Avatar sx={{ bgcolor: notification.color ? `${notification.color}1f` : "#d1e7dd", marginRight: 2, color: notification.color || '#444', fontWeight: 600 }}>
                    {notification.avatar?.includes?.("http") ? (
                        <img
                            src={notification.avatar}
                            alt={notification.title}
                            style={{ width: "100%" }}
                        />
                    ) : (
                        notification.avatar || (notification.eyebrow || notification.title || "N").slice(0, 2).toUpperCase()
                    )}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" fontWeight={600}>
                        {notification.title}
                    </Typography>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" color="text.secondary">
                        {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography className="notiCo" variant="caption" color="text.secondary">
                            {notification.time}
                        </Typography>
                        {notification.tag && (
                            <Typography variant="caption" sx={{ fontWeight: 600, color: notification.color || '#7367f0' }}>
                                {notification.tag}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <IconButton size="small" sx={{ position: "absolute", top: "-12px", right: "-12px" }}
                    onClick={handleToggleRead}
                    title={notification?.markAsUnread ? "Mark as read" : "Mark as unread"}>
                    {!notification?.markAsUnread ? (
                        <DraftsIcon sx={{ color: '#7D7f85', fontSize: '20px' }} />
                    ) :
                        <MailIcon sx={{ color: '#7367f0', fontSize: '20px' }} />
                    }
                </IconButton>
                {hover && (
                    <>
                        <IconButton size="small" sx={{ position: "absolute", top: "20px", right: "-12px" }}
                            onClick={handleRemove} title="Remove notification">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default NotificationCard;

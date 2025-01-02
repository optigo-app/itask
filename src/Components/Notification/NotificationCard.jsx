import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Avatar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./Notification.scss"

const NotificationCard = ({ notification }) => {
    const [hover, setHover] = useState(false);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e0e0e0",
                padding: '0px 10px',
                margin: 0
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Box sx={{ display: 'flex', padding: '10px', position: 'relative' }}>
                <Avatar sx={{ bgcolor: "#d1e7dd", marginRight: 2 }}>
                    {notification.avatar.includes("http") ? (   
                        <img
                            src={notification.avatar}
                            alt={notification.title}
                            style={{ width: "100%" }}
                        />
                    ) : (
                        notification.avatar
                    )}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" fontWeight={600}>
                        {notification.title}
                    </Typography>
                    <Typography className="notiCo notiTitleDescriptCo" variant="body2" color="text.secondary">
                        {notification.message}
                    </Typography>
                    <Typography className="notiCo" variant="caption" color="text.secondary">
                        {notification.time}
                    </Typography>
                </Box>
                {hover && (
                    <IconButton size="small" sx={{ position: 'absolute', top: '40%', right: '-15px' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};

export default NotificationCard;

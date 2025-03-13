import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Menu, MenuItem, Divider, Button, Chip, Tooltip, IconButton, Badge } from "@mui/material";
import { Bell, MailOpen, User, Settings, LogOut } from "lucide-react";
import { getRandomAvatarColor } from "../../Utils/globalfun";
import "./header.scss";
import NotificationCard from "../Notification/NotificationCard";

const Header = ({ avatarSrc = "" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const profileOpen = Boolean(profileAnchorEl);
    const encodedData = searchParams.get("data");
    const [decodedData, setDecodedData] = useState(null);
    console.log('decodedData: ', decodedData);

    useEffect(() => {
        if (encodedData) {
            try {
                const decodedString = decodeURIComponent(encodedData);
                const jsonString = atob(decodedString);
                const parsedData = JSON.parse(jsonString);
                setDecodedData(parsedData);
            } catch (error) {
                console.error("Error decoding data:", error);
            }
        }
    }, [encodedData]);

    const dataMap = {
        "/": {
            title: "Home",
            subtitle: "Monitor all your project and tasks here",
        },
        "/inbox": {
            title: "Inbox",
            subtitle: "Check your messages and notifications",
        },
        "/calendar": {
            title: "Calendar",
            subtitle: "Keep track of your events and tasks",
        },
        "/meetings": {
            title: "Meetings",
            subtitle: "Manage and schedule your meetings",
        },
        "/tasks": {
            title: 'My Tasks',
            subtitle: "View all of your tasks here",
        },
        "/projects": {
            title: "Projects",
            subtitle: "Manage and monitor your projects",
        },
        "/masters": {
            title: "Masters",
            subtitle: "Manage all your masters here",
        },
        "/account-profile": {
            title: "Profile",
            subtitle: "Manage your Profile here",
        },
        "/account-settings": {
            title: "Profile",
            subtitle: "Manage your Profile here",
        },
    };

    const decodedPathname = decodeURIComponent(location?.pathname);
    const matchedKey = Object?.keys(dataMap)
        ?.filter((key) => decodedPathname.startsWith(key))
        ?.sort((a, b) => b.length - a.length)[0];

    if (!matchedKey) {
        return null;
    }

    if (decodedData?.taskname) {
        dataMap[matchedKey].title = `${decodedData?.taskname}/${decodedData?.module}`;
    }

    const { title, subtitle } = dataMap[matchedKey];

    const userName = "Shivam Shukla";

    const avatarBackgroundColor = avatarSrc
        ? "transparent"
        : getRandomAvatarColor(userName);


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
            avatar: "MJ",
            title: "Task Update: API Integration",
            message: "Mark Johnson updated the API integration task.",
            time: "4hr ago",
            markAsUnread: false,
        },
        {
            id: 3,
            avatar: "https://randomuser.me/api/portraits/women/2.jpg",
            title: "New Comment on Task 📩",
            message: "Sarah left a comment on the database optimization task.",
            time: "30min ago",
            markAsUnread: true,
        },
        {
            id: 4,
            avatar: "TS",
            title: "Task Completed ✅",
            message: "The UI/UX design for the dashboard has been completed.",
            time: "1 day ago",
            markAsUnread: false,
        },
    ];

    const menuItems = [
        { text: 'My Profile', icon: <User size={20} style={{ color: "#7d7f85" }} />, route: '/account-profile' },
        { text: 'Settings', icon: <Settings size={20} style={{ color: "#7d7f85" }} />, route: '/account-settings' }
    ];

    const handleMenuClick = (route) => {
        handleCloseProfileMenu();
        navigate(route);
    };

    const handleViewAllNoti = () => {
        handleCloseMenu();
        navigate('/inbox');
    }

    const handleBellClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAvatarClick = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleCloseProfileMenu = () => {
        setProfileAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage?.removeItem("isLoggedIn");
        navigate("/login");
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
            }}
            className="headerContainer"
        >
            <Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" component="div" className="headerTitle">
                        {title}
                    </Typography>
                    {location.pathname.includes("/tasks") && (
                        <div
                            style={{
                                backgroundColor: "#7d7f8799",
                                color: "#fff",
                                width: "fit-content",
                                padding: "0.2rem 0.4rem",
                                borderRadius: "5px",
                                textAlign: "center",
                                fontSize: "12px",
                                fontWeight: "500",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "-15px",
                            }}
                        >
                            20
                        </div>
                    )}
                </Box>
                <Typography
                    variant="subtitle1"
                    component="div"
                    className="headerSubtitle"
                >
                    {subtitle}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                    sx={{ marginRight: "10px", cursor: "pointer" }}
                    onClick={handleBellClick}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                >
                    {notifications?.length > 0 ? (
                        <Badge
                            variant="dot"
                            overlap="circular"
                            sx={{
                                "& .MuiBadge-dot": {
                                    backgroundColor: "#eb0505",
                                    height: 10,
                                    width: 10,
                                    borderRadius: "50%",
                                },
                            }}
                        >
                            <Bell size={24} style={{ color: "#7d7f85" }} />
                        </Badge>
                    ) : (
                        <Bell size={24} style={{ color: "#7d7f85" }} />
                    )}
                </Box>
                <Avatar
                    alt={userName}
                    src={avatarSrc}
                    sx={{
                        backgroundColor: avatarBackgroundColor,
                        color: "#fff",
                        cursor: "pointer",
                    }}
                    onClick={handleAvatarClick}
                >
                    {!avatarSrc && userName.charAt(0).toUpperCase()}
                </Avatar>
            </Box>

            {/* Notification Menu */}
            <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
                slotProps={{
                    paper: {
                        sx: {
                            top: "100px !important",
                            width: "400px !important",
                            borderRadius: "8px !important",
                            boxShadow:
                                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                            '& "MuiList-root': {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                            },
                        },
                    },
                }}
                aria-hidden={open ? "false" : "true"}
            >
                <Box
                    p={2}
                    display="flex"
                    justifyContent="space-between"
                    sx={{ borderBottom: "1px solid #e0e0e0" }}
                >
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                        Notification
                    </Typography>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <Chip
                            label="8 New"
                            sx={{
                                background: "#e9e7fd",
                                color: "#7367f0",
                                fontWeight: "bold",
                                borderRadius: "8px",
                                height: "25px",
                            }}
                        />
                        <Tooltip
                            title="Mark all as read"
                            placement="top"
                            arrow
                            classes={{ tooltip: 'custom-tooltip' }}
                        >
                            <IconButton>
                                <MailOpen size={20} style={{ cursor: "pointer" }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Box>

                {notifications.map((notification) => (
                    <MenuItem
                        key={notification.id}
                        sx={{ display: "block", margin: "0", padding: "0" }}
                    >
                        <NotificationCard notification={notification} />
                    </MenuItem>
                ))}

                <Box textAlign="center" p={1.5} onClick={handleViewAllNoti}>
                    <Button
                        size="small"
                        className="buttonClassname"
                        variant="contained"
                        fullWidth
                    >
                        View all notifications
                    </Button>
                </Box>
            </Menu>

            {/* Profile Menu */}
            <Menu
                id="profile-menu"
                anchorEl={profileAnchorEl}
                open={profileOpen}
                onClose={handleCloseProfileMenu}
                slotProps={{
                    paper: {
                        sx: {
                            top: "100px !important",
                            minWidth: "170px !important",
                            maxWidth: "250px !important",
                            borderRadius: "8px !important",
                            boxShadow:
                                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                            '& ".MuiList-root': {
                                paddingTop: "0 !important",
                                paddingBottom: "0 !important",
                            },
                        },
                    },
                }}
                aria-hidden={open ? "false" : "true"}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px",
                        borderBottom: "1px solid #e0e0e0",
                    }}
                >
                    <Avatar
                        alt={userName}
                        src={avatarSrc}
                        sx={{
                            backgroundColor: avatarBackgroundColor,
                            color: "#fff",
                            width: 40,
                            height: 40,
                            marginRight: "12px",
                        }}
                    >
                        {!avatarSrc && userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {userName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7d7f85" }}>
                            Developer
                        </Typography>
                    </Box>
                </Box>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleMenuClick(item.route)}
                        sx={{
                            margin: "10px 10px !important",
                            borderRadius: "8px !important",
                            "&:hover": {
                                backgroundColor: "#f0f0f0 !important",
                                borderRadius: "8px !important",
                            },
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {item.icon}
                            <Typography className="pMTypo" variant="body2">
                                {item.text}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}

                <Divider />

                {/* Logout Button */}
                <Box textAlign="center" p={1.5}>
                    <Button
                        size="small"
                        className="buttonClassname"
                        sx={{
                            background: "#ff4c51 !important",
                            borderColor: "#ff4c51 !important",
                            color: "#fff !important",
                        }}
                        onClick={() => handleLogout()}
                        variant="contained"
                        fullWidth
                        endIcon={<LogOut size={20} />}
                    >
                        Logout
                    </Button>
                </Box>
            </Menu>
        </Box>
    );
};

export default Header;

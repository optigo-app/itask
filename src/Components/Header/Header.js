import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Menu, MenuItem, Divider, Button, Chip, Tooltip, IconButton, Badge, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Bell, MailOpen, User, LogOut, House, FileCheck, RefreshCcw } from "lucide-react";
import { getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";
import "./header.scss";
import NotificationCard from "../Notification/NotificationCard";
import { taskLength, webReload } from "../../Recoil/atom";
import { useRecoilValue, useSetRecoilState } from "recoil";

const Header = ({ avatarSrc = "" }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const setReload = useSetRecoilState(webReload);
    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const profileOpen = Boolean(profileAnchorEl);
    const encodedData = searchParams.get("data");
    const [decodedData, setDecodedData] = useState(null);
    console.log('decodedData: ', decodedData);
    const taskDataLength = useRecoilValue(taskLength);
    const [profileData, setProfileData] = useState();
    const [selectedTab, setSelectedTab] = useState("taskView");
    const [selectedCalTab, setSelectedCalTab] = useState("calendarView");

    useEffect(() => {
        location.pathname.includes("/tasks/") ?
            setSelectedTab("taskView") :
            setSelectedTab("projectHome");
        location?.pathname.includes("/calendar") ?
            setSelectedCalTab("calendarView") :
            setSelectedCalTab("todayTasks");
        setDecodedData(null)
    }, [location]);

    useEffect(() => {
        const fetchProfileData = () => {
            const userData = JSON?.parse(localStorage.getItem("UserProfileData"));
            setProfileData(userData);
            if (userData?.isLoggedIn) {
                clearInterval(interval);
            }
        };
        fetchProfileData();
        const interval = setInterval(() => {
            fetchProfileData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
    }, [encodedData, location]);

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
        "/reports": {
            title: "Reports",
            subtitle: "View All your Reports here",
        },
        "/reports/pms": {
            title: "PMS iTask Report",
            subtitle: "View All your Reports here",
        },
        "/notification": {
            title: "Notification",
            subtitle: "View All your notification here",
        },
        "/taskView": {
            title: "Today Tasks",
            subtitle: "View All your Today Tasks here",
        },
    };

    const decodedPathname = decodeURIComponent(location?.pathname);
    const matchedKey = Object?.keys(dataMap)
        ?.filter((key) => decodedPathname.startsWith(key))
        ?.sort((a, b) => b.length - a.length)[0];

    if (!matchedKey) {
        return null;
    }

    if (decodedData?.module && location?.pathname.includes("/tasks/")) {
        dataMap[matchedKey].title = `${decodedData?.project}${decodedData?.taskid ? `/${decodedData?.module}` : ''}`;
    } else if (decodedData?.project && location?.pathname.includes("/projects/dashboard")) {
        dataMap[matchedKey].title = `${decodedData?.project}${(decodedData?.module ?? decodedData?.taskname) ? `/${decodedData?.module ?? decodedData?.taskname}` : ""}`;
    }

    const { title, subtitle } = dataMap[matchedKey];

    const avatarBackgroundColor = avatarSrc
        ? "transparent"
        : getRandomAvatarColor(`${profileData?.firstname + " " + profileData?.lastname}`);


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
    ];

    const handleViewAllNoti = () => {
        handleCloseMenu();
        navigate('/notification');
    }

    const handleBellClick = (event) => {
        // for service worker
        // showNotification({
        //     title: 'Task Reminder',
        //     body: 'You have a task due in 10 minutes!',
        //     icon: 'https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=1024x1024&w=0&k=20&c=z8_rWaI8x4zApNEEG9DnWlGXyDIXe-OmsAyQ5fGPVV8=',
        //     url: location.pathname,
        //     actions: [
        //         { action: 'open', title: 'View Task' },
        //         { action: 'dismiss', title: 'Dismiss' }
        //     ]
        // });
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

    const isDecodedTitle =
        location.pathname.includes("/tasks/") &&
        decodedData?.module &&
        title === `${decodedData?.project}/${decodedData?.module}`;
    const isDecodedProjectTitle =
        location.pathname.includes("/projects/dashboard") &&
        decodedData?.project &&
        title === `${decodedData?.project}/${decodedData?.module}`;

    const handleback = () => {
        if (isDecodedTitle || isDecodedProjectTitle) {
            navigate("/projects");
        }
    };

    const handleRedirection = (value) => {
        if (location?.pathname.includes("calendar") || location?.pathname?.includes("/taskView")) {
            if (value === "calendarView") {
                navigate("/calendar");
            } else {
                navigate(`/taskView`);
            }
        } else {
            let urlData = {
                project: decodedData?.project,
                projectid: decodedData?.projectid,
                module: decodedData?.module,
                taskid: decodedData?.taskid,
                module: decodedData?.taskid ? decodedData?.taskname : decodedData?.project,
            }
            const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));
            if (value === "projectHome") {
                navigate(`/projects/dashboard/?data=${encodedFormData}`);
            } else if (value === "taskView") {
                navigate(`/tasks/?data=${encodedFormData}`);
            }
        }
    };

    const handleLogout = () => {
        localStorage?.removeItem("isLoggedIn");
        navigate("/login");
    };

    const hableReload = () => {
        setReload(true);
    }

    const toggleOptions = [
        {
            label: "Project Home",
            value: "projectHome",
            icon: House
        },
        {
            label: "Task View",
            value: "taskView",
            icon: FileCheck
        },
    ];

    const toggleCalOptions = [
        {
            label: "Calendar",
            value: "calendarView",
            icon: FileCheck
        },
        {
            label: "Today Task",
            value: "todayTasks",
            icon: House
        }
    ];


    const pathname = location.pathname;

    const isTasks = pathname === "/tasks" || pathname.startsWith("/tasks?");
    const isTaskDetails = pathname.startsWith("/tasks/");
    const isProjects = pathname === "/projects" || pathname.startsWith("/projects?");
    const isProjectDashboard = pathname.startsWith("/projects/dashboard");

    const BreadcrumbItem = ({ label, onClick }) => (
        <>
            <Typography variant="h6" component="span">/</Typography>
            <Typography
                variant="h6"
                component="span"
                onClick={onClick}
                sx={{
                    cursor: onClick ? 'pointer' : 'default',
                    '&:hover': onClick ? { textDecoration: 'underline', color: '#7367f0 !important' } : {},
                }}
            >
                {label}
            </Typography>
        </>
    );


    const renderBreadcrumbs = () => {
        if (isTasks) {
            return <Typography variant="h6">My Task</Typography>;
        }

        if (isTaskDetails) {
            return (
                <>
                    <Typography
                        variant="h6"
                        component="span"
                        onClick={() => navigate("/projects")}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline', color: '#7367f0 !important' },
                        }}
                    >
                        All
                    </Typography>

                    {decodedData?.project && (
                        <BreadcrumbItem
                            label={decodedData.project}
                            onClick={() =>
                                navigate(`/projects?filter=${encodeURIComponent(decodedData.project)}`)
                            }
                        />
                    )}

                    {decodedData?.module && (
                        <BreadcrumbItem
                            label={decodedData.module}
                            onClick={() =>
                                navigate(`/projects?filter=${encodeURIComponent(decodedData.module)}`)
                            }
                        />
                    )}
                </>
            );
        }

        if (isProjects) {
            return <Typography variant="h6">Projects</Typography>;
        }

        if (isProjectDashboard) {
            return (
                <>
                    <Typography
                        variant="h6"
                        component="span"
                        onClick={() => navigate("/projects")}
                        sx={{
                            cursor: 'pointer',
                            color: '#7367f0',
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        Projects
                    </Typography>

                    {decodedData?.project && (
                        <BreadcrumbItem
                            label={decodedData.project}
                            onClick={() =>
                                navigate(`/projects?filter=${encodeURIComponent(decodedData.project)}`)
                            }
                        />
                    )}

                    {(decodedData?.module || decodedData?.taskname) && (
                        <BreadcrumbItem
                            label={decodedData.module ?? decodedData.taskname}
                            onClick={() =>
                                navigate(`/projects?filter=${encodeURIComponent(decodedData.module ?? decodedData.taskname)}`)
                            }
                        />
                    )}
                </>
            );
        }

        // Fallback: use title from dataMap
        if (matchedKey && dataMap[matchedKey]?.title) {
            return <Typography variant="h6">{dataMap[matchedKey].title}</Typography>;
        }

        return null;
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
                    {renderBreadcrumbs()}
                    {taskDataLength > 0 &&
                        <>
                            {location.pathname.includes("/tasks/") && (
                                <div className="header_task-count">
                                    {taskDataLength}
                                </div>
                            )}
                        </>
                    }
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                        variant={decodedData?.isLimited == 1 ? "caption" : "subtitle1"}
                        component="div"
                        className="headerSubtitle"
                    >
                        {subtitle}
                    </Typography>
                    {decodedData?.isLimited === 1 && typeof location?.pathname === "string" && location.pathname.includes("/tasks/") && (
                        <Typography
                            variant="caption"
                            sx={{
                                backgroundColor: "#ff9800",
                                color: "#fff",
                                borderRadius: "8px",
                                padding: "2px 6px",
                                fontSize: "0.7rem",
                            }}
                        >
                            Limited Access
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {(location?.pathname?.includes("/tasks/") || location?.pathname?.includes("/projects/")) && (
                    <Box className="taskHeaderTDBox">
                        <ToggleButtonGroup
                            value={selectedTab}
                            exclusive
                            onChange={(e, value) => value && setSelectedTab(value)}
                            className="toggle-group"
                            size="small"
                        >
                            {toggleOptions?.map((option) => (
                                <ToggleButton
                                    key={option.value}
                                    value={option.value}
                                    className="toggle-button"
                                    onClick={() => handleRedirection(option.value)}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        {option.icon && (
                                            <option.icon size={20} />
                                        )}
                                        {option.label}
                                    </Box>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                )}
                {(location?.pathname?.includes("/calendar") || location?.pathname?.includes("/taskView")) && (
                    <Box className="taskHeaderTDBox">
                        <ToggleButtonGroup
                            value={selectedCalTab}
                            exclusive
                            onChange={(e, value) => value && setSelectedCalTab(value)}
                            className="toggle-group"
                            size="small"
                        >
                            {toggleCalOptions?.map((option) => (
                                <ToggleButton
                                    key={option.value}
                                    value={option.value}
                                    className="toggle-button"
                                    onClick={() => handleRedirection(option.value)}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        {option.icon && (
                                            <option.icon size={20} />
                                        )}
                                        {option.label}
                                    </Box>
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                )}
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
                            <Bell className="iconbtn" size={24} style={{ color: "#7d7f85" }} />
                        </Badge>
                    ) : (
                        <Bell className="iconbtn" size={24} style={{ color: "#7d7f85" }} />
                    )}
                </Box>
                <Avatar
                    alt={profileData?.firstname + " " + profileData?.lastname}
                    src={ImageUrl(profileData)}
                    sx={{
                        backgroundColor: avatarBackgroundColor,
                        color: "#fff",
                        cursor: "pointer",
                    }}
                    onClick={handleAvatarClick}
                    className="profile-avatar"
                >
                    {!avatarSrc && profileData && profileData?.firstname?.charAt(0).toUpperCase()}
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
                            top: "75px !important",
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
                            top: "75px !important",
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
                        alt={profileData?.firstname + " " + profileData?.lastname}
                        src={ImageUrl(profileData)}
                        sx={{
                            backgroundColor: avatarBackgroundColor,
                            color: "#fff",
                            width: 40,
                            height: 40,
                            marginRight: "12px",
                        }}
                    >
                        {!avatarSrc && profileData?.firstname?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {profileData?.firstname + " " + profileData?.lastname}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7d7f85" }}>
                            {profileData?.designation}
                        </Typography>
                    </Box>
                </Box>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
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
                        onClick={() => hableReload()}
                        variant="contained"
                        fullWidth
                        sx={{ marginBottom: "10px" }}
                    >
                        Reload
                    </Button>
                    <Button
                        size="small"
                        className="dangerbtnClassname"
                        onClick={() => handleLogout()}
                        variant="contained"
                        fullWidth
                        endIcon={<LogOut size={20} />}
                        disabled={true}
                    >
                        Logout
                    </Button>
                </Box>
            </Menu>
        </Box>
    );
};

export default Header;

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Avatar, Menu, MenuItem, Divider, Button, Chip, Tooltip, IconButton, Badge, ToggleButtonGroup, ToggleButton } from "@mui/material";
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { Bell, MailOpen, User, LogOut, House, FileCheck, FileClock } from "lucide-react";
import { getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";
import "./header.scss";
import NotificationCard from "../Notification/NotificationCard";
import { taskLength, webReload } from "../../Recoil/atom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import PendingAcceptanceDrawer from "../ShortcutsComponent/Notification/PendingAcceptanceDrawer";

// Profile Hook
const useProfileData = () => {
    const [profileData, setProfileData] = useState(null);
    const setReload = useSetRecoilState(webReload);

    useEffect(() => {
        const fetchProfileData = () => {
            const userData = JSON.parse(localStorage.getItem("UserProfileData"));
            setProfileData(userData);
        };
        const timeoutId = setTimeout(fetchProfileData, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    const handleReload = () => setReload(true);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
    };

    return { profileData, handleReload, handleLogout };
};

// Profile Menu Component
const ProfileMenu = ({ anchorEl, open, onClose, profileData, avatarSrc, onReload, onLogout }) => {
    const navigate = useNavigate();

    const avatarBackgroundColor = avatarSrc
        ? "transparent"
        : getRandomAvatarColor(`${profileData?.firstname} ${profileData?.lastname}`);

    const menuItems = [
        { text: 'My Profile', icon: <User size={20} style={{ color: "#7d7f85" }} />, route: '/account-profile' },
    ];

    const handleLogoutClick = () => {
        onLogout();
        navigate("/login");
    };

    return (
        <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        top: "75px !important",
                        minWidth: "170px !important",
                        maxWidth: "250px !important",
                        borderRadius: "8px !important",
                        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                        '& ".MuiList-root': { paddingTop: "0 !important", paddingBottom: "0 !important" },
                    },
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: "1px solid #e0e0e0" }}>
                <Avatar
                    alt={`${profileData?.firstname} ${profileData?.lastname}`}
                    src={ImageUrl(profileData)}
                    sx={{ backgroundColor: avatarBackgroundColor, color: "#fff", width: 40, height: 40, marginRight: "12px" }}
                >
                    {!avatarSrc && profileData?.firstname?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                        {`${profileData?.firstname} ${profileData?.lastname}`}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7d7f85" }}>
                        {profileData?.designation}
                    </Typography>
                </Box>
            </Box>

            {menuItems?.map((item, index) => (
                <MenuItem key={index} sx={{ margin: "10px 10px !important", borderRadius: "8px !important", "&:hover": { backgroundColor: "#f0f0f0 !important", borderRadius: "8px !important" } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {item.icon}
                        <Typography className="pMTypo" variant="body2">{item.text}</Typography>
                    </Box>
                </MenuItem>
            ))}

            <Divider />

            <Box textAlign="center" p={1.5}>
                <Button size="small" className="buttonClassname" onClick={onReload} variant="contained" fullWidth sx={{ marginBottom: "10px" }}>
                    Reload
                </Button>
                <Button size="small" className="dangerbtnClassname" onClick={handleLogoutClick} variant="contained" fullWidth endIcon={<LogOut size={20} />} disabled>
                    Logout
                </Button>
            </Box>
        </Menu>
    );
};

// Notification Hook
const useNotifications = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

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

    const handleBellClick = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    return { anchorEl, open, notifications, handleBellClick, handleCloseMenu };
};

// Notification Menu Component
const NotificationMenu = ({ anchorEl, open, onClose, notifications }) => {
    const navigate = useNavigate();

    const handleViewAllNoti = () => {
        onClose();
        navigate('/notification');
    };

    return (
        <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        top: "75px !important",
                        width: "400px !important",
                        borderRadius: "8px !important",
                        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                        '& "MuiList-root': { paddingTop: "0 !important", paddingBottom: "0 !important" },
                    },
                },
            }}
        >
            <Box p={2} display="flex" justifyContent="space-between" sx={{ borderBottom: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle1" fontWeight="bold">Notification</Typography>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <Chip label="8 New" sx={{ background: "#e9e7fd", color: "#7367f0", fontWeight: "bold", borderRadius: "8px", height: "25px" }} />
                    <Tooltip title="Mark all as read" placement="top" arrow classes={{ tooltip: 'custom-tooltip' }}>
                        <IconButton><MailOpen size={20} style={{ cursor: "pointer" }} /></IconButton>
                    </Tooltip>
                </div>
            </Box>

            {notifications?.map((notification) => (
                <MenuItem key={notification.id} sx={{ display: "block", margin: "0", padding: "0" }}>
                    <NotificationCard notification={notification} />
                </MenuItem>
            ))}

            <Box textAlign="center" p={1.5} onClick={handleViewAllNoti}>
                <Button size="small" className="buttonClassname" variant="contained" fullWidth>
                    View all notifications
                </Button>
            </Box>
        </Menu>
    );
};


// Data Map Hook
const useDataMap = (location, decodedData) => {
    const dataMap = {
        "/": { title: "Home", subtitle: "Monitor all your project and tasks here" },
        "/inbox": { title: "Inbox", subtitle: "Check your messages and notifications" },
        "/calendar": { title: "Calendar", subtitle: "Keep track of your events and tasks" },
        "/meetings": { title: "Meetings", subtitle: "Manage and schedule your meetings" },
        "/tasks": { title: 'My Tasks', subtitle: "View all of your tasks here" },
        "/projects": { title: "Projects", subtitle: "Manage and monitor your projects" },
        "/masters": { title: "Masters", subtitle: "Manage all your masters here" },
        "/account-profile": { title: "Profile", subtitle: "Manage your Profile here" },
        "/account-settings": { title: "Profile", subtitle: "Manage your Profile here" },
        "/reports": { title: "Reports", subtitle: "View All your Reports here" },
        "/reports/pms": { title: "PMS iTask Report", subtitle: "View All your Reports here" },
        "/notification": { title: "Notification", subtitle: "View All your notification here" },
        "/taskView": { title: "Today Tasks", subtitle: "View All your Today Tasks here" },
    };

    const decodedPathname = decodeURIComponent(location?.pathname);
    const matchedKey = Object.keys(dataMap)
        .filter((key) => decodedPathname.startsWith(key))
        .sort((a, b) => b.length - a.length)[0];

    if (matchedKey) {
        // Dynamic title updates
        if (decodedData?.module && location?.pathname.includes("/tasks/")) {
            dataMap[matchedKey].title = `${decodedData?.project}${decodedData?.taskid ? `/${decodedData?.module}` : ''}`;
        } else if (decodedData?.project && location?.pathname.includes("/projects/dashboard")) {
            dataMap[matchedKey].title = `${decodedData?.project}${(decodedData?.module ?? decodedData?.taskname) ? `/${decodedData?.module ?? decodedData?.taskname}` : ""}`;
        }
    }

    return { dataMap, matchedKey };
};

// Breadcrumb Component
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

const Breadcrumbs = ({ location, decodedData, matchedKey, dataMap }) => {
    const navigate = useNavigate();
    const pathname = location.pathname;

    const isTasks = pathname === "/tasks" || pathname.startsWith("/tasks?");
    const isTaskDetails = pathname.startsWith("/tasks/");
    const isProjects = pathname === "/projects" || pathname.startsWith("/projects?");
    const isProjectDashboard = pathname.startsWith("/projects/dashboard");

    if (isTasks) return <Typography variant="h6">My Task</Typography>;

    if (isTaskDetails) {
        return (
            <>
                <Typography variant="h6" component="span" onClick={() => navigate("/projects")} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: '#7367f0 !important' } }}>
                    All
                </Typography>
                {decodedData?.project && <BreadcrumbItem label={decodedData.project} onClick={() => navigate(`/projects?filter=${encodeURIComponent(decodedData.project)}`)} />}
                {decodedData?.module && <BreadcrumbItem label={decodedData.module} onClick={() => navigate(`/projects?filter=${encodeURIComponent(decodedData.module)}`)} />}
            </>
        );
    }

    if (isProjects) return <Typography variant="h6">Projects</Typography>;

    if (isProjectDashboard) {
        return (
            <>
                <Typography variant="h6" component="span" onClick={() => navigate("/projects")} sx={{ cursor: 'pointer', color: '#7367f0', '&:hover': { textDecoration: 'underline' } }}>
                    Projects
                </Typography>
                {decodedData?.project && <BreadcrumbItem label={decodedData.project} onClick={() => navigate(`/projects?filter=${encodeURIComponent(decodedData.project)}`)} />}
                {(decodedData?.module || decodedData?.taskname) && <BreadcrumbItem label={decodedData.module ?? decodedData.taskname} onClick={() => navigate(`/projects?filter=${encodeURIComponent(decodedData.module ?? decodedData.taskname)}`)} />}
            </>
        );
    }

    // Fallback: use title from dataMap
    if (matchedKey && dataMap[matchedKey]?.title) {
        return <Typography variant="h6">{dataMap[matchedKey].title}</Typography>;
    }

    return null;
};

// URL Data Hook
const useUrlData = (location) => {
    const [decodedData, setDecodedData] = useState(null);
    const searchParams = new URLSearchParams(location.search);
    const encodedData = searchParams.get("data");

    useEffect(() => {
        if (!encodedData) {
            setDecodedData(null);
            return;
        }

        try {
            const decodedString = decodeURIComponent(encodedData);
            const jsonString = atob(decodedString);
            const parsedData = JSON.parse(jsonString);
            setDecodedData(parsedData);
        } catch (error) {
            console.error("Error decoding data:", error);
            setDecodedData(null);
        }
    }, [encodedData, location]);

    return { decodedData, encodedData };
};

// Toggle Navigation Hook
const useToggleNavigation = (location, decodedData) => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState("taskView");
    const [selectedCalTab, setSelectedCalTab] = useState("calendarView");

    useEffect(() => {
        setSelectedTab(location.pathname.includes("/tasks/") ? "taskView" : "projectHome");
        setSelectedCalTab(location?.pathname.includes("/calendar") ? "calendarView" : "todayTasks");
    }, [location]);

    const handleRedirection = (value) => {
        if (location?.pathname.includes("calendar") || location?.pathname?.includes("/taskView")) {
            navigate(value === "calendarView" ? "/calendar" : "/taskView");
        } else {
            const urlData = {
                project: decodedData?.project,
                projectid: decodedData?.projectid,
                module: decodedData?.taskid ? decodedData?.taskname : decodedData?.project,
                taskid: decodedData?.taskid,
            };
            const encodedFormData = encodeURIComponent(btoa(JSON.stringify(urlData)));

            if (value === "projectHome") {
                navigate(`/projects/dashboard/?data=${encodedFormData}`);
            } else if (value === "taskView") {
                navigate(`/tasks/?data=${encodedFormData}`);
            }
        }
    };

    const toggleOptions = [
        { label: "Project Home", value: "projectHome", icon: House },
        { label: "Task View", value: "taskView", icon: FileCheck },
    ];

    const toggleCalOptions = [
        { label: "Calendar", value: "calendarView", icon: FileCheck },
        { label: "Today Task", value: "todayTasks", icon: House }
    ];

    return { selectedTab, selectedCalTab, handleRedirection, toggleOptions, toggleCalOptions };
};

// Toggle Button Group Component
const ToggleGroup = ({ options, selectedValue, onRedirection, className }) => (
    <Box className={className}>
        <ToggleButtonGroup value={selectedValue} exclusive className="toggle-group" size="small">
            {options?.map((option) => (
                <ToggleButton key={option.value} value={option.value} className="toggle-button" onClick={() => onRedirection(option.value)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        {option.icon && <option.icon size={18} />}
                        {option.label}
                    </Box>
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    </Box>
);

// Main Header Component
const Header = ({ avatarSrc = "" }) => {
    const location = useLocation();
    const taskDataLength = useRecoilValue(taskLength);
    const [pendingAcceptanceOpen, setPendingAcceptanceOpen] = useState(false);
    // Custom hooks
    const { decodedData } = useUrlData(location);
    const { profileData, handleReload, handleLogout } = useProfileData();
    const { anchorEl: notificationAnchorEl, open: notificationOpen, notifications, handleBellClick, handleCloseMenu: handleCloseNotificationMenu } = useNotifications();
    const { dataMap, matchedKey } = useDataMap(location, decodedData);
    const { selectedTab, selectedCalTab, handleRedirection, toggleOptions, toggleCalOptions } = useToggleNavigation(location, decodedData);

    // Profile menu state
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const profileOpen = Boolean(profileAnchorEl);

    const handleAvatarClick = (event) => setProfileAnchorEl(event.currentTarget);
    const handleCloseProfileMenu = () => setProfileAnchorEl(null);

    if (!matchedKey) return null;

    const { title, subtitle } = dataMap[matchedKey];
    const avatarBackgroundColor = avatarSrc ? "transparent" : getRandomAvatarColor(`${profileData?.firstname} ${profileData?.lastname}`);

    const handlePendingAcceptance = () => {
        setPendingAcceptanceOpen(true);
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px" }} className="headerContainer">
            {/* Left Section - Title and Breadcrumbs */}
            <Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Breadcrumbs location={location} decodedData={decodedData} matchedKey={matchedKey} dataMap={dataMap} />
                    {taskDataLength > 0 && location.pathname.includes("/tasks/") && (
                        <div className="header_task-count">{taskDataLength}</div>
                    )}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant={decodedData?.isLimited == 1 ? "caption" : "subtitle1"} component="div" className="headerSubtitle">
                        {subtitle}
                    </Typography>
                    {decodedData?.isLimited === 1 && location?.pathname?.includes("/tasks/") && (
                        <Typography variant="caption" sx={{ backgroundColor: "#ff9800", color: "#fff", borderRadius: "8px", padding: "2px 6px", fontSize: "0.7rem" }}>
                            Limited Access
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Right Section - Controls and Profile */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Toggle Groups */}
                {(location?.pathname?.includes("/tasks/") || location?.pathname?.includes("/projects/")) && (
                    <ToggleGroup options={toggleOptions} selectedValue={selectedTab} onRedirection={handleRedirection} className="taskHeaderTDBox" />
                )}

                {(location?.pathname?.includes("/calendar") || location?.pathname?.includes("/taskView")) && (
                    <ToggleGroup options={toggleCalOptions} selectedValue={selectedCalTab} onRedirection={handleRedirection} className="taskHeaderTDBox" />
                )}

                {/* pending acceptance */}
                <Box className="pendingAcceptanceBtn" onClick={handlePendingAcceptance}>
                    <Typography className="pendingText">Pending Acceptance</Typography>
                </Box>

                {/* Notification Bell */}
                <Box sx={{ marginRight: "10px", cursor: "pointer" }} onClick={handleBellClick}>
                    {notifications?.length > 0 ? (
                        <Badge variant="dot" overlap="circular" sx={{ "& .MuiBadge-dot": { backgroundColor: "#eb0505", height: 10, width: 10, borderRadius: "50%" } }}>
                            <Bell className="iconbtn" size={24} style={{ color: "#7d7f85" }} />
                        </Badge>
                    ) : (
                        <Bell className="iconbtn" size={24} style={{ color: "#7d7f85" }} />
                    )}
                </Box>


                {/* Profile Avatar */}
                <Avatar
                    alt={`${profileData?.firstname} ${profileData?.lastname}`}
                    src={ImageUrl(profileData)}
                    sx={{ backgroundColor: avatarBackgroundColor, color: "#fff", cursor: "pointer" }}
                    onClick={handleAvatarClick}
                    className="profile-avatar"
                >
                    {!avatarSrc && profileData?.firstname?.charAt(0).toUpperCase()}
                </Avatar>
            </Box>

            {/* Menus */}
            <NotificationMenu anchorEl={notificationAnchorEl} open={notificationOpen} onClose={handleCloseNotificationMenu} notifications={notifications} />
            <ProfileMenu anchorEl={profileAnchorEl} open={profileOpen} onClose={handleCloseProfileMenu} profileData={profileData} avatarSrc={avatarSrc} onReload={handleReload} onLogout={handleLogout} />
            <PendingAcceptanceDrawer open={pendingAcceptanceOpen} onClose={() => setPendingAcceptanceOpen(false)} />
        </Box>
    );
};

export default Header;
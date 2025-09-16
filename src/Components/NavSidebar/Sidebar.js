import React, { useEffect, useState } from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Checkbox,
    Collapse,
    Typography,
    Divider,
    MenuItem,
    Menu,
    Chip,
} from "@mui/material";
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ExpandLess,
    ExpandMore
} from "@mui/icons-material";
import { Asterisk, Boxes, CalendarCheck, Component, FileCheck, House, Inbox, Ratio, SquareChartGantt } from 'lucide-react';
import logo from "../../Assests/logo.webp";
import useMediaQuery from "@mui/material/useMediaQuery";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import './sidebar.scss';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Advfilters, FullSidebar } from "../../Recoil/atom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setLoading] = useState(true);
    const [pageList, setPageList] = useState([]);
    const isMobile = useMediaQuery('(max-width:712px)');
    const isMiniDrawer = useMediaQuery('(max-width:1000px)');
    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [isFullSidebar, setFullSidebar] = useRecoilState(FullSidebar);
    const [activeItem, setActiveItem] = useState('Home');
    const [openReports, setOpenReports] = useState(false);
    const drawerWidth = isFullSidebar || isDrawerOpen ? 240 : 80;
    const [reportsAnchorEl, setReportsAnchorEl] = React.useState(null);
    const setFilters = useSetRecoilState(Advfilters);
    const taskInit = JSON?.parse(sessionStorage?.getItem('taskInit'));


    // All possible menu items with additional info
    const allMenuItems = [
        { pagename: "Home", label: "Home", routes: "Home", path: "/", icon: House },
        { pagename: "Task", label: "Task", routes: "Tasks", path: "/tasks", icon: FileCheck },
        { pagename: "Project", label: "Project", routes: "Projects", path: "/projects", icon: SquareChartGantt },
        { pagename: "Inbox", label: "Inbox", routes: "Inbox", path: "/inbox", icon: Inbox },
        { pagename: "Meeting", label: "Meeting", routes: "Meetings", path: "/meetings", icon: Component },
        { pagename: "Calender", label: "Calendar", routes: "Calendar", path: "/calendar", icon: CalendarCheck },
        { pagename: "Maters", label: "Masters", routes: "Masters", path: "/masters", icon: Boxes },
        { pagename: "Reports", label: "Reports", routes: "Reports", path: "/reports", icon: Ratio }
    ];

    // Sub menu items for Reports
    const reportSubItems = [
        // { label: 'Admin Report', path: '/reports/admin' },
        // { label: 'Team Lead Report', path: '/reports/team-lead' },
        // { label: 'Employee Report', path: '/reports/employee' },
        // { label: 'Overall Project Status', path: '/reports/overall-project-status' },
        // { label: 'Team Productivity', path: '/reports/team-productivity' },
        // { label: 'Task Time Utilization', path: '/reports/task-time-utilization' },
        // { label: 'Issue & Blocker', path: '/reports/issue-blocker' },
        // { label: 'Project Status Summary', path: '/reports/project-status-summary' },
        { label: 'PMS Report', path: '/reports/pms' },
        { label: 'PMS Report 2', path: '/reports/pms-2' },
    ];

    useEffect(() => {
        let intervalId;
        setLoading(true);
        const checkPageAccess = () => {
            const pageAccess = JSON.parse(sessionStorage.getItem('pageAccess'));
            if (pageAccess && Array.isArray(pageAccess)) {
                const filteredMenu = allMenuItems.filter(item =>
                    pageAccess.some(access => access.pagename === item.pagename)
                );
                setPageList(filteredMenu);
                setLoading(false);
                clearInterval(intervalId);
            }
        };
        intervalId = setInterval(checkPageAccess, 200);
        return () => clearInterval(intervalId);
    }, []);

    const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
    const toggleSidebar = (event) => setFullSidebar(event.target.checked);
    const toggleReportsMenu = () => setOpenReports(!openReports);

    const handleMouseEnter = () => {
        if (!isFullSidebar && !isMobile) {
            setDrawerOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isFullSidebar && !isMobile) {
            setDrawerOpen(false);
        }
    };

    const handleItemClick = (pathname, routes) => {
        setFilters({})
        setActiveItem(routes);
        navigate(pathname);
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    const handleReportsClick = (event) => {
        if (!isDrawerOpen) {
            setReportsAnchorEl(event.currentTarget);
        } else {
            toggleReportsMenu();
        }
    };

    const handleReportsClose = () => {
        setReportsAnchorEl(null);
    };

    useEffect(() => {
        if (isMiniDrawer) {
            setFullSidebar(false);
            setDrawerOpen(false);
        }
    }, [isMiniDrawer])

    useEffect(() => {
        const path = location?.pathname?.split('/')[1];
        setActiveItem(path.charAt(0)?.toUpperCase() + path?.slice(1) || 'Home');
    }, [location]);

    return (
        <motion.div
            layout
            initial={{ width: isMobile ? 0 : 240 }}
            animate={{ width: isMobile ? 0 : drawerWidth }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="itask_sidebarDrawer"
        >
            {isMobile && (
                <div
                    onClick={toggleDrawer}
                    className={`itask_drawerButton ${isDrawerOpen ? "itask_drawerButtonOpen" : ""}`}
                >
                    {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                </div>
            )}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? isDrawerOpen : true}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        boxShadow: "0 .125rem .5rem 0 rgba(47, 43, 61, .12)",
                    },
                }}
                className="itask_Menudrawer"
            >
                {!isLoading &&
                    <List>
                        <ListItem className="itask_drawerHeader">
                            <ListItemButton className="itask_drawerListItem">
                                <Box
                                    className="itask_drawerHeader"
                                    sx={{
                                        justifyContent: isDrawerOpen ? "space-between" : "center !important"
                                    }}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <div className="itask_logoWrapper" onClick={() => navigate("/")}>
                                        <motion.img
                                            src={logo}
                                            alt="Itask Logo"
                                            className="itask_logo"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                        />
                                        {isDrawerOpen && <ListItemText primary="iTask" className="itask_logoTxt" />}
                                    </div>
                                    <div>
                                        {!isMobile && isDrawerOpen && (
                                            <Checkbox
                                                size="small"
                                                className="itask_checkbox"
                                                aria-label="Toggle full sidebar view"
                                                checked={isFullSidebar}
                                                onChange={toggleSidebar}
                                                icon={<RadioButtonUncheckedIcon />}
                                                checkedIcon={<RadioButtonCheckedIcon />}
                                            />
                                        )}
                                    </div>
                                </Box>
                            </ListItemButton>
                        </ListItem>
                        <Chip
                            label={taskInit?.companycode || '--'}
                            size={isDrawerOpen ? 'medium' : 'small'}
                            sx={{
                                mt: 0.5,
                                mx: isDrawerOpen ? 2.75 : 1,
                                fontSize: isDrawerOpen ? '16px' : '12px',
                                height: isDrawerOpen ? 32 : 24,
                                borderRadius: '8px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                            className="itask_drawerText"
                        />
                        <div className="itask_separator" />
                        {pageList.length > 0 ? (
                            <>
                                {pageList.map(({ label, path, icon: Icon, routes }) => (
                                    label !== 'Reports' ? (
                                        <ListItem key={label} onClick={() => handleItemClick(path, routes)} sx={{ flexDirection: !isDrawerOpen ? 'column' : 'row' }}>
                                            <ListItemButton className={`itask_drawerListItem ${activeItem === routes ? 'itask_drawerItemActive' : ''}`}>
                                                <ListItemIcon className="itask_drawerItemIcon">
                                                    <Icon className={activeItem === routes ? "iconActive" : 'iconUnactive'} size={18} />
                                                </ListItemIcon>
                                                {isDrawerOpen && <ListItemText primary={label} className="itask_drawerItemText" />}
                                            </ListItemButton>
                                            {!isDrawerOpen && (
                                                <Typography variant="caption" className="itask_drawerItemText">
                                                    {label}
                                                </Typography>
                                            )}
                                        </ListItem>
                                    ) : (
                                        <ListItem sx={{ flexDirection: !isDrawerOpen ? 'column' : 'row' }} key="Reports">
                                            <ListItemButton onClick={isDrawerOpen ? toggleReportsMenu : handleReportsClick} className={`itask_drawerListItem ${activeItem === 'Reports' ? 'itask_drawerItemActive1' : ''}`}>
                                                <ListItemIcon className="itask_drawerItemIcon">
                                                    <Ratio size={18} className={activeItem === 'Reports' ? "iconActive1" : 'iconUnactive'} />
                                                </ListItemIcon>
                                                {isDrawerOpen && <ListItemText sx={{ m: 0 }} primary="Reports" />}
                                                {isDrawerOpen && <span style={{ paddingRight: '8px' }}>{openReports ? <ExpandLess /> : <ExpandMore />}</span>}
                                            </ListItemButton>
                                            {!isDrawerOpen && (
                                                <Typography variant="caption" className="itask_drawerItemText">
                                                    Reports
                                                </Typography>
                                            )}
                                        </ListItem>
                                    )
                                ))}

                                {isDrawerOpen ? (
                                    <Collapse in={openReports} timeout="auto" unmountOnExit className="itask_collapsable">
                                        <Divider className="itask_divider" orientation="vertical" flexItem />
                                        <List component="div" disablePadding className="itask_subMenuList">
                                            {reportSubItems.map(({ label, path }) => (
                                                <ListItemButton key={label} onClick={() => handleItemClick(path, 'Reports')}
                                                    className={location?.pathname === path ? 'itask_drawerItemActive' : ''}>
                                                    <ListItemText primary={label} className="itask_drawerItemText" />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                ) : (
                                    <Menu
                                        anchorEl={reportsAnchorEl}
                                        open={Boolean(reportsAnchorEl)}
                                        onClose={handleReportsClose}
                                        slotProps={{
                                            paper: {
                                                sx: {
                                                    marginTop: "-10px",
                                                    left: "50px !important",
                                                    borderRadius: "8px !important",
                                                    boxShadow:
                                                        "rgba(0, 0, 0, 0.24) 0px 3px 8px;",
                                                    '& "MuiList-root': {
                                                        paddingTop: "0 !important",
                                                        paddingBottom: "0 !important",
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {reportSubItems.map(({ label, path }) => (
                                            <MenuItem
                                                sx={{
                                                    margin: "5px 10px !important",
                                                    borderRadius: "8px !important",
                                                    "&:hover": {
                                                        backgroundColor: "#f0f0f0 !important",
                                                        borderRadius: "8px !important",
                                                    },
                                                }}
                                                className={location?.pathname === path ? 'itask_drawerItemActive' : ''}
                                                key={label} onClick={() => {
                                                    handleItemClick(path, 'Reports');
                                                    handleReportsClose();
                                                }}>
                                                <Typography variant="body2" className="itask_drawerItemText">{label}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                )}
                            </>
                        ) :
                            <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'start', paddingInline: '10px', mt: 5 }}>
                                <Typography>You don’t have access to any pages. Please contact your administrator.</Typography>
                            </Box>
                        }
                    </List>
                }
            </Drawer>
        </motion.div>
    );
};

export default Sidebar;

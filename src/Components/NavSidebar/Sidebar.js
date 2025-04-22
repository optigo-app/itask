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
} from "@mui/material";
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    ExpandLess,
    ExpandMore
} from "@mui/icons-material";

import { Asterisk, CalendarCheck, Component, FileCheck, House, Inbox, Ratio, SquareChartGantt } from 'lucide-react';
import logo from "../../Assests/logo.webp";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import './sidebar.scss';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSetRecoilState } from "recoil";
import { Advfilters } from "../../Recoil/atom";

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width:712px)');
    const isMiniDrawer = useMediaQuery('(max-width:1000px)');
    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [isFullSidebar, setFullSidebar] = useState(true);
    const [activeItem, setActiveItem] = useState('Home');
    const [openReports, setOpenReports] = useState(false); // Submenu state
    const drawerWidth = isFullSidebar || isDrawerOpen ? 260 : 80;
    const [reportsAnchorEl, setReportsAnchorEl] = React.useState(null);
    const setFilters = useSetRecoilState(Advfilters);


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

    const menuItems = [
        { label: 'Home', routes: 'Home', path: '/', icon: House },
        { label: 'Task', routes: 'Tasks', path: '/tasks', icon: FileCheck },
        { label: 'Project', routes: 'Projects', path: '/projects', icon: SquareChartGantt },
        { label: 'Inbox', routes: 'Inbox', path: '/inbox', icon: Inbox },
        { label: 'Meeting', routes: 'Meetings', path: '/meetings', icon: Component },
        { label: 'Calendar', routes: 'Calendar', path: '/calendar', icon: CalendarCheck },
        { label: 'Masters', routes: 'Masters', path: '/masters', icon: Asterisk }
    ];

    const reportSubItems = [
        { label: 'Admin Report', path: '/reports/admin' },
        { label: 'Team Lead Report', path: '/reports/team-lead' },
        { label: 'Employee Report', path: '/reports/employee' },
        { label: 'Overall Project Status', path: '/reports/overall-project-status' },
        { label: 'Team Productivity', path: '/reports/team-productivity' },
        { label: 'Task Time Utilization', path: '/reports/task-time-utilization' },
        { label: 'Issue & Blocker', path: '/reports/issue-blocker' },
        { label: 'Project Status Summary', path: '/reports/project-status-summary' },
    ];

    return (
        <motion.div
            layout
            initial={{ width: isMobile ? 0 : 260 }}
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
                    <div className="itask_separator" />
                    {menuItems.map(({ label, path, icon: Icon, routes }) => (
                        <ListItem key={label} onClick={() => handleItemClick(path, routes)} sx={{ flexDirection: !isDrawerOpen ? 'column' : 'row' }}>
                            <ListItemButton
                                className={`itask_drawerListItem ${activeItem === routes ? 'itask_drawerItemActive' : ''}`}>
                                <ListItemIcon className="itask_drawerItemIcon">
                                    <Icon className={activeItem === routes ? "iconActive" : 'iconUnactive'} size={22} />
                                </ListItemIcon>
                                {isDrawerOpen && <ListItemText className="itask_drawerItemText" primary={label} />}
                            </ListItemButton>
                            {!isDrawerOpen && (
                                <Typography variant="caption" className="itask_drawerItemText">
                                    {label}
                                </Typography>
                            )}
                        </ListItem>
                    ))}

                    {/* Reports Menu with Submenu */}
                    <ListItem sx={{ flexDirection: !isDrawerOpen ? 'column' : 'row' }}>
                        <ListItemButton onClick={isDrawerOpen ? toggleReportsMenu : handleReportsClick} className={`itask_drawerListItem ${activeItem === 'Reports' ? 'itask_drawerItemActive1' : ''}`}>
                            <ListItemIcon className="itask_drawerItemIcon">
                                <Ratio size={22} className={activeItem === 'Reports' ? "iconActive1" : 'iconUnactive'} />
                            </ListItemIcon>
                            {isDrawerOpen && <ListItemText sx={{ m: 0 }} primary="Reports" />}
                            {isDrawerOpen && <span style={{ paddingRight: '8px' }}>{(openReports ? <ExpandLess className="iconUnactive" /> : <ExpandMore className="iconUnactive" />)}</span>}
                        </ListItemButton>
                        {!isDrawerOpen && (
                            <Typography variant="caption" className="itask_drawerItemText">
                                Reports
                            </Typography>
                        )}
                    </ListItem>
                    {isDrawerOpen ? (
                        <Collapse in={openReports} timeout="auto" unmountOnExit className="itask_collapsable">
                            <Divider className="itask_divider" orientation="vertical" flexItem />
                            <List component="div" disablePadding className="itask_subMenuList">
                                {reportSubItems.map(({ label, path }) => (
                                    <ListItemButton key={label} onClick={() => handleItemClick(path, 'Reports')}
                                        className={location?.pathname?.includes(path) ? 'itask_drawerItemActive' : ''}>
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
                                    className={location?.pathname?.includes(path) ? 'itask_drawerItemActive' : ''}
                                    key={label} onClick={() => {
                                        handleItemClick(path, 'Reports');
                                        handleReportsClose();
                                    }}>
                                    <Typography variant="body2" className="itask_drawerItemText">{label}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    )}

                </List>
            </Drawer>
        </motion.div>
    );
};

export default Sidebar;

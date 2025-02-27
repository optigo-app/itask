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
    Typography,
} from "@mui/material";
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

import { Asterisk, CalendarCheck, Component, FileCheck, House, Inbox, SquareChartGantt } from 'lucide-react';
import logo from "../../Assests/logo.png"
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import './sidebar.scss';
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate()
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [isFullSidebar, setFullSidebar] = useState(true);
    const [activeItem, setActiveItem] = useState('Home');
    const drawerWidth = isFullSidebar || isDrawerOpen ? 260 : 80;

    const toggleDrawer = () => setDrawerOpen(!isDrawerOpen);
    const toggleSidebar = (event) => setFullSidebar(event.target.checked);

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
        setActiveItem(routes);
        navigate(pathname)
        if (isMobile) {
            setDrawerOpen(false);
        }
    };

    useEffect(() => {
        const path = location?.pathname?.split('/')[1];
        setActiveItem(path.charAt(0)?.toUpperCase() + path?.slice(1) || 'Home');
    }, [location])

    const menuItems = [
        { label: 'Home', routes: 'Home', path: '/', icon: House },
        { label: 'Task', routes: 'Tasks', path: '/tasks', icon: FileCheck },
        { label: 'Project', routes: 'Projects', path: '/projects', icon: SquareChartGantt },
        { label: 'Inbox', routes: 'Inbox', path: '/inbox', icon: Inbox },
        { label: 'Meeting', routes: 'Meetings', path: '/meetings', icon: Component },
        { label: 'Calendar', routes: 'Calendar', path: '/calendar', icon: CalendarCheck },
        { label: 'Masters', routes: 'Masters', path: '/masters', icon: Asterisk }
    ];


    const drawerContent = (
        <List>
            <ListItem className="itask_drawerHeader">
                <ListItemButton className="itask_drawerListItem">
                    <Box className="itask_drawerHeader" sx={{ justifyContent: isDrawerOpen ? "space-between" : "center !important" }}>
                        <div className="itask_logoWrapper"
                            onClick={() => {
                                navigate("/");
                            }}>
                            <motion.img
                                src={logo}
                                alt="Itask Logo"
                                className="itask_logo"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            />
                            {isDrawerOpen && <ListItemText primary="Itask" className="itask_logoTxt" />}
                        </div>
                        <div>
                            {!isMobile && isDrawerOpen && (
                                <Checkbox
                                    id="sidebar-toggle"
                                    aria-label="open sidebar"
                                    aria-labelledby="sidebar-toggle"
                                    className="itask_checkbox"
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
                    <ListItemButton className={`itask_drawerListItem ${activeItem === routes ? 'itask_drawerItemActive' : ''}`}>
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

        </List>
    );

    return (
        <motion.div
            layout
            initial={{ width: 260 }}
            animate={{ width: drawerWidth }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="itask_sidebarDrawer"
        >
            {/* Button to toggle sidebar */}
            {isMobile && (
                <div
                    onClick={toggleDrawer}
                    className={`itask_drawerButton ${isDrawerOpen ? "itask_drawerButtonOpen" : ""
                        }`}
                >
                    {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                </div>
            )}
            {/* Drawer Component */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? isDrawerOpen : true}
                onClose={() => setDrawerOpen(false)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        boxShadow: "0 .125rem .5rem 0 rgba(47, 43, 61, .12)",
                    },
                }}
                aria-labelledby="sidebar-drawer"
                aria-describedby="sidebar-drawer"
            >
                {drawerContent}
            </Drawer>
        </motion.div>
    );
};

export default Sidebar;
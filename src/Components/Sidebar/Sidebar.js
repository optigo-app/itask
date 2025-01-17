import React, { useEffect, useState } from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Tooltip,
    FormControlLabel,
    Checkbox,
    TextField,
    MenuItem,
    Typography,
} from "@mui/material";
import {
    Home,
    Task,
    Work,
    Mail,
    MeetingRoom,
    CalendarToday,
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";

import {CalendarCheck, Component, FileCheck, Folders, House, Inbox, SquareChartGantt } from 'lucide-react';

import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import './sidebar.scss';
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate()
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [workspaceData, setWorkSpaceData] = useState();
    const [formValues, setFormValues] = React.useState({});
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

    // Handle form value changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleItemClick = (item, route) => {
        setActiveItem(item);
        navigate(route)
        if (isMobile) {
            setDrawerOpen(false);
        }
    };


    useEffect(() => {
        setFormValues({
            workSpace: 1 ?? "",
        });
    }, []);

    useEffect(() => {
        const path = location?.pathname?.split('/')[1];
        setActiveItem(path.charAt(0)?.toUpperCase() + path?.slice(1) || 'Home');
    }, [location])

    useEffect(() => {
        setTimeout(() => {
            const workSpace = JSON?.parse(sessionStorage?.getItem("workspaceData"));
            if (workSpace) {
                setWorkSpaceData(workSpace);
            }
        }, 200);
    }, []);

    const commonSelectProps = {
        select: true,
        fullWidth: true,
        size: "small",
        sx: {
            minWidth: 180,
            "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                    borderRadius: "8px",
                },
            },
        },
        SelectProps: {
            MenuProps: {
                PaperProps: {
                    sx: {
                        borderRadius: "8px",
                        "& .MuiMenuItem-root": {
                            fontFamily: '"Public Sans", sans-serif',
                            color: "#444050",
                            margin: "5px 10px",
                            "&:hover": {
                                borderRadius: "8px",
                                backgroundColor: "#7367f0",
                                color: "#fff",
                            },
                            "&.Mui-selected": {
                                backgroundColor: "#80808033",
                                borderRadius: "8px",
                                "&:hover": {
                                    backgroundColor: "#7367f0",
                                    color: "#fff",
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    const commonTextFieldProps = {
        fullWidth: true,
        size: "small",
        className: "textfieldsClass",
    };

    const drawerContent = (
        <List>
            <ListItem className="itask_drawerHeader">
                <ListItemButton className="itask_drawerListItem">
                    <Box className="itask_drawerHeader" sx={{ justifyContent: isDrawerOpen ? "space-between" : "center !important" }}>
                        <div className="itask_logoWrapper">
                            <svg className="itask_logo" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z" fill="#7367F0"></path>
                                <path opacity="0.06" fillRule="evenodd" clipRule="evenodd" d="M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z" fill="#161616"></path>
                                <path opacity="0.06" fillRule="evenodd" clipRule="evenodd" d="M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z" fill="#161616"></path>
                                <path fillRule="evenodd" clipRule="evenodd" d="M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z" fill="#7367F0"></path>
                            </svg>
                            {isDrawerOpen && <ListItemText primary="Itask" sx={{
                                '& .MuiTypography-root': {
                                    fontSize: '20px !important',
                                    fontWeight: 'bold',
                                    fontFamily: '"Public Sans", sans-serif !important'
                                },
                            }} />}
                        </div>
                        <div>
                            {/* {!isMobile && isDrawerOpen && (
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
                            )} */}
                        </div>
                    </Box>
                </ListItemButton>
            </ListItem>
            <div className="itask_separator" />
            <ListItem sx={{ display: 'block' }}>
                <Typography variant="subtitle1" id='status'>Work Spaces</Typography>
                <TextField
                    name="workSpace"
                    value={formValues?.workSpace || ""}
                    onChange={handleChange}
                    select
                    aria-label="Select work space"
                    {...commonTextFieldProps}
                    {...commonSelectProps}
                    {...commonTextFieldProps}
                    {...commonSelectProps}
                >
                    <MenuItem value="">
                        <em>Select Status</em>
                    </MenuItem>
                    {workspaceData?.map((workSpace) => (
                        <MenuItem name={workSpace?.id} key={workSpace?.id} value={workSpace?.id}>
                            {workSpace?.labelname}
                        </MenuItem>
                    ))}
                </TextField>
            </ListItem>
            <div className="itask_separator" />
            {/* Home */}
            <ListItem onClick={() => handleItemClick('Home', '/')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Home' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <House className={activeItem === 'Home' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Home" />}
                </ListItemButton>
            </ListItem>

            {/* Task */}
            <ListItem onClick={() => handleItemClick('Task', '/task')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Task' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <FileCheck className={activeItem === 'Task' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Task" />}
                </ListItemButton>
            </ListItem>

            {/* Project */}
            <ListItem onClick={() => handleItemClick('Project', '/project')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Project' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <SquareChartGantt className={activeItem === 'Project' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Project" />}
                </ListItemButton>
            </ListItem>

            {/* Inbox */}
            <ListItem onClick={() => handleItemClick('Inbox', '/inbox')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Inbox' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <Inbox className={activeItem === 'Inbox' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Inbox" />}
                </ListItemButton>
            </ListItem>

            {/* Meeting */}
            <ListItem onClick={() => handleItemClick('Meeting', '/meeting')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Meeting' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <Component className={activeItem === 'Meeting' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Meeting" />}
                </ListItemButton>
            </ListItem>

            {/* Calendar */}
            <ListItem onClick={() => handleItemClick('Calendar', '/calendar')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Calendar' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <CalendarCheck className={activeItem === 'Calendar' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Calendar" />}
                </ListItemButton>
            </ListItem>

            {/* Masters */}
            <ListItem onClick={() => handleItemClick('Masters', '/masters')}>
                <ListItemButton className={`itask_drawerListItem ${activeItem === 'Masters' ? 'itask_drawerItemActive' : ''}`}>
                    <ListItemIcon className="itask_drawerItemIcon">
                        <Folders   className={activeItem === 'Masters' ? "iconActive" : 'iconUnactive'} size={22} />
                    </ListItemIcon>
                    {<ListItemText className="itask_drawerItemText" primary="Masters" />}
                </ListItemButton>
            </ListItem>
        </List> 
    );

    return (
        <Box className="itask_sidebarDrawer">
            {/* Button to toggle sidebar */}
            {isMobile &&
                <div
                    onClick={toggleDrawer}
                    className={`itask_drawerButton ${isDrawerOpen ? 'itask_drawerButtonOpen' : ''}`}
                >
                    {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                </div>
            }
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
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        boxShadow: '0 .125rem .5rem 0 rgba(47, 43, 61, .12)'
                    },
                }}
                aria-labelledby="sidebar-drawer"
                aria-describedby="sidebar-drawer"
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;

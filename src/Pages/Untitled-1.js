import React, { useState } from "react";
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
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const Sidebar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [isDrawerOpen, setDrawerOpen] = useState(true);
    const [isFullSidebar, setFullSidebar] = useState(true);
    const [activeItem, setActiveItem] = useState('Home');
    const drawerWidth = isFullSidebar || isDrawerOpen ? 240 : 80;

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

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    const drawerContent = (
        <List>
            <ListItem>
                <ListItemButton sx={{padding:'0 !important', borderRadius: '8px',
                    justifyContent: 'center !important',}}>
                    <Box sx={{ display: "flex", justifyContent: isDrawerOpen ? "space-between" : "center", alignItems: "center", width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <svg width="32" height="22" viewBox="0 0 32 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.00172773 0V6.85398C0.00172773 6.85398 -0.133178 9.01207 1.98092 10.8388L13.6912 21.9964L19.7809 21.9181L18.8042 9.88248L16.4951 7.17289L9.23799 0H0.00172773Z" fill="#7367F0"></path>
                                <path opacity="0.06" fill-rule="evenodd" clip-rule="evenodd" d="M7.69824 16.4364L12.5199 3.23696L16.5541 7.25596L7.69824 16.4364Z" fill="#161616"></path>
                                <path opacity="0.06" fill-rule="evenodd" clip-rule="evenodd" d="M8.07751 15.9175L13.9419 4.63989L16.5849 7.28475L8.07751 15.9175Z" fill="#161616"></path>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.77295 16.3566L23.6563 0H32V6.88383C32 6.88383 31.8262 9.17836 30.6591 10.4057L19.7824 22H13.6938L7.77295 16.3566Z" fill="#7367F0"></path>
                            </svg>
                            {isDrawerOpen && <ListItemText primary="Vuexy" />}
                        </div>
                        <div>
                            {!isMobile && isDrawerOpen && (
                                <Checkbox
                                    sx={{
                                        '&.MuiCheckbox-root': {
                                            color: '#796ef1',
                                        },
                                        '&.Mui-checked': {
                                            color: '#796ef1',
                                        },
                                    }}
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
            <div style={{marginBlock:'10px', border:'1px solid #7d7f85', borderStyle:'dashed', opacity:'.3'}} />
            {/* Home */}
            <ListItem
                onClick={() => handleItemClick('Home')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Home' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Home' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Home' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <Home />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Home" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>

            {/* Task */}
            <ListItem
                onClick={() => handleItemClick('Task')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Task' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Task' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Task' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <Task />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Task" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>

            {/* Project */}
            <ListItem
                onClick={() => handleItemClick('Project')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Project' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Project' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Project' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <Work />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Project" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>

            {/* Inbox */}
            <ListItem
                onClick={() => handleItemClick('Inbox')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Inbox' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Inbox' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Inbox' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <Mail />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Inbox" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>

            {/* Meeting */}
            <ListItem
                onClick={() => handleItemClick('Meeting')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Meeting' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Meeting' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Meeting' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <MeetingRoom />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Meeting" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>

            {/* Calendar */}
            <ListItem
                onClick={() => handleItemClick('Calendar')}
            >
                <ListItemButton sx={{
                    background: activeItem === 'Calendar' ? 'linear-gradient(270deg, rgba(115, 103, 240, 0.7) 0%, #7367f0 100%)' : 'transparent',
                    boxShadow: activeItem === 'Calendar' ? '0px 2px 6px 0px rgba(115, 103, 240, .3)' : 'none',
                    color: activeItem === 'Calendar' ? '#fff' : 'inherit',
                    borderRadius: '8px',
                    justifyContent: 'center !important',
                    padding:'5px 0px !important'
                }}>
                    <ListItemIcon sx={{ minWidth: '40px', justifyContent: 'center !important' }}>
                        <CalendarToday />
                    </ListItemIcon>
                    {isDrawerOpen && <ListItemText color="#444050" primary="Calendar" sx={{ marginBottom: '0px' }} />}
                </ListItemButton>
            </ListItem>
        </List>
    );

    return (
        <Box sx={{ display: "flex" }}>
            {/* Drawer Toggle Button */}
            {isMobile && (
                <IconButton
                    onClick={toggleDrawer}
                    sx={{
                        position: "absolute",
                        top: 10,
                        left: isDrawerOpen ? drawerWidth - 40 : 10,
                        zIndex: theme.zIndex.drawer + 1,
                    }}
                >
                    {isDrawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            )}
            {/* Sidebar Drawer */}
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? isDrawerOpen : isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        overflowX: "hidden",
                        transition: theme.transitions.create("width", {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    },
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};
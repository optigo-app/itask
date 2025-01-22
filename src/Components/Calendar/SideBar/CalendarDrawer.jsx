import React, { useEffect, useRef } from "react";
import { Box, Drawer, IconButton } from "@mui/material";
import { useRecoilState } from "recoil";
import { calendarSideBarOpen } from "../../../Recoil/atom";
import CalendarLeftSide from "../CalendarLeftSide";
import { CircleX } from "lucide-react";

const CalendarDrawer = () => {
    const [openSideDrawer, setSideDrawer] = useRecoilState(calendarSideBarOpen);
    const drawerRef = useRef(null);

    // Close the drawer if clicked outside
    const handleClickOutside = (event) => {
        if (drawerRef.current && !drawerRef.current.contains(event.target)) {
            setSideDrawer(false);
        }
    };

    const handleClose = () => {
        setSideDrawer(false);
    };

    useEffect(() => {
        if (openSideDrawer) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openSideDrawer]);

    const toggleDrawer = () => {
        setSideDrawer((prevState) => !prevState);
    };

    return (
        <Drawer
            anchor="left"
            open={openSideDrawer}
            onClose={toggleDrawer}
            variant="persistent"
            sx={{
                "& .MuiDrawer-paper": {
                    width: 350,
                    height: "100%",
                    position: "absolute",
                    boxShadow: "none",
                    overflowY: "auto",
                    overflowX: "hidden",
                    transition: "all 0.3s ease-in-out",
                    zIndex: 2,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                },
            }}
        >
            <Box
                ref={drawerRef}
                sx={{ p: 2, bgcolor: "#f0f0f0", height: "100%" }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        cursor: 'pointer'
                    }}>
                    <CircleX />
                </IconButton>
                <CalendarLeftSide />
            </Box>
        </Drawer>
    );
};

export default CalendarDrawer;

import React, { useState } from "react";
import "./Calendar.scss";
import {
  Box,
  Drawer,
  Button,
  Typography,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import "bootstrap-icons/font/bootstrap-icons.css";
import CalendarLeftSide from "../../Components/Calendar/CalendarLeftSide";
import CalendarRightSide from "../../Components/Calendar/CalendarRightSide";
import { useRecoilState, useRecoilValue } from "recoil";
import { calendarSideBarOpen } from "../../Recoil/atom";

const Calendar = () => {
  const [openSideDrawer, setSideDrawer] = useRecoilState(calendarSideBarOpen);

  const isMobile = useMediaQuery("(max-width:768px)");

  const toggleDrawer = () => {
    setSideDrawer((prevState) => !prevState);
  };

  return (
    <Box className="calendarMain" sx={{ display: "flex", height: "100vh" }}>
      {/* Left Panel (Mobile View) */}
      {isMobile ? (
        <>
          <Drawer
            anchor="left"
            open={openSideDrawer}
            onClose={toggleDrawer}
            sx={{ zIndex: "1400" }}
          >
            <Box sx={{ width: 250, height: "100%", p: 2, bgcolor: "#f0f0f0" }}>
              <Typography variant="h6" gutterBottom>
                Left Panel Content
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={toggleDrawer}
              >
                Close
              </Button>
            </Box>
          </Drawer>
        </>
      ) : (
        // Left Panel (Desktop View)
        <Box
          sx={{
            width: "24%",
            height: "100%",
            // bgcolor: '#f0f0f0',
            padding: "30px 0px",
            borderRight: "1px solid #e0e0e0",
          }}
        >
          <CalendarLeftSide />
        </Box>
      )}

      {/* Right Panel */}
      <Box
        className="calendarRightMain"
        sx={{
          flexGrow: 1,
          height: "100%",
          bgcolor: "#ffffff",
          padding: "0px 5px",
        }}
      >
        <CalendarRightSide />
      </Box>
    </Box>
  );
};

export default Calendar;

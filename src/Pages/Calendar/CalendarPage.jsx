import React, { useEffect } from "react";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import "./Calendar.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import CalendarLeftSide from "../../Components/Calendar/CalendarLeftSide";
import CalendarRightSide from "../../Components/Calendar/CalendarRightSide";
import CalendarDrawer from "../../Components/Calendar/SideBar/CalendarDrawer";
import { calendarM } from "../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import TasklistForCal from "../../Components/Calendar/TasklistForCal";

const Calendar = () => {
  const isLaptop = useMediaQuery("(max-width:1420px)");
  const isLaptop1 = useMediaQuery("(max-width:1600px) and (min-width:1421px)");
  const setSelectedMon = useSetRecoilState(calendarM);

  useEffect(() => {
    setSelectedMon(new Date());
  }, []);


  const calendarsColor = {
    Personal: 'error',
    Business: 'primary',
    Family: 'warning',
    Holiday: 'success',
    ETC: 'info',
  };


  return (
    <Box
      className="calendarMain"
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Left Panel (Mobile View) */}
      {isLaptop ? (
        <CalendarDrawer calendarsColor={calendarsColor}/>
      ) : (
        // Left Panel (Desktop View)
        <Box
          sx={{
            width: isLaptop1 ? "29%" : "24%",
            height: "100%",
            padding: "10px 0px",
            borderRight: "1px solid #e0e0e0",
            zIndex: 1,
            position: "relative",
          }}
        >
            <CalendarLeftSide calendarsColor={calendarsColor} />
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
          position: "relative",
          zIndex: 0,
        }}
      >
        <CalendarRightSide />
      
      </Box>
    </Box>
  );
};

export default Calendar;

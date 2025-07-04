import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import "./Calendar.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import CalendarLeftSide from "../../Components/Calendar/CalendarLeftSide";
import CalendarRightSide from "../../Components/Calendar/CalendarRightSide";
import CalendarDrawer from "../../Components/Calendar/SideBar/CalendarDrawer";
import {
  calendarData,
  calendarM,
  CalformData,
  TaskData,
} from "../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import {
  fetchMettingListApi,
  fetchMettingListByLoginApi,
} from "../../Api/MeetingApi/MeetingListApi";
import { AddMeetingApi } from "../../Api/MeetingApi/AddMeetingApi";
import { deleteMeetingApi } from "../../Api/MeetingApi/DeleteMeetingApi";
import { toast } from "react-toastify";
import useAccess from "../../Components/Auth/Role/useAccess";
import { PERMISSIONS } from "../../Components/Auth/Role/permissions";
import useFullTaskFormatFile from "../../Utils/TaskList/FullTasKFromatfile";

const Calendar = () => {
  const { hasAccess } = useAccess();
  const isLaptop = useMediaQuery("(max-width:1420px)");
  const isLaptop1 = useMediaQuery("(max-width:1600px) and (min-width:1421px)");
  const setSelectedMon = useSetRecoilState(calendarM);
  const [calendarsColor, setCalendarsColor] = useState({});
  const setCalEvData = useSetRecoilState(calendarData);
  const setCalFormData = useSetRecoilState(CalformData);
  const [isLoding, setIsLoding] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState();
  const assigneeData = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));
  const setTasks = useSetRecoilState(TaskData);
  const { iswhTLoading, taskFinalData } = useFullTaskFormatFile();

  useEffect(() => {
    if (!iswhTLoading) {
      setTasks(taskFinalData?.TaskData);
    }
  }, [iswhTLoading]);

  useEffect(() => {
    setSelectedMon(new Date());
  }, []);

  useEffect(() => {
    const taskCategories =
      JSON?.parse(sessionStorage.getItem("taskworkcategoryData")) || [];
    const colorClasses = [
      "error",
      "primary",
      "warning",
      "success",
      "info",
      "secondary",
      "support",
      "dark",
      "light",
      "muted",
    ];
    const dynamicCalendarsColor = taskCategories.reduce(
      (acc, category, index) => {
        const categoryName = category.labelname;
        acc[categoryName] = colorClasses[index % colorClasses.length];
        return acc;
      },
      {}
    );

    setCalendarsColor(dynamicCalendarsColor);
    setSelectedMon(new Date());
  }, []);

  const handleMeetingListByLogin = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi(selectedAssignee);
      const data = (meetingApiRes && meetingApiRes?.rd) || [];
      if (data) {
        const taskAssigneeData = JSON.parse(
          sessionStorage.getItem("taskAssigneeData") || "[]"
        );
        const taskCategory = JSON.parse(
          sessionStorage.getItem("taskworkcategoryData") || "[]"
        );
        const enhancedMeetings = data.map((meeting) => ({
          ...meeting,
          guests:
            taskAssigneeData.filter((user) =>
              meeting?.assigneids?.split(",").map(Number).includes(user.id)
            ) || [],
          prModule: [],
          category:
            taskCategory?.find((item) => item?.id == meeting?.workcategoryid)
              ?.labelname || "",
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
          },
        }));
        setCalEvData(enhancedMeetings);
      } else {
        setCalEvData([]);
      }
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleMeetingList = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListApi();
      const data = (meetingApiRes && meetingApiRes?.rd) || [];
      if (data) {
        const taskAssigneeData = JSON.parse(
          sessionStorage.getItem("taskAssigneeData") || "[]"
        );
        const taskCategory = JSON.parse(
          sessionStorage.getItem("taskworkcategoryData") || "[]"
        );
        const enhancedMeetings = data.map((meeting) => ({
          ...meeting,
          guests:
            taskAssigneeData.filter((user) =>
              meeting?.assigneids?.split(",").map(Number).includes(user.id)
            ) || [],
          prModule: [],
          category:
            taskCategory?.find((item) => item?.id == meeting?.workcategoryid)
              ?.labelname || "",
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
          },
        }));
        setCalEvData(enhancedMeetings);
      } else {
        setCalEvData([]);
      }
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    if (selectedAssignee) {
      handleMeetingListByLogin();
    } else {
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList();
      } else {
        handleMeetingListByLogin();
      }
    }
  }, [selectedAssignee]);

  const handleCaleFormSubmit = async (formValues) => {
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    if (apiRes && apiRes?.rd[0]?.stat == 1) {
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList();
      } else {
        handleMeetingListByLogin();
      }
      if (formValues?.id) {
        toast.success("Meeting updated successfully");
      } else {
        toast.success("Meeting added successfully");
      }
    }
  };

  const handleRemoveAMeeting = async (formData) => {
    const apiRes = await deleteMeetingApi(formData);
    if (apiRes && apiRes?.rd[0]?.stat == 1) {
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList();
      } else {
        handleMeetingListByLogin();
      }
    }
  };

  const handleAssigneeChange = (newValue) => {
    setSelectedAssignee(newValue);
  };

  return (
    <Box
      className="calendarMain"
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Left Panel (Mobile View) */}
      {isLaptop ? (
        <CalendarDrawer
          calendarsColor={calendarsColor}
          handleCaleFormSubmit={handleCaleFormSubmit}
          handleRemoveAMeeting={handleRemoveAMeeting}
          isLoding={isLoding}
        />
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
          <CalendarLeftSide
            calendarsColor={calendarsColor}
            handleCaleFormSubmit={handleCaleFormSubmit}
            handleRemoveAMeeting={handleRemoveAMeeting}
            isLoding={isLoding}
          />
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
        <CalendarRightSide
          calendarsColor={calendarsColor}
          handleCaleFormSubmit={handleCaleFormSubmit}
          handleRemoveAMeeting={handleRemoveAMeeting}
          isLoding={isLoding}
          assigneeData={assigneeData}
          selectedAssignee={selectedAssignee}
          handleAssigneeChange={handleAssigneeChange}
          hasAccess={hasAccess}
        />
      </Box>
    </Box>
  );
};

export default Calendar;

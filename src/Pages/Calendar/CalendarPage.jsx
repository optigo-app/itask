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
  formData,
  FullSidebar,
  openFormDrawer,
  rootSubrootflag,
  TaskData,
} from "../../Recoil/atom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
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
import SidebarDrawer from "../../Components/FormComponent/Sidedrawer";
import MeetingDetail from "../../Components/Meeting/MeetingDetails";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";

const Calendar = () => {
  const { hasAccess } = useAccess();
  const isFullSidebar = useRecoilValue(FullSidebar);
  const isLaptop = useMediaQuery("(max-width:1420px)");
  const isLaptop1 = useMediaQuery("(max-width:1600px) and (min-width:1421px)");
  const setSelectedMon = useSetRecoilState(calendarM);
  const [calendarsColor, setCalendarsColor] = useState({});
  const [calEvData, setCalEvData] = useRecoilState(calendarData);
  const setCalFormData = useSetRecoilState(CalformData);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const [formDataValue, setFormDataValue] = useRecoilState(formData);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const [isLoding, setIsLoding] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState({});
  const assigneeData = JSON?.parse(sessionStorage?.getItem("taskAssigneeData")) || [];
  const setTasks = useSetRecoilState(TaskData);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [taskCategory, setTaskCategory] = useState([]);
  const [taskAssigneeData, setTaskAssigneeData] = useState([]);
  const { iswhTLoading, taskFinalData } = useFullTaskFormatFile();
  const [meetingDetailModalOpen, setMeetingDetailModalOpen] = useState(false);
  const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);


  useEffect(() => {
    const status = JSON?.parse(sessionStorage?.getItem("taskstatusData"));
    const priority = JSON?.parse(sessionStorage?.getItem("taskpriorityData"));
    const project = JSON?.parse(sessionStorage?.getItem("taskprojectData"));
    const category = JSON?.parse(sessionStorage?.getItem("taskworkcategoryData"));
    const assignee = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));
    setStatusData(status);
    setPriorityData(priority);
    setProjectData(project);
    setTaskCategory(category);
    setTaskAssigneeData(assignee);
  }, [])

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

  const handleTaskModalClose = () => {
    setMeetingDetailModalOpen(false);
  };

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
  };

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
    if (selectedAssignee?.id) {
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
      if (formValues?.taskid) {
        toast.success("Metting or Task updated successfully");
      } else {
        toast.success("Meeting added successfully");
      }
    }
  };

  const handleAssigneeChange = (newValue) => {
    setSelectedAssignee(newValue);
  };

  const handleMeetingEdit = (meeting) => {
    setFormDrawerOpen(true);
    setFormDataValue(meeting);
  };

  const handleMeetingDt = () => {
    setMeetingDetailModalOpen(true);
  };

  const handleRemove = (formValue) => {
    setFormDataValue(formValue)
    setCnfDialogOpen(true);
  };

  const handleConfirmRemoveAll = async () => {
    const updatedData = calEvData?.filter(cal => cal?.meetingid != formDataValue?.meetingid);
    setCalEvData(updatedData);
    setCnfDialogOpen(false);
    setFormDrawerOpen(false);
    try {
      const res = await deleteMeetingApi(formDataValue);
      if (res && res?.rd[0]?.stat == 1) {
        toast.success("Meeting or Task deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete meeting:", error);
      toast.error("Failed to delete meeting or task");
    }
  };

  const handleCloseDialog = () => {
    setCnfDialogOpen(false);
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
          isLoding={isLoding}
        />
      ) : (
        // Left Panel (Desktop View)
        <Box
          sx={{
            width: isLaptop1 ? (isFullSidebar ? "29%" : "25%") : "20%",
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
            isLoding={isLoding}
            setFormDrawerOpen={setFormDrawerOpen}
            setFormDataValue={setFormDataValue}
            setRootSubroot={setRootSubroot}
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
          isLoding={isLoding}
          assigneeData={assigneeData}
          selectedAssignee={selectedAssignee}
          handleAssigneeChange={handleAssigneeChange}
          hasAccess={hasAccess}
          setFormDrawerOpen={setFormDrawerOpen}
          setFormDataValue={setFormDataValue}
          handleMeetingEdit={handleMeetingEdit}
        />
      </Box>
      <SidebarDrawer
        open={formdrawerOpen}
        onClose={handleDrawerToggle}
        onSubmit={handleCaleFormSubmit}
        isLoading={isLoding}
        priorityData={priorityData}
        projectData={projectData}
        statusData={statusData}
        taskCategory={taskCategory}
        taskAssigneeData={taskAssigneeData}
        prModule={true}
        categoryDisabled={false}
        allDayShow={true}
        handleMeetingDt={handleMeetingDt}
        handleRemoveMetting={handleRemove}
      />
      < MeetingDetail
        open={meetingDetailModalOpen}
        onClose={handleTaskModalClose}
        taskData={formDataValue}
        handleMeetingEdit={handleMeetingEdit}
      />
      <ConfirmationDialog
        open={opencnfDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRemoveAll}
        title="Confirm"
        content="Are you sure you want to remove this Event?"
      />
    </Box>
  );
};

export default Calendar;

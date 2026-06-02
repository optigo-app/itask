import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import "./Calendar.scss";
import "bootstrap-icons/font/bootstrap-icons.css";
import CalendarLeftSide from "../../Components/Calendar/CalendarLeftSide";
import CalendarRightSide from "../../Components/Calendar/CalendarRightSide";
import CalendarDrawer from "../../Components/Calendar/SideBar/CalendarDrawer";
import {
  actualTaskData,
  calendarData,
  calendarM,
  CalformData,
  fetchlistApiCall,
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
import SidebarDrawer from "../../Components/FormComponent/Sidedrawer";
import MeetingDetail from "../../Components/Meeting/MeetingDetails";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import dayjs from "dayjs";
import { getUserProfileData } from "../../Utils/globalfun";
import { fetchTodayTaskApi } from "../../Api/TaskApi/fetchTodayTaskApi";

const getSessionList = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const normalizeCalendarTasks = (rows = []) => {
  const statusData = getSessionList("taskstatusData");
  const priorityData = getSessionList("taskpriorityData");
  const taskCategory = getSessionList("taskworkcategoryData");
  const taskProject = getSessionList("taskprojectData");
  const taskAssigneeData = getSessionList("taskAssigneeData");

  const statusById = new Map(statusData.map((item) => [Number(item?.id), item?.labelname || ""]));
  const priorityById = new Map(priorityData.map((item) => [Number(item?.id), item?.labelname || ""]));
  const categoryById = new Map(taskCategory.map((item) => [Number(item?.id), item?.labelname || ""]));
  const projectById = new Map(taskProject.map((item) => [Number(item?.id), item?.labelname || ""]));
  const assigneeById = new Map(taskAssigneeData.map((item) => [Number(item?.id), item]));

  const taskById = new Map();
  const parentWithChildren = new Set();

  rows.forEach((task) => {
    const taskId = Number(task?.taskid);
    if (!Number.isNaN(taskId)) taskById.set(taskId, task);
    if (task?.taskid !== undefined && task?.taskid !== null) taskById.set(String(task.taskid), task);

    const parentId = Number(task?.parentid);
    if (!Number.isNaN(parentId) && parentId !== 0) {
      parentWithChildren.add(parentId);
      parentWithChildren.add(String(parentId));
    }
  });

  return rows.map((task) => {
    const assigneeIdArray = task?.assigneids
      ?.toString()
      ?.split(",")
      ?.map((id) => Number(id));
    const matchedAssignees = (assigneeIdArray || [])
      .map((id) => assigneeById.get(id))
      .filter(Boolean);

    const parentTask = taskById.get(Number(task?.parentid)) || taskById.get(String(task?.parentid));
    const fullPathParts = String(task?.FullPath || "")
      .split("-->")
      .map((part) => part.trim())
      .filter(Boolean);
    const inferredModuleName = fullPathParts[0] || "-";
    const hasChildren = parentWithChildren.has(Number(task?.taskid)) || parentWithChildren.has(String(task?.taskid));
    const inferredType = Number(task?.parentid) === 0 ? "module" : hasChildren ? "major" : "minor";

    return {
      ...task,
      status: task?.status || statusById.get(Number(task?.statusid)) || "",
      priority: task?.priority || priorityById.get(Number(task?.priorityid)) || "",
      category: task?.category || categoryById.get(Number(task?.workcategoryid)) || "",
      taskPr: task?.taskPr || projectById.get(Number(task?.projectid)) || task?.project || "",
      assignee: task?.assignee || matchedAssignees,
      moduleName: task?.moduleName || task.Parenttaskname || parentTask?.moduleName || parentTask?.taskname || inferredModuleName,
      type: task?.type || inferredType,
    };
  });
};

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
  const fetchTaskTrigger = useRecoilValue(fetchlistApiCall);
  const setTasks = useSetRecoilState(TaskData);
  const setActualTaskDataValue = useSetRecoilState(actualTaskData);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [taskCategory, setTaskCategory] = useState([]);
  const [taskAssigneeData, setTaskAssigneeData] = useState([]);
  const auth = getUserProfileData();
  const [calendarViewRange, setCalendarViewRange] = useState({
    viewType: 'timeGridWeek',
    startDate: null,
    endDate: null,
  });
  const [tasklistDateRange, setTasklistDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [tasklistAssigneeId, setTasklistAssigneeId] = useState(null);

  const taskFilters = React.useMemo(() => {
    const startDate = calendarViewRange?.startDate;
    const endDate = calendarViewRange?.endDate;

    const tasklistStartDate = tasklistDateRange?.startDate;
    const tasklistEndDate = tasklistDateRange?.endDate;

    return {
      startdatefrom: tasklistStartDate ? dayjs(tasklistStartDate).format('YYYY-MM-DD') : (startDate ? dayjs(startDate).format('YYYY-MM-DD') : ''),
      startdateto: tasklistEndDate ? dayjs(tasklistEndDate).format('YYYY-MM-DD') : (endDate ? dayjs(endDate).subtract(1, 'day').format('YYYY-MM-DD') : ''),
      assigneeid: tasklistAssigneeId ?? ((selectedAssignee?.id || auth?.id) ?? '')
    };
  }, [calendarViewRange, selectedAssignee, tasklistDateRange, tasklistAssigneeId]);
  
  const hasValidDateRange = Boolean(taskFilters?.startdatefrom && taskFilters?.startdateto);

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
    if (!hasValidDateRange) return;

    const fetchCalendarTasks = async () => {
      try {
        const taskRes = await fetchTodayTaskApi(
          "order by StartDate asc",
          "5000",
          "1",
          taskFilters
        );
        const rows = taskRes?.rd || [];
        const normalizedRows = normalizeCalendarTasks(rows);
        setTasks(normalizedRows);
        setActualTaskDataValue(normalizedRows);
      } catch (error) {
        console.error("Error fetching calendar task list:", error);
        setTasks([]);
        setActualTaskDataValue([]);
      }
    };

    fetchCalendarTasks();
  }, [taskFilters, fetchTaskTrigger, hasValidDateRange]);

  useEffect(() => {
    setSelectedMon(new Date());
  }, []);

  useEffect(() => {
    const taskCategories =
      JSON?.parse(sessionStorage.getItem("taskworkcategoryData")) || [];
    const colorClasses = [
      "productive",
      "rnd-tech",
      "creative",
      "sop-correction",
      "leave",
      "maintenance",
      "unplanned",
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

  const processMeetingData = (data) => {
    const taskAssigneeData = JSON.parse(
      sessionStorage.getItem("taskAssigneeData") || "[]"
    );
    const taskCategory = JSON.parse(
      sessionStorage.getItem("taskworkcategoryData") || "[]"
    );
    const statusData = JSON.parse(
      sessionStorage.getItem("taskstatusData") || "[]"
    );
    const priorityData = JSON.parse(
      sessionStorage.getItem("taskpriorityData") || "[]"
    );

    return data.map((meeting) => ({
      ...meeting,
      guests:
        taskAssigneeData.filter((user) =>
          meeting?.assigneids?.split(",").map(Number).includes(user.id)
        ) || [],
      prModule: [],
      category:
        taskCategory?.find((item) => item?.id == meeting?.workcategoryid)
          ?.labelname || "",
      status:
        statusData?.find((item) => item?.id == meeting?.statusid)?.labelname ||
        meeting?.status ||
        '',
      priority:
        priorityData?.find((item) => item?.id == meeting?.priorityid)?.labelname ||
        meeting?.priority ||
        '',
      prModule: {
        projectid: meeting?.projectid,
        taskid: meeting?.taskid,
      },
    }));
  };

  const handleMeetingListByLogin = async () => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi(selectedAssignee);
      const data = (meetingApiRes && meetingApiRes?.rd) || [];
      if (data) {
        const enhancedMeetings = processMeetingData(data);
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
        const enhancedMeetings = processMeetingData(data);
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
        // handleMeetingList();
      } else {
        handleMeetingListByLogin();
      }
    }
  }, [selectedAssignee]);

  const handleCaleFormSubmit = async (formValues, options = {}) => {
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    if (apiRes && apiRes?.rd[0]?.stat == 1) {
      if (!options.skipRefresh) {
        if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
          handleMeetingList();
        } else {
          handleMeetingListByLogin();
        }
      }
      if (formValues?.taskid) {
        toast.success("Meeting or Task updated successfully");
      } else {
        toast.success("Meeting added successfully");
      }
      setFormDrawerOpen(false); // Close the drawer after save to prevent reopening
      return apiRes;
    }
    return null;
  };

  const handleAssigneeChange = (newValue) => {
    setSelectedAssignee(newValue);
  };

  const handleCalendarRangeChange = ({ viewType, startDate, endDate }) => {
    setCalendarViewRange({
      viewType: viewType || 'timeGridWeek',
      startDate: startDate || null,
      endDate: endDate || null,
    });
  };

  const handleTasklistDateRangeChange = (dateRange) => {
    setTasklistDateRange(dateRange);
  };

  const handleTasklistAssigneeChange = (assigneeId) => {
    setTasklistAssigneeId(assigneeId);
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
            onTasklistDateRangeChange={handleTasklistDateRangeChange}
            onTasklistAssigneeChange={handleTasklistAssigneeChange}
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
          assigneeData={assigneeData?.filter((emp) => emp.isactive === 1)}
          selectedAssignee={selectedAssignee}
          handleAssigneeChange={handleAssigneeChange}
          hasAccess={hasAccess}
          setFormDrawerOpen={setFormDrawerOpen}
          setFormDataValue={setFormDataValue}
          handleMeetingEdit={handleMeetingEdit}
          onCalendarRangeChange={handleCalendarRangeChange}
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
        content="Are you sure you want to remove this task from the calendar?"
      />
    </Box>
  );
};

export default Calendar;

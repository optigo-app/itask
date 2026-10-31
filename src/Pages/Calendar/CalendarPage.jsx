import React, { useEffect, useState } from "react";
import { Box, useMediaQuery, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider, IconButton } from "@mui/material";
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
import { deleteTaskDataApi } from "../../Api/TaskApi/DeleteTaskApi";
import { toast } from "react-toastify";
import useAccess from "../../Components/Auth/Role/useAccess";
import { PERMISSIONS } from "../../Components/Auth/Role/permissions";
import SidebarDrawer from "../../Components/FormComponent/Sidedrawer";
import MeetingDetail from "../../Components/Meeting/MeetingDetails";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import dayjs from "dayjs";
import { getUserProfileData, colorMaster } from "../../Utils/globalfun";
import { fetchTodayTaskApi } from "../../Api/TaskApi/fetchTodayTaskApi";
import CustomDateTimePicker from "../../Utils/DateComponent/CustomDateTimePicker";
import MoveEventDialog from "../../Components/Calendar/MoveEventDialog";

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
  const [calendarsColorHex, setCalendarsColorHex] = useState({});
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
  const [openPermanentDeleteDialog, setOpenPermanentDeleteDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState(null); // 'delete' | 'move'
  const [bulkSelectedEvents, setBulkSelectedEvents] = useState([]);
  const [moveToDate, setMoveToDate] = useState(null); // target date for individual move
  const [individualMoveEvent, setIndividualMoveEvent] = useState(null); // single event move dialog
  const [bulkMoveDates, setBulkMoveDates] = useState({}); // { meetingid: dayjs } per event


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
    // Map color by category NAME — index-based mapping wraps around when the
    // master has more categories than color classes (Unplanned fell back to
    // productive). Normalized: lowercase + trim to handle trailing spaces.
    // Color by category NAME (normalized: lowercase + trim) — stable regardless
    // of master order. Unknown/new categories get a deterministic color from
    // their id (ids don't change on reorder), so no code change is needed.
    const CATEGORY_COLOR_MAP = {
      "productive": "productive",
      "rnd - tech": "rnd-tech",
      "creative": "creative",
      "sop correction": "sop-correction",
      "leave": "leave",
      "maintenance": "maintenance",
      "customer request maintenance": "customer-maintenance",
      "unplanned": "unplanned",
      "challenges": "challenges",
      "reporting": "reporting",
      "meeting": "meeting",
      "training": "training",
    };
    const FALLBACK_PALETTE = [
      "productive", "rnd-tech", "creative", "sop-correction",
      "customer-maintenance", "challenges", "reporting", "meeting", "training",
    ];
    // API-persisted colorkey wins; name/id maps remain the fallback
    const hexMap = {};
    const dynamicCalendarsColor = taskCategories.reduce(
      (acc, category) => {
        const categoryName = category.labelname;
        const key = (categoryName || "").trim().toLowerCase();
        acc[categoryName] = CATEGORY_COLOR_MAP[key]
          || FALLBACK_PALETTE[(category?.id ?? 0) % FALLBACK_PALETTE.length];
        const ck = category?.colorkey;
        if (ck?.startsWith?.('#')) {
          const [cd, cl] = ck.split(';');
          hexMap[categoryName] = { backgroundColor: cl || cd + '22', borderColor: cd, textColor: cd };
        } else if (ck && colorMaster[ck]) {
          hexMap[categoryName] = {
            backgroundColor: colorMaster[ck].light,
            borderColor: colorMaster[ck].dark,
            textColor: colorMaster[ck].dark,
          };
        }
        return acc;
      },
      {}
    );

    setCalendarsColor(dynamicCalendarsColor);
    setCalendarsColorHex(hexMap);
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

  const handleMeetingListByLogin = async (dateRange) => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListByLoginApi(selectedAssignee, dateRange);
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

  const handleMeetingList = async (dateRange) => {
    setIsLoding(true);
    try {
      const meetingApiRes = await fetchMettingListApi(null, dateRange);
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

  // Build date range object for meeting API from calendarViewRange
  const meetingDateRange = React.useMemo(() => {
    const start = calendarViewRange?.startDate;
    const end = calendarViewRange?.endDate;
    if (!start || !end) return null;
    return {
      startdatefrom: dayjs(start).format('YYYY-MM-DD'),
      startdateto: dayjs(end).format('YYYY-MM-DD'),
    };
  }, [calendarViewRange]);

  // Fetch meetings when assignee or calendar date range changes
  useEffect(() => {
    if (selectedAssignee?.id) {
      handleMeetingListByLogin(meetingDateRange);
    } else {
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        // handleMeetingList(meetingDateRange);
      } else {
        handleMeetingListByLogin(meetingDateRange);
      }
    }
  }, [selectedAssignee, meetingDateRange]);

  const handleCaleFormSubmit = async (formValues, options = {}) => {
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    if (apiRes && apiRes?.rd[0]?.stat == 1) {
      if (!options.skipRefresh) {
        if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
          handleMeetingList(meetingDateRange);
        } else {
          handleMeetingListByLogin(meetingDateRange);
        }
      }
      if (!options.suppressToast) {
        if (formValues?.taskid) {
          toast.success("Meeting or Task updated successfully");
        } else {
          toast.success("Meeting added successfully");
        }
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

  const handlePermanentDelete = (formValue) => {
    setFormDataValue(formValue);
    setOpenPermanentDeleteDialog(true);
  };

  const handleConfirmPermanentDelete = async () => {
    setOpenPermanentDeleteDialog(false);
    const updatedData = calEvData?.filter(cal => cal?.meetingid != formDataValue?.meetingid);
    setCalEvData(updatedData);
    setFormDrawerOpen(false);
    try {
      // Call both APIs in parallel: delete calendar entry + permanently trash the task
      const promises = [deleteMeetingApi(formDataValue)];
      if (formDataValue?.taskid) {
        promises.push(deleteTaskDataApi(formDataValue));
      }
      const [meetingRes] = await Promise.all(promises);
      if (meetingRes && meetingRes?.rd[0]?.stat == 1) {
        toast.success("Calendar event and task deleted permanently");
      } else {
        toast.error("Failed to delete calendar event");
      }
    } catch (error) {
      console.error("Failed to permanently delete:", error);
      toast.error("Failed to permanently delete calendar event or task");
    }
  };

  const handleClosePermanentDeleteDialog = () => {
    setOpenPermanentDeleteDialog(false);
  };

  // --- Bulk actions for multi-selected events ---
  const handleBulkDelete = (events) => {
    if (!events || events.length === 0) return;
    setBulkSelectedEvents(events);
    setBulkAction('delete');
  };

  const handleBulkPermanentDelete = (events) => {
    if (!events || events.length === 0) return;
    setBulkSelectedEvents(events);
    setBulkAction('permanentdelete');
  };

  // Single refresh for bulk ops - refetches the meeting list once after all API calls
  const refreshCalendarEvents = () => {
    if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
      handleMeetingList(meetingDateRange);
    } else {
      handleMeetingListByLogin(meetingDateRange);
    }
  };

  const handleBulkMoveNextWeek = (events) => {
    if (!events || events.length === 0) return;
    setBulkSelectedEvents(events);
    setBulkAction('move');
    // Initialize per-event dates with each event's current start + 7 days
    const initialDates = {};
    events.forEach(ev => {
      const key = ev?.meetingid;
      const start = ev?.start || ev?.StartDate;
      initialDates[key] = start ? dayjs(start).add(7, 'day') : dayjs().add(7, 'day');
    });
    setBulkMoveDates(initialDates);
  };
  const handleIndividualMove = (event) => {
    if (!event) return;
    setIndividualMoveEvent(event);
    // Auto-fill with next week (current start + 7 days), same as bulk move
    const start = event?.start || event?.StartDate;
    setMoveToDate(start ? dayjs(start).add(7, 'day') : dayjs().add(7, 'day'));
  };

  const executeMove = async (events, targetDate) => {
    try {
      const target = dayjs(targetDate);
      const promises = events.map(ev => {
        const origStart = ev?.start ? dayjs(ev.start) : null;
        const origEnd = ev?.end ? dayjs(ev.end) : null;
        // Preserve original duration, shift to target date/time
        const duration = (origStart && origEnd) ? origEnd.diff(origStart, 'minute') : 60;
        const newStart = target.toISOString();
        const newEnd = target.add(duration, 'minute').toISOString();
        const updatedEv = {
          ...ev,
          start: newStart,
          end: newEnd,
          StartDate: newStart,
          EndDate: newEnd,
        };
        return AddMeetingApi(updatedEv);
      });
      await Promise.all(promises);
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList(meetingDateRange);
      } else {
        handleMeetingListByLogin(meetingDateRange);
      }
      toast.success(`${events.length} event(s) moved to ${target.format('DD MMM YYYY, HH:mm')}`);
    } catch (error) {
      console.error("Failed to move:", error);
      toast.error("Failed to move some events");
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList(meetingDateRange);
      } else {
        handleMeetingListByLogin(meetingDateRange);
      }
    }
  };

  const executeBulkMove = async (events, datesMap) => {
    try {
      const promises = events.map(ev => {
        const target = datesMap[ev?.meetingid];
        if (!target) return Promise.resolve();
        const origStart = ev?.start ? dayjs(ev.start) : null;
        const origEnd = ev?.end ? dayjs(ev.end) : null;
        const duration = (origStart && origEnd) ? origEnd.diff(origStart, 'minute') : 60;
        const newStart = target.toISOString();
        const newEnd = target.add(duration, 'minute').toISOString();
        const updatedEv = {
          ...ev,
          start: newStart,
          end: newEnd,
          StartDate: newStart,
          EndDate: newEnd,
        };
        return AddMeetingApi(updatedEv);
      });
      await Promise.all(promises);
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList(meetingDateRange);
      } else {
        handleMeetingListByLogin(meetingDateRange);
      }
      toast.success(`${events.length} event(s) moved successfully`);
    } catch (error) {
      console.error("Failed to move:", error);
      toast.error("Failed to move some events");
      if (hasAccess(PERMISSIONS.CALENDAR_VIEW_ALL)) {
        handleMeetingList(meetingDateRange);
      } else {
        handleMeetingListByLogin(meetingDateRange);
      }
    }
  };

  const handleConfirmBulkAction = async () => {
    const events = bulkSelectedEvents;
    const action = bulkAction;
    setBulkAction(null);
    if (!events || events.length === 0) return;

    if (action === 'delete') {
      // Remove from local state immediately
      const idsToDelete = new Set(events.map(ev => ev?.meetingid));
      setCalEvData(prev => prev.filter(ev => !idsToDelete.has(ev?.meetingid)));
      setFormDrawerOpen(false);
      try {
        // Call deleteMeetingApi + deleteTaskDataApi in parallel for all selected events
        const promises = events.flatMap(ev => {
          const arr = [deleteMeetingApi(ev)];
          if (ev?.taskid) arr.push(deleteTaskDataApi(ev));
          return arr;
        });
        await Promise.all(promises);
        toast.success(`${events.length} event(s) deleted successfully`);
      } catch (error) {
        console.error("Failed to bulk delete:", error);
        toast.error("Failed to delete some events");
      }
    } else if (action === 'permanentdelete') {
      // Remove from local state immediately
      const idsToDelete = new Set(events.map(ev => ev?.meetingid));
      setCalEvData(prev => prev.filter(ev => !idsToDelete.has(ev?.meetingid)));
      setFormDrawerOpen(false);
      try {
        // Call deleteMeetingApi + deleteTaskDataApi in parallel for all selected events
        const promises = events.flatMap(ev => {
          const arr = [deleteMeetingApi(ev)];
          if (ev?.taskid) arr.push(deleteTaskDataApi(ev));
          return arr;
        });
        await Promise.all(promises);
        toast.success(`${events.length} event(s) permanently deleted`);
      } catch (error) {
        console.error("Failed to bulk permanent delete:", error);
        toast.error("Failed to permanently delete some events");
      }
    } else if (action === 'move') {
      // Use per-event dates from bulkMoveDates (pre-filled with current date + 7 days)
      const dates = bulkMoveDates;
      const missing = events.find(ev => !dates[ev?.meetingid]);
      if (missing) {
        toast.error("Please select a date and time for all events");
        setBulkAction('move');
        return;
      }
      await executeBulkMove(events, dates);
    }
    setBulkSelectedEvents([]);
    setBulkMoveDates({});
  };

  const handleConfirmIndividualMove = async () => {
    if (!individualMoveEvent || !moveToDate) {
      toast.error("Please select a date and time");
      return;
    }
    const event = individualMoveEvent;
    setIndividualMoveEvent(null);
    await executeMove([event], moveToDate);
    setMoveToDate(null);
  };

  const handleCloseBulkDialog = () => {
    setBulkAction(null);
    setBulkSelectedEvents([]);
    setBulkMoveDates({});
  };

  const handleCloseIndividualMoveDialog = () => {
    setIndividualMoveEvent(null);
    setMoveToDate(null);
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
          calendarsColorHex={calendarsColorHex}
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
          calendarsColorHex={calendarsColorHex}
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
          calendarsColorHex={calendarsColorHex}
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
          handleRemoveEvent={handleRemove}
          handlePermanentDelete={handlePermanentDelete}
          handleBulkDelete={handleBulkDelete}
          handleBulkPermanentDelete={handleBulkPermanentDelete}
          handleBulkMoveNextWeek={handleBulkMoveNextWeek}
          handleIndividualMove={handleIndividualMove}
          onRefreshEvents={refreshCalendarEvents}
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
        handlePermanentDelete={handlePermanentDelete}
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
        title="Delete Event"
        content="Are you sure you want to remove this task from the calendar?"
        variant="danger"
        confirmLabel="Delete"
      />
      <ConfirmationDialog
        open={openPermanentDeleteDialog}
        onClose={handleClosePermanentDeleteDialog}
        onConfirm={handleConfirmPermanentDelete}
        title="Permanent Delete"
        content="This will permanently delete the calendar event and the associated task. This action cannot be undone. Are you sure?"
        variant="danger"
        confirmLabel="Delete"
      />
      <ConfirmationDialog
        open={bulkAction === 'delete'}
        onClose={handleCloseBulkDialog}
        onConfirm={handleConfirmBulkAction}
        title="Delete All Selected"
        content={`Are you sure you want to delete ${bulkSelectedEvents.length} selected event(s) from the calendar?`}
        variant="danger"
        confirmLabel="Delete All"
      />
      <ConfirmationDialog
        open={bulkAction === 'permanentdelete'}
        onClose={handleCloseBulkDialog}
        onConfirm={handleConfirmBulkAction}
        title="Permanent Delete All Selected"
        content={`This will permanently delete ${bulkSelectedEvents.length} selected event(s) and their associated tasks. This action cannot be undone. Are you sure?`}
        variant="danger"
        confirmLabel="Delete"
      />
      {/* Bulk move dialog with per-event date/time pickers in table format */}
      <Dialog
        open={bulkAction === 'move'}
        onClose={(e, reason) => { if (reason === 'backdropClick' || reason === 'escapeKeyDown') return; handleCloseBulkDialog(); }}
        className="bulkMoveDialog"
        disableBackdropClick
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: '14px', maxWidth: 680, width: '100%', p: 0, overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#7367f0', pt: 3, pb: 1.5 }}>
          Move {bulkSelectedEvents.length} Event(s) To
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ maxHeight: 520, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, zIndex: 1, background: '#f5f5f7' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#555', borderBottom: '2px solid #e0e0e0', width: '40%' }}>
                    Task / Event
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#555', borderBottom: '2px solid #e0e0e0', width: '25%' }}>
                    Current Date
                  </th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#555', borderBottom: '2px solid #e0e0e0', width: '35%' }}>
                    New Date &amp; Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {bulkSelectedEvents.map((ev, idx) => {
                  const currentStart = ev?.start || ev?.StartDate;
                  return (
                    <tr key={ev?.meetingid || idx} style={{ borderBottom: '1px solid #f0f0f0' }} className="bulkMoveRow">
                      <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ minWidth: 20, height: 20, borderRadius: '50%', background: '#7367f0', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {idx + 1}
                          </Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                            {ev?.title || ev?.meetingtitle || `Event ${ev?.meetingid}`}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '10px 12px', verticalAlign: 'middle' }}>
                        <Typography sx={{ fontSize: '0.78rem', color: '#888' }}>
                          {currentStart ? dayjs(currentStart).format('DD MMM YYYY, HH:mm') : '-'}
                        </Typography>
                      </td>
                      <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                        <CustomDateTimePicker
                          label=""
                          name={`bulkMove-${ev?.meetingid}`}
                          value={bulkMoveDates[ev?.meetingid] || null}
                          width="100%"
                          styleprops={{ sx: { width: '100%', '& .MuiOutlinedInput-root': { fontSize: '0.8rem', borderRadius: '8px' } } }}
                          onChange={(val) => setBulkMoveDates(prev => ({ ...prev, [ev?.meetingid]: val }))}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </DialogContent>
        <Divider sx={{ mx: 2, mt: 1 }} />
        <DialogActions sx={{ px: 3, pb: 2, pt: 1.5, gap: 1.5 }}>
          <Button className="secondaryBtnClassname" onClick={handleCloseBulkDialog} fullWidth>
            Cancel
          </Button>
          <Button className="buttonClassname" onClick={handleConfirmBulkAction} fullWidth>
            Move All
          </Button>
        </DialogActions>
      </Dialog>
      {/* Individual move dialog with date/time picker */}
      <MoveEventDialog
        open={Boolean(individualMoveEvent)}
        event={individualMoveEvent}
        moveToDate={moveToDate}
        onChangeDate={(val) => setMoveToDate(val)}
        onClose={handleCloseIndividualMoveDialog}
        onConfirm={handleConfirmIndividualMove}
      />
    </Box>
  );
};

export default Calendar;

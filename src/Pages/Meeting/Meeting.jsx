import React, { useEffect, useState } from "react";
import { lazy, Suspense } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { Calendar, Plus } from "lucide-react";
import { getRandomAvatarColor, getUserProfileData, ImageUrl } from "../../Utils/globalfun";
import CalendarForm from "../../Components/Calendar/SideBar/CalendarForm";
import { assigneeId, CalformData, filterDrawer, formData, masterDataValue, openFormDrawer, rootSubrootflag } from "../../Recoil/atom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import StatusModal from "./MeetingStatusModal";
import {
  fetchMettingFullDetailsListApi,
  fetchMettingListApi,
  fetchMettingListByLoginApi,
} from "../../Api/MeetingApi/MeetingListApi";
import { AddMeetingApi } from "../../Api/MeetingApi/AddMeetingApi";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";
import RejectReasonModal from "../../Utils/Common/RejectReasonModal";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { deleteMeetingApi } from "../../Api/MeetingApi/DeleteMeetingApi";
import { MeetingApprovalAPI } from "../../Api/MeetingApi/MeetingApprovalApi";
import { fetchMettingDetailApi } from "../../Api/MeetingApi/FetchMeetingStatus.js";
import { toast } from "react-toastify";
import { MeetingAttendAPI } from "../../Api/MeetingApi/MeetingAttendApi.js";
import ProfileCardModal from "../../Components/ShortcutsComponent/ProfileCard.jsx";
import useAccess from "../../Components/Auth/Role/useAccess.js";
import { PERMISSIONS } from "../../Components/Auth/Role/permissions.js";
import SidebarDrawer from "../../Components/FormComponent/Sidedrawer.jsx";

const MeetingTable = lazy(() =>
  import("../../Components/Meeting/MeetingGrid.jsx")
);
const MeetingCard = lazy(() =>
  import("../../Components/Meeting/MeetingCard.jsx")
);
const MeetingHeader = lazy(() =>
  import("../../Components/Meeting/MeetingHeader.jsx")
);
const MeetingDetail = lazy(() =>
  import("../../Components/Meeting/MeetingDetails.jsx")
);

const tabData = [
  { label: "Upcoming", content: "UpcomingMeetings" },
  { label: "Overdue", content: "OverdueMeetings" },
  { label: "Completed", content: "CompletedMeetings" },
  { label: "History", content: "MeetingsHistory" },
];

const meetingtabData = [
  { label: "My Schedule", content: "myMeetings" },
  { label: "Team Schedule", content: "teamMeetings" },
];

const MeetingPage = () => {
  const { hasAccess } = useAccess();
  const [viewType, setViewType] = useState("list");
  const [meetings, setMeetings] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [caledrawerOpen, setCaledrawerOpen] = useState(false);
  const [calFormData, setCalFormData] = useRecoilState(CalformData);
  const [formdrawerOpen, setFormDrawerOpen] = useRecoilState(openFormDrawer);
  const [fomrDataValue, setFormDataValue] = useRecoilState(formData);
  const setRootSubroot = useSetRecoilState(rootSubrootflag);
  const setAssigneeId = useSetRecoilState(assigneeId);
  const [formDatas, setFormDatas] = useState();
  const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTab, setSelectedTab] = useState({
    meetingTab: meetingtabData[1].label,
    filterTab: tabData[0].label,
  });
  const [meetingDetailModalOpen, setMeetingDetailModalOpen] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [taskCategory, setTaskCategory] = useState([]);
  const [taskDepartment, setTaskDepartment] = useState([]);
  const [taskAssigneeData, setTaskAssigneeData] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const status = JSON?.parse(sessionStorage?.getItem("taskstatusData"));
    const priority = JSON?.parse(sessionStorage?.getItem("taskpriorityData"));
    const project = JSON?.parse(sessionStorage?.getItem("taskprojectData"));
    const category = JSON?.parse(sessionStorage?.getItem("taskworkcategoryData"));
    const department = JSON?.parse(sessionStorage?.getItem("taskdepartmentData"));
    const assignee = JSON?.parse(sessionStorage?.getItem("taskAssigneeData"));
    setStatusData(status);
    setPriorityData(priority);
    setProjectData(project);
    setTaskCategory(category);
    setTaskDepartment(department);
    setTaskAssigneeData(assignee);
  }, [])

  const handleOpenStatusModal = (meeting) => {
    setOpenStatusModal(true);
    setFormDatas(meeting);
  };

  const handleTaskModalClose = () => {
    setMeetingDetailModalOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      const isFilterTab = tabData?.some((tab) => tab.label === newValue);

      setSelectedTab({
        meetingTab: isFilterTab ? (selectedTab?.meetingTab ?? meetingtabData[0]?.label) : newValue,
        filterTab: isFilterTab ? newValue : tabData[0]?.label,
      });
    }
  };

  const handleReject = (meeting) => {
    setOpenRejectModal(true);
    setFormDatas(meeting);
  };

  const handleAcceptMeeting = async (meeting) => {
    const formValues = {
      id: meeting?.meetingid,
      isAccept: 1,
      comment: "Approved",
    };
    setFormDatas(formValues);
    handleMeetingStatusSave(formValues);
  };

  const handleAttendMeeting = async (meeting) => {
    try {
      const updatedMeetings = meetings?.map((m) =>
        m.meetingid === meeting.meetingid
          ? { ...m, ismeeting_attnd: 1, isAttendBtn: 0 }
          : m
      );
      const formValues = {
        id: meeting?.meetingid,
        ismeeting_attnd: 1,
      };
      const apiRes = await MeetingAttendAPI(formValues);

      if (apiRes?.rd?.[0]?.stat == 1) {
        setMeetings(updatedMeetings);
        toast.success("Meeting attendance marked successfully.");
      } else {
        toast.error("Something went wrong while updating meeting attendance.");
      }
    } catch (error) {
      console.error("handleAttendMeeting error:", error);
      toast.error("Failed to update meeting attendance.");
    }
  };

  const handleCloseRejectModal = () => {
    setOpenRejectModal(false);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    const formValues = {
      id: formDatas?.meetingid,
      isAccept: 2,
      comment: rejectReason,
    };
    handleMeetingStatusSave(formValues);
    handleCloseRejectModal();
  };

  const handleMeetingList = async () => {
    if (meetings?.length == 0) {
      setIsLoding(true);
    }
    try {
      const meetingApiRes = await fetchMettingListApi();
      const meetingFullDt = await fetchMettingFullDetailsListApi();

      let meetingDtRes;
      if (meetingFullDt?.rd1[0]?.stat == 1) {
        meetingDtRes = meetingFullDt?.rd;
      } else {
        toast.error(meetingFullDt?.rd1[0]?.stat_msg);
      }

      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON?.parse(
        sessionStorage.getItem("taskAssigneeData") || "[]"
      );
      const loginUserData = getUserProfileData();
      const categoryData = JSON?.parse(
        sessionStorage?.getItem("taskworkcategoryData")
      );

      const today = new Date();
      const currentDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const enhancedMeetings = data?.map((meeting) => {
        const meetingDt =
          meetingDtRes?.find((m) => m?.meetingid == meeting?.meetingid) || {};
        const assigneeIds = meeting?.assigneids?.split(",")?.map(Number) || [];
        const category = categoryData?.find(
          (item) => item?.id == meeting?.workcategoryid
        );

        const isUserAssigned = assigneeIds?.includes(loginUserData?.id);
        const isMeetingDtEmpty = Object.keys(meetingDt).length === 0;
        const isAcceptStatusValid =
          isMeetingDtEmpty || meetingDt?.isAccept === 0;
        const isAttendStatusValid =
          isMeetingDtEmpty || meetingDt?.ismeeting_attnd === 0;

        const meetingDate = new Date(
          new Date(meeting.StartDate).getFullYear(),
          new Date(meeting.StartDate).getMonth(),
          new Date(meeting.StartDate).getDate()
        );
        const isUpcoming = meetingDate >= currentDateOnly;
        const isAction = isUserAssigned && isAcceptStatusValid && isUpcoming;
        const isAttendBtn =
          meetingDt?.isAccept == 1 &&
            !isAction &&
            isUserAssigned &&
            isAttendStatusValid &&
            meetingDt?.isAccept != 0 &&
            isUpcoming
            ? 1
            : 0;
        const ismeeting_attnd = meetingDt?.ismeeting_attnd == 1 ? 1 : 0;

        return {
          ...meeting,
          isAction,
          isAttendBtn,
          ismeeting_attnd,
          guests:
            taskAssigneeData?.filter((user) => assigneeIds.includes(user.id)) ||
            [],
          category,
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          meetingDt,
        };
      });

      const finalData = enhancedMeetings?.filter((m) => m?.category?.labelname?.toLowerCase() === "meeting");
      setMeetings(finalData);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleMeetingbyLogin = async () => {
    if (meetings?.length == 0) {
      setIsLoding(true);
    }
    try {
      const meetingApiRes = await fetchMettingListByLoginApi();
      const meetingFullDt = await fetchMettingFullDetailsListApi();

      let meetingDtRes;
      if (meetingFullDt?.rd1[0]?.stat == 1) {
        meetingDtRes = meetingFullDt?.rd;
      } else {
        toast.error(meetingFullDt?.rd1[0]?.stat_msg);
      }

      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON?.parse(
        sessionStorage.getItem("taskAssigneeData") || "[]"
      );
      const loginUserData = getUserProfileData();
      const categoryData = JSON?.parse(
        sessionStorage?.getItem("taskworkcategoryData")
      );

      const today = new Date();
      const currentDateOnly = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const enhancedMeetings = data?.map((meeting) => {
        const meetingDt =
          meetingDtRes?.find((m) => m?.meetingid == meeting?.meetingid) || {};
        const assigneeIds = meeting?.assigneids?.split(",")?.map(Number) || [];
        const category = categoryData?.find(
          (item) => item?.id == meeting?.workcategoryid
        );

        const isUserAssigned = assigneeIds?.includes(loginUserData?.id);
        const isMeetingDtEmpty = Object.keys(meetingDt).length === 0;
        const isAcceptStatusValid =
          isMeetingDtEmpty || meetingDt?.isAccept === 0;
        const isAttendStatusValid =
          isMeetingDtEmpty || meetingDt?.ismeeting_attnd === 0;

        const meetingDate = new Date(
          new Date(meeting.StartDate).getFullYear(),
          new Date(meeting.StartDate).getMonth(),
          new Date(meeting.StartDate).getDate()
        );
        const isUpcoming = meetingDate >= currentDateOnly;
        const isAction = isUserAssigned && isAcceptStatusValid && isUpcoming;
        const isAttendBtn =
          meetingDt?.isAccept == 1 &&
            !isAction &&
            isUserAssigned &&
            isAttendStatusValid &&
            meetingDt?.isAccept != 0 &&
            isUpcoming
            ? 1
            : 0;
        const ismeeting_attnd = meetingDt?.ismeeting_attnd == 1 ? 1 : 0;

        return {
          ...meeting,
          isAction,
          isAttendBtn,
          ismeeting_attnd,
          guests:
            taskAssigneeData?.filter((user) => assigneeIds.includes(user.id)) ||
            [],
          category,
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          meetingDt,
        };
      });
      const finalData = enhancedMeetings?.filter((m) => m?.category?.labelname?.toLowerCase() === "meeting");
      setMeetings(finalData);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleMeetingApiCall = () => {
    if (hasAccess(PERMISSIONS.MEETING_VIEW_ALL)) {
      if (selectedTab?.meetingTab == "My Schedule") {
        handleMeetingbyLogin();
      } else {
        handleMeetingList();
      }
    } else {
      handleMeetingbyLogin();
    }
  }

  useEffect(() => {
    handleMeetingApiCall();
  }, [selectedTab]);

  // Filter and Sort Meetings
  const filteredMeetings = meetings
    ?.filter((meeting) => {
      const searchFields = [
        meeting.meetingtitle,
        meeting.ProjectName,
        meeting.taskname,
        meeting.meetingdesc,
        ...meeting.guests.map(
          (guest) => `${guest.firstname} ${guest.lastname}`
        ),
      ];

      const matchesSearch = searchFields.some((field) =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const meetingDate = new Date(
        new Date(meeting.StartDate).getFullYear(),
        new Date(meeting.StartDate).getMonth(),
        new Date(meeting.StartDate).getDate()
      );

      const diffTime = today - meetingDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (selectedTab?.filterTab) {
        case "Upcoming":
          return matchesSearch && meetingDate >= today;
        case "Overdue":
          return matchesSearch && meetingDate < today && diffDays <= 15;
        case "Completed":
          return (
            matchesSearch && meetingDate < today && meeting.isAttendBtn === 2
          );
        case "History":
          return (
            matchesSearch &&
            meetingDate < today &&
            (meeting.isAttendBtn === 0 && diffDays > 15)
          );
        default:
          return matchesSearch;
      }
    })
    ?.sort((a, b) => new Date(a.time) - new Date(b.time));

  const handleDrawerToggle = () => {
    setFormDrawerOpen(!formdrawerOpen);
  };

  const handleCaleFormSubmit = async (formValues) => {
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingApiCall();
    } else {
      toast.error(apiRes?.rd[0]?.stat_msg);
    }
  };

  const handleMeetingStatusSave = async (formValues) => {
    const apiRes = await MeetingApprovalAPI(formValues);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingApiCall();
    }
  };

  const handleFetchMeetingDetails = async () => {
    const apiRes = await fetchMettingDetailApi(formDatas);
    if (apiRes?.rd1[0]?.stat == 1) {
      return apiRes?.rd;
    }
  };

  const handleRemove = (formValue) => {
    setCnfDialogOpen(true);
    setFormDatas(formValue);
  };

  const handleCloseCnfDialog = () => {
    setCnfDialogOpen(false);
  };

  const handleConfirmRemoveAMeeting = async () => {
    const apiRes = await deleteMeetingApi(formDatas);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingApiCall();
    }
    handleCloseCnfDialog();
  };

  const handleAddMeetings = () => {
    setFormDrawerOpen(!formdrawerOpen);
    setRootSubroot({
      Task: "meeting",
    })
  };

  const handleMeetingDt = (meeting) => {
    setFormDatas(meeting);
    handleDrawerToggle();
    setMeetingDetailModalOpen(true);
  };

  const handleMeetingEdit = (meeting) => {
    setFormDatas(meeting);
    handleTaskModalClose();
    setCaledrawerOpen(true);
  }

  const background = (assignee) => {
    const avatarBackgroundColor = assignee?.avatar
      ? "transparent"
      : getRandomAvatarColor(assignee);
    return avatarBackgroundColor;
  };

  const StatusCircles = (meeting, { redCount, yellowCount, greenCount }) => {
    const circleStyle = {
      minWidth: 30,
      minHeight: 30,
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginRight: "1px",
      marginLeft: "1px",
    };

    return (
      <Box
        sx={{ display: "flex", justifyContent: "start", alignItems: "center" }}
        className="statucsCircles"
      >
        <Box
          sx={{
            ...circleStyle,
            backgroundColor: "#FFE0E0",
            cursor: "pointer",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;",
          }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: "#FF4D4F !important" }}>
            {redCount}
          </Typography>
        </Box>
        <Box
          sx={{
            ...circleStyle,
            backgroundColor: "#FFF7E6",
            cursor: "pointer",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;",
          }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: "#FAAD14 !important" }}>
            {yellowCount}
          </Typography>
        </Box>
        <Box
          sx={{
            ...circleStyle,
            backgroundColor: "#F6FFED",
            cursor: "pointer",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;",
          }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: "#52C41A !important" }}>
            {greenCount}
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  const hanldePAvatarClick = (task, id) => {
    setAssigneeId(id);
    setProfileOpen(true);
    setCalFormData(task);
  };

  const handleChangePage = (event, newPage) => {
    setPage(event);
  };

  const handlePageSizeChnage = (event) => {
    setRowsPerPage(event ?? rowsPerPage);
    setPage(1);
  };

  useEffect(() => {
    if (filteredMeetings) {
      const maxPage = Math.ceil(filteredMeetings.length / rowsPerPage);
      if (page > maxPage && maxPage > 0) {
        setPage(maxPage);
      }
    }
  }, [filteredMeetings, page, rowsPerPage]);

  const totalPages = Math?.ceil(filteredMeetings && filteredMeetings?.length / rowsPerPage);

  const currentData = filteredMeetings?.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  return (
    <Box
      sx={{
        boxShadow:
          "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "20px",
        borderRadius: "8px",
        overflow: "hidden !important",
      }}
    >
      <Suspense
        fallback={
          <div>
            <LoadingBackdrop isLoading={"true"} />
          </div>
        }
      >
        <MeetingHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleAddMeetings={handleAddMeetings}
          viewType={viewType}
          handleViewChange={handleViewChange}
          tabData={tabData ?? []}
          meetingtabData={meetingtabData ?? []}
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
        />

        <div
          style={{
            margin: "20px 0",
            border: "1px dashed #7d7f85",
            opacity: 0.3,
          }}
        />

        {!isLoding ? (
          <>
            {filteredMeetings.length > 0 ? (
              <>
                {viewType === "card" ? (
                  <Grid container spacing={2}>
                    {filteredMeetings?.map((meeting) => (
                      <Grid item xs={12} sm={6} md={4} key={meeting?.meetingid}>
                        <MeetingCard
                          meeting={meeting}
                          selectedTab={selectedTab}
                          handleDrawerToggle={handleDrawerToggle}
                          setCalFormData={setCalFormData}
                          setMeetingDetailModalOpen={setMeetingDetailModalOpen}
                          StatusCircles={StatusCircles}
                          ImageUrl={ImageUrl}
                          background={background}
                          handleOpenStatusModal={handleOpenStatusModal}
                          handleAcceptMeeting={handleAcceptMeeting}
                          handleReject={handleReject}
                          handleAttendMeeting={handleAttendMeeting}
                          hanldePAvatarClick={hanldePAvatarClick}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <MeetingTable
                    meeting={currentData}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalPages={totalPages}
                    handleChangePage={handleChangePage}
                    handlePageSizeChnage={handlePageSizeChnage}
                    selectedTab={selectedTab}
                    handleDrawerToggle={handleDrawerToggle}
                    setCalFormData={setCalFormData}
                    setFormData={setFormDatas}
                    setFormDataValue={setFormDataValue}
                    setRootSubroot={setRootSubroot}
                    setMeetingDetailModalOpen={setMeetingDetailModalOpen}
                    StatusCircles={StatusCircles}
                    background={background}
                    handleOpenStatusModal={handleOpenStatusModal}
                    handleAcceptMeeting={handleAcceptMeeting}
                    handleReject={handleReject}
                    handleAttendMeeting={handleAttendMeeting}
                    hanldePAvatarClick={hanldePAvatarClick}
                    handleRemove={handleRemove}
                  />
                )}
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50vh",
                  textAlign: "center",
                }}
              >
                <Calendar size={64} color="#7d7f85" />
                <Typography
                  variant="h6"
                  sx={{ mt: 2, mb: 1, color: "#6D6B77" }}
                >
                  No meetings found
                </Typography>
                <Typography variant="body2" sx={{ color: "#7d7f85", mb: 2 }}>
                  There are no scheduled meetings at the moment.
                </Typography>
                <Button
                  variant="contained"
                  className="buttonClassname"
                  onClick={handleAddMeetings}
                  startIcon={<Plus size={20} />}
                >
                  Schedule a Meeting
                </Button>
              </Box>
            )}
          </>
        ) : (
          <LoadingBackdrop isLoading={isLoding ? "true" : "false"} />
        )}
        <StatusModal
          open={openStatusModal}
          mettingData={formDatas}
          handleFetchMeetingDetails={handleFetchMeetingDetails}
          handleClose={() => setOpenStatusModal(false)}
        />
        {/* <CalendarForm
          open={caledrawerOpen}
          onClose={handleDrawerToggle}
          onSubmit={handleCaleFormSubmit}
          onRemove={handleRemove}
          handleMeetingDt={handleMeetingDt}
        /> */}
        <RejectReasonModal
          open={openRejectModal}
          onClose={handleCloseRejectModal}
          onConfirm={handleConfirmReject}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
        />
        <ConfirmationDialog
          open={opencnfDialogOpen}
          onClose={handleCloseCnfDialog}
          onConfirm={handleConfirmRemoveAMeeting}
          title="Confirm"
          content="Are you sure you want to remove this meeting?"
        />
        <MeetingDetail
          open={meetingDetailModalOpen}
          onClose={handleTaskModalClose}
          taskData={fomrDataValue}
          handleMeetingEdit={handleMeetingEdit}
        />
        <ProfileCardModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          profileData={calFormData}
          background={background}
        />
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
          categoryDisabled={true}
          allDayShow={true}
        />
      </Suspense>
    </Box>
  );
};

export default MeetingPage;

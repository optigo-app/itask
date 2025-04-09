import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import AvatarGroup from "@mui/material/AvatarGroup";
import dayjs from "dayjs";
import { Calendar, IdCard, Kanban, List, Plus, SearchIcon } from "lucide-react";
import { getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";
import CalendarForm from "../../Components/Calendar/SideBar/CalendarForm";
import { CalformData } from "../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import StatusModal from "./MeetingStatusModal";
import { fetchMettingFullDetailsListApi, fetchMettingListApi, fetchMettingListByLoginApi } from "../../Api/MeetingApi/MeetingListApi";
import { AddMeetingApi } from "../../Api/MeetingApi/AddMeetingApi";
import LoadingBackdrop from "../../Utils/Common/LoadingBackdrop";
import RejectReasonModal from "../../Utils/Common/RejectReasonModal";
import ConfirmationDialog from "../../Utils/ConfirmationDialog/ConfirmationDialog";
import { deleteMeetingApi } from "../../Api/MeetingApi/DeleteMeetingApi";
import { MeetingApprovalAPI } from "../../Api/MeetingApi/MeetingApprovalApi";
import { fetchMettingDetailApi } from "../../Api/MeetingApi/FetchMeetingStatus.js";
import { toast } from "react-toastify";
import MeetingTable from "../../Components/Meeting/MeetingGrid.jsx";
import MeetingCard from "../../Components/Meeting/MeetingCard.jsx";
import MeetingHeader from "../../Components/Meeting/MeetingHeader.jsx";

const tabData = [
  { label: 'Upcoming', content: 'UpcomingMeetings' },
  { label: 'Overdue', content: 'OverdueMeetings' },
  { label: 'Completed', content: 'CompletedMeetings' },
  { label: 'History', content: 'MeetingsHistory' },
];


const MeetingPage = () => {
  const [viewType, setViewType] = useState('list');
  const [meetings, setMeetings] = useState([]);
  console.log('meetings: ', meetings);
  const [isLoding, setIsLoding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [caledrawerOpen, setCaledrawerOpen] = useState(false);
  const setCalFormData = useSetRecoilState(CalformData);
  const [formData, setFormData] = useState();
  const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTab, setSelectedTab] = useState(tabData[0]?.label || '');

  const handleOpenStatusModal = (meeting) => {
    setOpenStatusModal(true);
    setFormData(meeting);
  };


  const handleTabChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  const handleReject = (meeting) => {
    setOpenRejectModal(true);
    setFormData(meeting);
  };

  const handleAcceptMeeting = async (meeting) => {
    const formValues = {
      id: meeting?.meetingid,
      isAccept: 1,
      comment: "Approved",
    };
    setFormData(formValues)
    handleMeetingStatusSave(formValues);
  };

  const handleAttendMeeting = async (meeting) => {
    console.log('meeting: ', meeting);
    const updatedMeetings = meetings?.map(m =>
      m.meetingid === meeting.meetingid
        ? { ...m, isAttendBtn: 2 }
        : m
    );

    setMeetings(updatedMeetings);
  };

  const handleCloseRejectModal = () => {
    setOpenRejectModal(false);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    console.log("Rejected", "Reason:", rejectReason);
    const formValues = {
      id: formData?.meetingid,
      isAccept: 2,
      comment: rejectReason,
    };
    handleMeetingStatusSave(formValues);
    handleCloseRejectModal();
  };

  const handleMeetingList = async () => {
    setIsLoding(true);
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
      const taskAssigneeData = JSON.parse(sessionStorage.getItem("taskAssigneeData") || "[]");
      const loginUserData = JSON.parse(localStorage.getItem("UserProfileData") || "{}");

      const enhancedMeetings = data.map((meeting) => {
        const meetingDt = meetingDtRes?.find((m) => m?.meetingid == meeting?.meetingid) || {};
        const assigneeIds = meeting?.assigneids?.split(",")?.map(Number) || [];

        const isUserAssigned = assigneeIds.includes(loginUserData?.id);
        console.log('isUserAssigned: ', isUserAssigned);
        const isMeetingDtEmpty = Object.keys(meetingDt).length === 0;
        const isAcceptStatusValid = isMeetingDtEmpty || meetingDt?.isAccept === 0;

        const isAction = isUserAssigned && isAcceptStatusValid;

        const isAttendBtn = isUserAssigned && meeting?.meetingDt?.isAccept != 0 ? 1 : 0;

        return {
          ...meeting,
          isAction,
          isAttendBtn,
          guests: taskAssigneeData?.filter((user) =>
            assigneeIds.includes(user.id)
          ) || [],
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          meetingDt
        };
      });

      setMeetings(enhancedMeetings);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  const handleMeetingbyLogin = async () => {
    setIsLoding(true);
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
      const taskAssigneeData = JSON.parse(sessionStorage.getItem("taskAssigneeData") || "[]");
      const loginUserData = JSON.parse(localStorage.getItem("UserProfileData") || "{}");

      const enhancedMeetings = data.map((meeting) => {
        const meetingDt = meetingDtRes?.find((m) => m?.meetingid == meeting?.meetingid) || {};
        const assigneeIds = meeting?.assigneids?.split(",")?.map(Number) || [];

        const isUserAssigned = assigneeIds.includes(loginUserData?.id);
        const isMeetingDtEmpty = Object.keys(meetingDt).length === 0;
        const isAcceptStatusValid = isMeetingDtEmpty || meetingDt?.isAccept === 0;

        const isAction = isUserAssigned && isAcceptStatusValid;

        return {
          ...meeting,
          isAction,
          guests: taskAssigneeData?.filter((user) =>
            assigneeIds.includes(user.id)
          ) || [],
          prModule: {
            projectid: meeting?.projectid,
            taskid: meeting?.taskid,
            projectname: meeting?.ProjectName,
            taskname: meeting?.taskname,
            taskPr: meeting?.ProjectName,
          },
          meetingDt
        };
      });

      setMeetings(enhancedMeetings);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(() => {
    // handleMeetingbyLogin();
    handleMeetingList();
  }, [])

  // Filter and Sort Meetings
  const filteredMeetings = meetings
    ?.filter((meeting) => {
      const searchFields = [
        meeting.meetingtitle,
        meeting.ProjectName,
        meeting.taskname,
        meeting.meetingdesc,
        ...meeting.guests.map(guest => `${guest.firstname} ${guest.lastname}`)
      ];
      const matchesSearch = searchFields.some(field =>
        field?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const currentDate = new Date();
      const meetingDate = new Date(meeting.StartDate);

      switch (selectedTab) {
        case 'Upcoming':
          return matchesSearch && meetingDate > currentDate;
        case 'Overdue':
          return matchesSearch && meetingDate < currentDate ;
        case 'Completed':
          return matchesSearch && meetingDate < currentDate && meeting.isAttendBtn == 2;
        case 'History':
          return matchesSearch && meetingDate < currentDate && meeting.isAttendBtn === 0;
        default:
          return matchesSearch;
      }
    })
    ?.sort((a, b) => new Date(a.time) - new Date(b.time));
  console.log('filteredMeetings: ', filteredMeetings);

  const handleDrawerToggle = () => {
    setCaledrawerOpen(!caledrawerOpen);
  };

  const handleCaleFormSubmit = async (formValues) => {
    debugger
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingList()
    } else {
      toast.error(apiRes?.rd[0]?.stat_msg)
    }
  };

  const handleMeetingStatusSave = async (formValues) => {
    const apiRes = await MeetingApprovalAPI(formValues);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingList()
    }
  }

  const handleFetchMeetingDetails = async () => {
    const apiRes = await fetchMettingDetailApi(formData);
    if (apiRes?.rd1[0]?.stat == 1) {
      return apiRes?.rd;
    }
  }

  const handleRemove = (formValue) => {
    setCnfDialogOpen(true);
    setFormData(formValue)
  };

  const handleCloseCnfDialog = () => {
    setCnfDialogOpen(false);
  };

  const handleConfirmRemoveAMeeting = async () => {
    const apiRes = await deleteMeetingApi(formData);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingList()
    }
    handleCloseCnfDialog();
  };

  const handleAddMeetings = () => {
    setCaledrawerOpen(true);
  }

  const background = (team) => {
    console.log('team: ', team);
    const avatarBackgroundColor = team?.empphoto
      ? "transparent"
      : getRandomAvatarColor(team?.firstname);
    return avatarBackgroundColor;
  }

  const StatusCircles = ({ meeting, redCount, yellowCount, greenCount }) => {
    console.log('meeting: ', meeting);
    const circleStyle = {
      minWidth: 30,
      minHeight: 30,
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '1px',
      marginLeft: '1px',
    };

    return (
      <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#FFE0E0',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: '#FF4D4F !important' }}>
            {redCount}
          </Typography>
        </Box>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#FFF7E6',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: '#FAAD14 !important' }}>
            {yellowCount}
          </Typography>
        </Box>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#F6FFED',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => handleOpenStatusModal(meeting)}
        >
          <Typography variant="body2" sx={{ color: '#52C41A !important' }}>
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
  }

  return (
    <Box
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
        padding: "20px",
        borderRadius: "8px",
        overflow: "hidden !important",
      }}>
      <MeetingHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleMeetingList={handleMeetingList}
        handleAddMeetings={handleAddMeetings}
        viewType={viewType}
        handleViewChange={handleViewChange}
        tabData={tabData ?? []}
        selectedTab={selectedTab}
        handleTabChange={handleTabChange}
      />

      {!isLoding ? (
        <>
          {filteredMeetings.length > 0 ? (
            <>
              {viewType === 'card' ? (
                <Grid container spacing={2}>
                  {filteredMeetings?.map((meeting) => (
                    <Grid item xs={12} sm={6} md={4} key={meeting?.meetingid}>
                      <MeetingCard
                        meeting={meeting}
                        handleDrawerToggle={handleDrawerToggle}
                        setCalFormData={setCalFormData}
                        StatusCircles={StatusCircles}
                        ImageUrl={ImageUrl}
                        background={background}
                        handleAcceptMeeting={handleAcceptMeeting}
                        handleReject={handleReject}
                        handleAttendMeeting={handleAttendMeeting}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) :
                <MeetingTable
                  meeting={filteredMeetings}
                  StatusCircles={StatusCircles}
                  background={background}
                  handleOpenStatusModal={handleOpenStatusModal}
                  handleAcceptMeeting={handleAcceptMeeting}
                  handleReject={handleReject}
                  handleAttendMeeting={handleAttendMeeting}
                />
              }
            </>
          ) :
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50vh',
                textAlign: 'center',
              }}
            >
              <Calendar size={64} color="#7d7f85" />
              <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#6D6B77' }}>
                No meetings found
              </Typography>
              <Typography variant="body2" sx={{ color: '#7d7f85', mb: 2 }}>
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
          }
        </>
      ) :
        <LoadingBackdrop isLoading={isLoding ? 'true' : 'false'} />
      }
      <StatusModal open={openStatusModal} handleFetchMeetingDetails={handleFetchMeetingDetails} handleClose={() => setOpenStatusModal(false)} />
      <CalendarForm
        open={caledrawerOpen}
        onClose={handleDrawerToggle}
        onSubmit={handleCaleFormSubmit}
        onRemove={handleRemove}
      />
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
    </Box>
  );
};

export default MeetingPage;

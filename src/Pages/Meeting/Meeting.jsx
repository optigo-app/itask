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
} from "@mui/material";
import AvatarGroup from "@mui/material/AvatarGroup";
import dayjs from "dayjs";
import { Plus, SearchIcon } from "lucide-react";
import { getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";
import CalendarForm from "../../Components/Calendar/SideBar/CalendarForm";
import { CalformData } from "../../Recoil/atom";
import { useSetRecoilState } from "recoil";
import StatusModal from "./MeetingStatusModal";
import { fetchMettingListApi } from "../../Api/TaskApi/MeetingListApi";
import { AddMeetingApi } from "../../Api/TaskApi/AddMeetingApi";

const MeetingPage = () => {
  const [meetings, setMeetings] = useState([]);
  console.log('meetings: ', meetings);
  const [searchTerm, setSearchTerm] = useState("");
  const [caledrawerOpen, setCaledrawerOpen] = useState(false);
  const setCalFormData = useSetRecoilState(CalformData);
  const [formData, setFormData] = useState();
  const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);

  const handleMeetingList = async () => {
    try {
      const meetingApiRes = await fetchMettingListApi();
      const data = meetingApiRes?.rd || [];
      const taskAssigneeData = JSON.parse(sessionStorage.getItem("taskAssigneeData") || "[]");

      const enhancedMeetings = data.map((meeting) => ({
        ...meeting,
        guests: taskAssigneeData.filter((user) => meeting?.assigneids?.split(",").map(Number).includes(user.id)) || [],
      }));

      setMeetings(enhancedMeetings);
    } catch (error) {
      console.error("Error fetching meeting list:", error);
    }
  };


  useEffect(() => {
    handleMeetingList();
  }, [])


  // Filter and Sort Meetings
  const filteredMeetings = meetings
    ?.filter((meeting) =>
      meeting?.meetingtitle?.toLowerCase()?.includes(searchTerm.toLowerCase())
    )
    ?.sort((a, b) => new Date(a.time) - new Date(b.time));

  const handleDrawerToggle = () => {
    setCaledrawerOpen(!caledrawerOpen);
  };

  const handleCaleFormSubmit = async (formValues) => {
    console.log('formValues: ', formValues);
    setCalFormData(formValues);
    const apiRes = await AddMeetingApi(formValues);
    console.log('apiRes: ', apiRes);
    if (apiRes?.rd[0]?.stat == 1) {
      handleMeetingList()
    }
    // handleMeetingList()
  };

  const handleRemove = (formValue) => {
    setFormData(formValue)
    setCnfDialogOpen(true);
  };

  const handleAddMeetings = () => {
    setCaledrawerOpen(true);
  }

  const background = (team) => {
    const avatarBackgroundColor = team?.avatar
      ? "transparent"
      : getRandomAvatarColor(team?.name);
    return avatarBackgroundColor;
  }

  const StatusCircles = ({ redCount, yellowCount, greenCount }) => {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#FF4D4F',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => setOpenStatusModal(true)}
        >
          <Typography variant="body2" sx={{ color: '#fff !important' }}>
            {redCount}
          </Typography>
        </Box>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#FAAD14',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => setOpenStatusModal(true)}
        >
          <Typography variant="body2" sx={{ color: '#fff !important' }}>
            {yellowCount}
          </Typography>
        </Box>
        <Box sx={{
          ...circleStyle,
          backgroundColor: '#52C41A',
          cursor: 'pointer',
          boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;'
        }}
          onClick={() => setOpenStatusModal(true)}
        >
          <Typography variant="body2" sx={{ color: '#fff !important' }}>
            {greenCount}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ padding: "16px" }}>
      {/* Search and Add Meeting Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <TextField
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          className="textfieldsClass"
          sx={{
            minWidth: 250,
            "@media (max-width: 600px)": { minWidth: "100%" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" className="buttonClassname" onClick={handleAddMeetings}>
          <Plus style={{ marginRight: '5px', opacity: '.9' }} size={20} />
          Add Meeting</Button>
      </Box>

      {/* Meeting Cards */}
      <Grid container spacing={2}>
        {filteredMeetings?.map((meeting) => (
          <Grid item xs={12} sm={6} md={4} key={meeting?.meetingid}>
            <Card
              sx={{
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
                minHeight: '190px'
              }}
            >
              <CardContent sx={{ paddingBottom: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "bold",
                      marginBottom: "8px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                      color: '#6D6B77 !important'
                    }}
                  >
                    {meeting.meetingtitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6D6B77 !important' }}>
                    {dayjs(meeting.StartDate)?.format("DD MMM YYYY, hh:mm A")}
                  </Typography>
                </Box>
                <div
                  style={{
                    margin: "10px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {meeting.ProjectName && meeting.taskname && (
                      <>
                        {/* <span className="label" style={{ color: '#7d7f85' }}>Project/Module : </span> */}
                        <span
                          className="value"
                          style={{ color: '#6D6B77', fontWeight: 'bold' }}
                        >
                          {meeting.ProjectName}/{meeting.taskname}
                        </span>
                      </>
                    )}
                  </Typography>
                  {StatusCircles({ redCount: 5, yellowCount: 10, greenCount: 50 })}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: '#6D6B77 !important', textTransform: 'capitalize', marginBottom: "8px", mt: 0.5 }}
                >
                  {meeting.Desc || "\u00A0"}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <AvatarGroup max={8}
                    sx={{
                      '& .MuiAvatar-root': {
                        width: 30,
                        height: 30,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.2)',
                          zIndex: 10
                        }
                      }
                    }}
                  >
                    {meeting?.guests?.map((participant) => (
                      <Tooltip
                        placement="top"
                        key={participant.firstname + " " + participant.lastname}
                        title={participant.firstname + " " + participant.lastname}
                        arrow
                        classes={{ tooltip: 'custom-tooltip' }}
                      >
                        <Avatar
                          alt={participant.firstname + " " + participant.lastname}
                          src={ImageUrl(participant)}
                          sx={{
                            background: background(participant),
                          }}
                        />
                      </Tooltip>
                    ))}
                  </AvatarGroup>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Accept Button */}
                    <Button
                      variant="contained"
                      href={meeting.link}
                      target="_blank"
                      className="buttonClassname"
                    >
                      Accept
                    </Button>

                    {/* Reject Button */}
                    <Button
                      variant="contained"
                      // onClick={() => handleReject(meeting.id)}
                      className="secondaryBtnClassname"
                    >
                      Reject
                    </Button>
                  </Box>

                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <StatusModal open={openStatusModal} handleClose={() => setOpenStatusModal(false)} />
      <CalendarForm
        open={caledrawerOpen}
        onClose={handleDrawerToggle}
        onSubmit={handleCaleFormSubmit}
        onRemove={handleRemove}
      />
    </Box>
  );
};

export default MeetingPage;

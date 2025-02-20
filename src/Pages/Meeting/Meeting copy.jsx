import React, { useState } from "react";
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
} from "@mui/material";
import AvatarGroup from "@mui/material/AvatarGroup";
import dayjs from "dayjs";
import { Plus, SearchIcon } from "lucide-react";
import { getRandomAvatarColor } from "../../Utils/globalfun";
import CalendarForm from "../../Components/Calendar/SideBar/CalendarForm";
import { CalformData } from "../../Recoil/atom";
import { useSetRecoilState } from "recoil";

// Sample Meeting Data
const initialMeetings = [
  {
    id: 1,
    title: "Team Standup",
    time: "2025-01-21T09:00:00",
    platform: "Google Meet",
    link: "https://meet.google.com/example",
    description: "Daily team sync to discuss progress and blockers.",
    participants: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=1" },
      { name: "Bob", avatar: "https://i.pravatar.cc/40?img=2" },
      { name: "Charlie", avatar: "https://i.pravatar.cc/40?img=3" },
      { name: "Diana", avatar: "https://i.pravatar.cc/40?img=4" },
      { name: "Edward", avatar: "https://i.pravatar.cc/40?img=5" },
    ],
  },
  {
    id: 2,
    title: "Client Presentation",
    time: "2025-01-21T11:00:00",
    platform: "Zoom",
    link: "https://zoom.us/example",
    description: "Presenting the latest product features to the client.",
    participants: [
      { name: "Alice", avatar: "https://i.pravatar.cc/40?img=6" },
      { name: "Frank", avatar: "https://i.pravatar.cc/40?img=7" },
    ],
  },
  {
    id: 3,
    title: "Project Kickoff",
    time: "2025-01-21T14:00:00",
    platform: "Microsoft Teams",
    link: "https://teams.microsoft.com/example",
    description: "Initial meeting to plan project timelines and deliverables.",
    participants: [
      { name: "Grace", avatar: "https://i.pravatar.cc/40?img=8" },
      { name: "Henry", avatar: "https://i.pravatar.cc/40?img=9" },
      { name: "Isabella", avatar: "https://i.pravatar.cc/40?img=10" },
      { name: "Jack", avatar: "https://i.pravatar.cc/40?img=11" },
    ],
  },
];


const MeetingPage = () => {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [searchTerm, setSearchTerm] = useState("");
  const [caledrawerOpen, setCaledrawerOpen] = useState(false);
  const setCalFormData = useSetRecoilState(CalformData);
  const [formData, setFormData] = useState();
  const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);

  // Filter and Sort Meetings
  const filteredMeetings = meetings
    .filter((meeting) =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  const handleDrawerToggle = () => {
    setCaledrawerOpen(!caledrawerOpen);
  };


  const handleCaleFormSubmit = async (formValues) => {
    setCalFormData(formValues);
    const existingData = JSON.parse(localStorage.getItem('calformData')) || [];
    const existingEventIndex = existingData.findIndex(event => event.id === formValues.id);
    let updatedData;
    if (existingEventIndex !== -1) {
      updatedData = existingData.map((event, index) =>
        index === existingEventIndex ? formValues : event
      );
    } else {
      updatedData = [...existingData, formValues];
    }
    localStorage.setItem('calformData', JSON.stringify(updatedData));
  };

  const handleRemove = (formValue) => {
    setFormData(formValue)
    setCnfDialogOpen(true);
  };

  const handleAddMeetings = () => {
    setCaledrawerOpen(true);
  }


  const background = (team) => {
    console.log('team: ', team);
    const avatarBackgroundColor = team?.avatar
      ? "transparent"
      : getRandomAvatarColor(team?.name);
    return avatarBackgroundColor;
  }

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
        {filteredMeetings.map((meeting) => (
          <Grid item xs={12} sm={6} md={4} key={meeting.id}>
            <Card
              sx={{
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
                height: '220px'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", marginBottom: "8px" }}
                  >
                    {meeting.title}
                  </Typography>
                  <Typography variant="body1">
                    {dayjs(meeting.time).format("DD MMM YYYY, hh:mm A")}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ marginBottom: "8px" }}>
                  Platform: {meeting.platform}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "8px" }}>
                  {meeting.description}
                </Typography>
                <AvatarGroup max={4} sx={{ marginBottom: "8px" }}>
                  {meeting.participants.map((participant) => (
                    <Avatar
                      key={participant.name}
                      alt={participant.name}
                      src={participant.avatar}
                      sx={{
                        background: background(participant),
                        transition: 'transform 0.3s ease-in-out',
                        width: 35,
                        height: 35,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                        }
                      }}
                    />
                  ))}
                </AvatarGroup>
                <Button
                  variant="contained"
                  color="primary"
                  href={meeting.link}
                  target="_blank"
                  className="buttonClassname"
                  sx={{
                    background: "#7d7f85 !important",
                    "&:hover": { backgroundColor: "#5a56d6" },
                  }}
                >
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
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

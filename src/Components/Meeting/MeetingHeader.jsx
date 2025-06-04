import React from 'react';
import "./Styles/MeetingHeader.scss";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { IdCard, List, Plus } from 'lucide-react';
import DasboardTab from '../Project/Dashboard/dasboardTab';
import useAccess from '../Auth/Role/useAccess';
import { PERMISSIONS } from '../Auth/Role/permissions';

const MeetingHeader = ({
  searchTerm,
  setSearchTerm,
  tabData,
  meetingtabData,
  selectedTab,
  handleAddMeetings,
  viewType,
  handleViewChange,
  handleTabChange
}) => {
  const isMobile = useMediaQuery('(max-width:960px)');
  const { hasAccess } = useAccess();

  const ViewToggleButtons = ({ view, onViewChange }) => {
    return (
      <ToggleButtonGroup
        size="small"
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label="view mode"
      >
        <ToggleButton value="table" aria-label="table view">
          <List size={20} />
        </ToggleButton>
        <ToggleButton value="card" aria-label="card view">
          <IdCard size={20} />
        </ToggleButton>
      </ToggleButtonGroup>
    );
  };

  return (
    <Box
      className="meetingHeaderContainer"
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
        className="meetingHeaderFBox"
      >
        <DasboardTab
          tabData={tabData}
          selectedTab={selectedTab?.filterTab}
          handleChange={handleTabChange}
        />
        <TextField
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          className="textfieldsClass"
          sx={{
            minWidth: 250,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box className="meetingHeaderSBox">
        {hasAccess(PERMISSIONS.MEETING_VIEW_ALL) &&
          <DasboardTab
            tabData={meetingtabData}
            selectedTab={selectedTab?.meetingTab}
            handleChange={handleTabChange}
          />
        }
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="contained"
            className="buttonClassname"
            onClick={handleAddMeetings}
          >
            <Plus style={{ marginRight: '5px', opacity: '.9' }} size={20} />
            Add {isMobile ? "" : "Meeting"}
          </Button>
          <ViewToggleButtons view={viewType} onViewChange={handleViewChange} />
        </Box>
      </Box>
    </Box>
  );
};

export default MeetingHeader;

import React from 'react';
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { IdCard, List, Plus } from 'lucide-react';
import DasboardTab from '../Project/Dashboard/dasboardTab';

const MeetingHeader = ({
  searchTerm,
  setSearchTerm,
  tabData,
  selectedTab,
  handleMeetingList,
  handleAddMeetings,
  viewType,
  handleViewChange,
  handleTabChange
}) => {


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
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        "@media (max-width: 600px)": { width: "100%", gap: "8px" },
      }}>
        <DasboardTab
          tabData={tabData}
          selectedTab={selectedTab}
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
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          variant="contained"
          className="buttonClassname"
          onClick={handleMeetingList}
        >
          Show ALL
        </Button>
        <Button
          variant="contained"
          className="buttonClassname"
          onClick={handleAddMeetings}
        >
          <Plus style={{ marginRight: '5px', opacity: '.9' }} size={20} />
          Add Meeting
        </Button>
        <ViewToggleButtons view={viewType} onViewChange={handleViewChange} />
      </Box>
    </Box>
  );
};

export default MeetingHeader;

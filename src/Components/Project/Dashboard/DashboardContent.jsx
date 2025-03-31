import React from 'react';
import ReferencePr from './ReferencePr';
import MilestoneTimeline from './MilestoneTimeline';
import TaskChalenges from './TaskChalenges';
import { Typography } from '@mui/material';
import RnDTask from './RndTask';
import TeamMembers from './TeamMembers';
import Comments from './Commnets';

const DashboardContent = ({ tabData, selectedTab }) => {
  const renderContent = () => {
    switch (selectedTab) {
      case 'Reference':
        return <ReferencePr />;
      case 'Milestone':
        return <MilestoneTimeline />;
        case 'Challenges':
          return <TaskChalenges />;
        case 'R&D':
          return <RnDTask />;
        case 'Team Member':
          return <TeamMembers />;
        case 'Comments':
          return <Comments/>;
      default:
        return <Typography>No Data Found...</Typography>;
    }
  };

  return (
    <div>
      <div style={{
        margin: "15px 0",
        border: "1px dashed #7d7f85",
        opacity: 0.3,
      }}
      />
      {renderContent()}
    </div>
  );
};

export default DashboardContent;

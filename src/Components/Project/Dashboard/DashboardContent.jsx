import React, { lazy, Suspense } from 'react';
import { Typography, CircularProgress } from '@mui/material';

// Lazy-loaded components
const ReferencePr = lazy(() => import('./ReferencePr'));
const MilestoneTimeline = lazy(() => import('./MilestoneTimeline'));
const TaskChalenges = lazy(() => import('./TaskChalenges'));
const RnDTask = lazy(() => import('./RndTask'));
const TeamMembers = lazy(() => import('./TeamMembers'));
const Comments = lazy(() => import('./Commnets'));

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
        return <Comments />;
      default:
        return <Typography>No Data Found...</Typography>;
    }
  };

  return (
    <div>
      <div
        style={{
          margin: '15px 0',
          border: '1px dashed #7d7f85',
          opacity: 0.3,
        }}
      />
      <Suspense fallback={<div style={{ textAlign: 'center' }}><CircularProgress /></div>}>
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default DashboardContent;

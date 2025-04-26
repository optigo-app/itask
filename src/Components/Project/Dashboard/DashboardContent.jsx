import React, { lazy, Suspense } from 'react';
import { Typography, CircularProgress } from '@mui/material';

// Lazy-loaded components
const ReferencePr = lazy(() => import('./ReferencePr'));
const MilestoneTimeline = lazy(() => import('./MilestoneTimeline'));
const TaskChalenges = lazy(() => import('./TaskChalenges'));
const RnDTask = lazy(() => import('./RndTask'));
const TeamMembers = lazy(() => import('./TeamMembers'));
const Comments = lazy(() => import('./Commnets'));

const DashboardContent = ({ selectedTab, handleDtopen }) => {
  const renderContent = () => {
    switch (selectedTab) {
      case 'Reference':
        return <ReferencePr handleDtopen={handleDtopen}/>;
      case 'Milestone':
        return <MilestoneTimeline handleDtopen={handleDtopen}/>;
      case 'Challenges':
        return <TaskChalenges handleDtopen={handleDtopen}/>;
      case 'R&D':
        return <RnDTask handleDtopen={handleDtopen}/>;
      case 'Team Member':
        return <TeamMembers handleDtopen={handleDtopen}/>;
      case 'Comments':
        return <Comments handleDtopen={handleDtopen}/>;
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
      <Suspense fallback={<></>}>
        {renderContent()}
      </Suspense>
    </div>
  );
};

export default DashboardContent;

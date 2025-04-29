import React, { lazy, Suspense } from 'react';
import { Typography } from '@mui/material';

// Lazy-loaded components
const ReferencePr = lazy(() => import('./ReferencePr'));
const MilestoneTimeline = lazy(() => import('./MilestoneTimeline'));
const TaskChalenges = lazy(() => import('./TaskChalenges'));
const RnDTask = lazy(() => import('./RndTask'));
const TeamMembers = lazy(() => import('./TeamMembers'));
const Comments = lazy(() => import('./Commnets'));

const DashboardContent = ({ selectedTab, handleDtopen, taskFinalData, taskAssigneeData  }) => {
  console.log('taskFinalData: ', taskFinalData);
  const renderContent = () => {
    switch (selectedTab) {
      case 'Reference':
        return <ReferencePr handleDtopen={handleDtopen} />;
      case 'Milestone':
        return <MilestoneTimeline handleDtopen={handleDtopen} milestoneData={taskFinalData?.MilestoneData} />;
      case 'Challenges':
        return <TaskChalenges handleDtopen={handleDtopen} TaskChalenges={taskFinalData?.ChallengesTask} />;
      case 'R&D':
        return <RnDTask handleDtopen={handleDtopen} taskRnd={taskFinalData?.RndTask} />;
      case 'Team Member':
        return <TeamMembers handleDtopen={handleDtopen} taskAssigneeData={taskAssigneeData}/>;
      case 'Comments':
        return <Comments handleDtopen={handleDtopen} />;
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



//latest code

// import React from "react";
// import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";
// import { Card, Typography, LinearProgress, Box } from "@mui/material";
// import { formatDate2 } from "../../../Utils/globalfun";
// import "./Styles/MilestoneTimeline.scss";

// const milestones = [
//     { name: "Project Initiation", startDate: "2024-03-01", endDate: "2024-03-10", progress: 100, department: "Management" },
//     { name: "Design Phase", startDate: "2024-03-11", endDate: "2024-04-01", progress: 70, department: "Design Team" },
//     { name: "Development", startDate: "2024-04-02", endDate: "2024-06-30", progress: 40, department: "Engineering" },
//     { name: "Testing & QA", startDate: "2024-07-01", endDate: "2024-08-15", progress: 10, department: "QA Team" },
// ];

// const getProgressColor = (progress) => {
//     if (progress === 100) {
//         return "success";
//     } else if (progress >= 60) {
//         return "primary";
//     } else if (progress >= 30) {
//         return "warning";
//     } else {
//         return "error";
//     }
// };

// const MilestoneTimeline = ({ milestoneData }) => {
//     const sortedMilestones = milestoneData.sort((a, b) => {
//         if (a.progress_per === 100) return -1;
//         if (b.progress_per === 100) return 1;
//         if (a.progress_per === 0) return 1;
//         if (b.progress_per === 0) return -1;
//         return b.progress_per - a.progress_per;
//     });
//     console.log('sortedMilestones: ', sortedMilestones);
//     return (
//         <Box className="milestone-container">
//             <Timeline position="alternate">
//                 {sortedMilestones.map((milestone, index) => (
//                     <TimelineItem key={index}>
//                         <TimelineSeparator>
//                             <TimelineDot className={`dot-${getProgressColor(milestone.progress_per)}`} />
//                             {index !== milestones.length - 1 && <TimelineConnector />}
//                         </TimelineSeparator>
//                         <TimelineContent>
//                             <Card className="milestone-card">
//                                 <Typography variant="subtitle1" className="milestone-name"><strong>{milestone.taskname}</strong></Typography>
//                                 <Typography variant="body2" className="milestone-department">Department: {milestone.taskDpt}</Typography>
//                                 <Typography variant="body2" className="milestone-dates">
//                                     Start: {formatDate2(milestone.StartDate)} | End: {formatDate2(milestone.entrydate)}
//                                 </Typography>
//                                 <Box className="progress-container">
//                                     <LinearProgress
//                                         variant="determinate"
//                                         value={milestone.progress_per}
//                                         className={`progress-bar ${getProgressColor(milestone.progress_per)}`}
//                                     />
//                                     <Typography variant="caption" className={`progress-text text-${getProgressColor(milestone.progress_per)}`}>{milestone.progress_per}% Completed</Typography>
//                                 </Box>
//                             </Card>
//                         </TimelineContent>
//                     </TimelineItem>
//                 ))}
//             </Timeline>
//         </Box>
//     );
// };

// export default MilestoneTimeline;


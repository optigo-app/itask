import React, { lazy, Suspense } from 'react';
import { IconButton, Typography } from '@mui/material';
import ReusableTable from './ReusableTable';
import StatusBadge from '../../ShortcutsComponent/StatusBadge';
import { priorityColors, statusColors } from '../../../Utils/globalfun';
import TaskPriority from '../../ShortcutsComponent/TaskPriority';
import { Eye } from 'lucide-react';
import { selectedRowData } from '../../../Recoil/atom';
import { useSetRecoilState } from 'recoil';

// Lazy-loaded components
const ReferencePr = lazy(() => import('./ReferencePr'));
const MilestoneTimeline = lazy(() => import('./MilestoneTimeline'));
const TaskChalenges = lazy(() => import('./TaskChalenges'));
const RnDTask = lazy(() => import('./RndTask'));
const TeamMembers = lazy(() => import('./TeamMembers'));
const Comments = lazy(() => import('./Commnets'));
const Announcement = lazy(() => import('./Announcement'));

const DashboardContent = ({ tabData, Loading, selectedTab, decodedData, handleDtopen, taskFinalData, taskAssigneeData, background, refferenceData }) => {
  console.log('selectedTab: ', selectedTab);
  const categoryData = JSON.parse(sessionStorage.getItem('taskworkcategoryData')) || [];
  const selectedTabLower = selectedTab?.toLowerCase();
  const setSelectedTask = useSetRecoilState(selectedRowData);


  const tabConfig = {
    Reference: {
      component: ReferencePr,
      props: {
        handleDtopen,
        Loading: Loading?.isAttLoding,
        refferenceData,
        background,
        decodedData
      }
    },
    Milestone: {
      component: MilestoneTimeline,
      props: {
        handleDtopen,
        milestoneData: taskFinalData?.ProjectMilestoneData,
        decodedData
      }
    },
    "Team Member": {
      component: TeamMembers,
      props: {
        handleDtopen,
        taskAssigneeData,
        teamMemberData: taskFinalData?.TeamMembers,
        decodedData,
        background
      }
    },
    Comments: {
      component: Comments,
      props: { handleDtopen }
    }
  };
  const renderContent = () => {
    if (tabConfig[selectedTab]) {
      const { component: Component, props } = tabConfig[selectedTab];
      return <Component {...props} />;
    }
    const matchedCategory = categoryData.find(
      (cat) => cat.labelname?.toLowerCase() === selectedTabLower
    );

    if (matchedCategory) {
      debugger
      const dataKey = selectedTab.replace(/\s+/g, '_');

      const prwiseData = taskFinalData?.ProjectCategoryTasks[decodedData?.projectid];
      const taskData = prwiseData?.[(dataKey)?.toLowerCase()] || [];
      console.log('data-->>>: ', taskData);

      const handleEyeClick = (row) => {
        setSelectedTask(row);
        handleDtopen(true);
      };

      return (
        <ReusableTable
          className="reusable-table-container"
          columns={[
            { id: "taskname", label: "Task Name" },
            { id: "project", label: "Project" },
            { id: "status", label: "Status" },
            { id: "priority", label: "Priority" },
            { id: "action", label: "Action" }
          ]}
          data={taskData?.map(row => ({
            ...row,
            status: <StatusBadge task={row} statusColors={statusColors} onStatusChange={{}} disable={true} />,
            "project": `${decodedData?.project}`,
            priority: TaskPriority(row.priority, priorityColors),
            action: (
              <IconButton
                aria-label="view Task button"
                onClick={() => handleEyeClick(row)}
              >
                <Eye
                  size={20}
                  color="#808080"
                  className="iconbtn"
                />
              </IconButton>
            )
          }))}
        />
      );
    }

    return <Typography>No Data Found...</Typography>;
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

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import taskData from "../../Data/taskData.json"
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import FullTasKFromatfile from '../../Utils/TaskList/FullTasKFromatfile';

// Lazy-loaded components
const DasboardTab = lazy(() => import('../../Components/Project/Dashboard/dasboardTab'));
const DashboardContent = lazy(() => import('../../Components/Project/Dashboard/DashboardContent'));
const TaskDetail = lazy(() => import('../../Components/Task/TaskDetails/TaskDetails'));

const ProjectDashboard = () => {
    const { isLoading, taskFinalData, taskAssigneeData } = FullTasKFromatfile();
    console.log('taskFinalData: ', isLoading, taskFinalData);

    const location = useLocation();
    const [categoryData, setCategoryData] = useState([]);
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

    const handleTaskModalOpen = (item) => {
        setTaskDetailModalOpen(true);
    };

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const tabData = [
        { label: 'Team Member', content: 'TeamMember' },
        { label: 'Milestone', content: 'MilestoneTimeline' },
        { label: 'Reference', content: 'ReferencePr' },
        { label: 'Comments', content: 'Comments' },
        { label: 'Challenges', content: 'Challenges' },
        { label: 'R&D', content: 'RnD' },
    ];

    const [selectedTab, setSelectedTab] = useState(tabData[0]?.label || '');

    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedTab(newValue);
        }
    };

    return (
        <Box
            sx={{
                boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                padding: "30px 20px",
                borderRadius: "8px",
            }}
        >
            <Suspense fallback={<></>}>
                <DasboardTab
                    tabData={tabData}
                    selectedTab={selectedTab}
                    handleChange={handleChange}
                />
            </Suspense>

            <Suspense fallback={<></>}>
                {isLoading ? (
                    <LoadingBackdrop isLoading={isLoading ? 'true' : 'false'} />
                ) :
                    <DashboardContent
                        tabData={tabData}
                        selectedTab={selectedTab}
                        handleDtopen={handleTaskModalOpen}
                        taskFinalData={taskFinalData}
                        taskAssigneeData={taskAssigneeData}
                    />
                }
            </Suspense>

            <Suspense fallback={<></>}>
                <TaskDetail
                    open={taskDetailModalOpen}
                    onClose={handleTaskModalClose}
                    taskData={taskData}
                />
            </Suspense>
        </Box>
    );
};

export default ProjectDashboard;

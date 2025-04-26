import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import DasboardTab from '../../Components/Project/Dashboard/dasboardTab';
import DashboardContent from '../../Components/Project/Dashboard/DashboardContent';
import { useLocation } from 'react-router-dom';
import TaskDetail from '../../Components/Task/TaskDetails/TaskDetails';
import taskData from "../../Data/taskData.json"

const ProjectDashboard = () => {
    const location = useLocation();
    console.log('location: ', location);
    const [categoryData, setCategoryData] = useState([]);
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);

    const handleTaskModalOpen = (item) => {
        setTaskDetailModalOpen(true);
    }

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };
    console.log('categoryData: ', categoryData);
    const tabData = [
        { label: 'Team Member', content: 'TeamMember' },
        { label: 'Milestone', content: 'MilestoneTimeline' },
        { label: 'Reference', content: 'ReferencePr' },
        // { label: 'SOP Correction', content: 'SopCorrection' },
        { label: 'Comments', content: 'Comments' },
        { label: 'Challenges', content: 'Challenges' },
        { label: 'R&D', content: 'RnD' },
    ];

    const category = [
        {
            id: "T10",
            isdelete: 0,
            labelname: "Team Member"
        },
        {
            id: "M10",
            isdelete: 0,
            labelname: "Milestone"
        }
    ]

    useEffect(() => {
        const cateData = JSON?.parse(sessionStorage.getItem('taskworkcategoryData')) || [];
        setCategoryData([...category, ...cateData]);
    }, []);

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
            <DasboardTab
                tabData={tabData}
                selectedTab={selectedTab}
                handleChange={handleChange}
            />
            <DashboardContent tabData={tabData} selectedTab={selectedTab} handleDtopen={handleTaskModalOpen} />

            <TaskDetail
                open={taskDetailModalOpen}
                onClose={handleTaskModalClose}
                taskData={taskData}
            />
        </Box>
    );
};

export default ProjectDashboard;

import React, { useState } from 'react';
import { Box } from '@mui/material';
import DasboardTab from '../../Components/Project/Dashboard/dasboardTab';
import DashboardContent from '../../Components/Project/Dashboard/DashboardContent';

const ProjectDashboard = () => {
    const tabData = [
        { label: 'Reference', content: 'ReferencePr' },
        { label: 'Milestone', content: 'MilestoneTimeline' },
        { label: 'SOP Correction', content: 'SopCorrection' },
        { label: 'Team Member', content: 'TeamMember' },
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
            <DasboardTab 
                tabData={tabData} 
                selectedTab={selectedTab} 
                handleChange={handleChange} 
            />
            <DashboardContent tabData={tabData} selectedTab={selectedTab} />
        </Box>
    );
};

export default ProjectDashboard;

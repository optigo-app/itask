import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { getRandomAvatarColor, mapKeyValuePair } from '../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../Recoil/atom';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { getAttachmentApi } from '../../Api/UploadApi/GetAttachmentApi';

// Lazy-loaded components
const DasboardTab = lazy(() => import('../../Components/Project/Dashboard/dasboardTab'));
const DashboardContent = lazy(() => import('../../Components/Project/Dashboard/DashboardContent'));
const TaskDetail = lazy(() => import('../../Components/Task/TaskDetails/TaskDetails'));

const ProjectDashboard = () => {
    const location = useLocation();
    const [Loading, setLoading] = useState({
        isAttLoding: false,
        isTaskLoding: false,
    });
    const selectedData = useRecoilValue(selectedRowData);
    const [decodedData, setDecodedData] = useState(null);
    const { isLoading, taskFinalData, taskAssigneeData } = useFullTaskFormatFile();
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [refferenceData, setReferenceData] = useState([]);

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    useEffect(() => {
        const assigneeMaster = JSON.parse(sessionStorage.getItem('taskAssigneeData')) || [];
        const getAttachment = async () => {
            try {
                setLoading(prev => ({ ...prev, isAttLoding: true }));
                const res = await getAttachmentApi({});
                if (res) {
                    const labeledTasks = mapKeyValuePair(res);
                    const updatedLabeledTasks = labeledTasks.map(task => {
                        const matchedAssignee = assigneeMaster.find(
                            ass => ass.userid === task.userid
                        );
                        return {
                            ...task,
                            guest: matchedAssignee || null,
                        };
                    });
                    setReferenceData(updatedLabeledTasks);
                }
            } catch (error) {
                console.error("Failed to fetch attachments:", error);
            } finally {
                setLoading(prev => ({ ...prev, isAttLoding: false }));
            }
        };
    
        if (selectedData) {
            getAttachment();
        }
    }, [selectedData]);
    

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const encodedData = searchParams.get('d');

        if (encodedData) {
            try {
                const decodedString = atob(encodedData);
                const parsedData = JSON.parse(decodedString);
                setDecodedData(parsedData);
            } catch (error) {
                console.error('Error decoding or parsing search data:', error);
            }
        }
    }, [location.search]);

    const handleTaskModalOpen = () => {
        setTaskDetailModalOpen(true);
    };

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const tabData = [
        { label: 'Reference', content: 'ReferencePr' },
        { label: 'Milestone', content: 'MilestoneTimeline' },
        { label: 'Team Member', content: 'TeamMember' },
        { label: 'Comments', content: 'Comments' },
        { label: 'Announcement', content: 'Announcement' },
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
                        decodedData={decodedData}
                        background={background}
                        handleDtopen={handleTaskModalOpen}
                        taskFinalData={taskFinalData}
                        taskAssigneeData={taskAssigneeData}
                        Loading={Loading}
                        refferenceData={refferenceData}
                    />
                }
            </Suspense>

            <Suspense fallback={<></>}>
                <TaskDetail
                    open={taskDetailModalOpen}
                    onClose={handleTaskModalClose}
                    taskData={selectedData}
                />
            </Suspense>
        </Box>
    );
};

export default ProjectDashboard;

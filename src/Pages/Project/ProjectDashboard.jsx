import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Box, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { getRandomAvatarColor, mapKeyValuePair, transformAttachments } from '../../Utils/globalfun';
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
    const [isAttLoding, setIsAttLoding] = useState(null);
    const selectedData = useRecoilValue(selectedRowData);
    const [decodedData, setDecodedData] = useState(null);
    const { iswhLoading, taskFinalData, taskAssigneeData } = useFullTaskFormatFile();
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
    const [refferenceData, setReferenceData] = useState([]);

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    useEffect(() => {
        setIsAttLoding(true);
        const assigneeMaster = JSON.parse(sessionStorage.getItem('taskAssigneeData')) || [];
        const getAttachment = async () => {
            try {
                const res = await getAttachmentApi(decodedData);
                if (res) {
                    const labeledTasks = mapKeyValuePair(res);
                    const updatedLabeledTasks = labeledTasks?.map(task => {
                        const matchedAssignee = assigneeMaster?.find(
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
                setTimeout(() => {
                    setIsAttLoding(false);
                }, 10);
            }
        };

        if (selectedData && decodedData) {
            getAttachment();
        }
    }, [selectedData, decodedData]);


    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const encodedData = searchParams.get('data');

        if (encodedData) {
            try {
                const decodedString = atob(encodedData);
                const parsedData = JSON.parse(decodedString);
                setDecodedData(parsedData);
            } catch (error) {
                console.error('Error decoding or parsing search data:', error);
            }
        }
    }, [location]);

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
        { label: 'Master Bind', content: 'MasterBind' },
        { label: 'Comments', content: 'Comments' },
    ];
    const [tabs, setTabs] = useState(tabData);
    const [selectedTab, setSelectedTab] = useState(tabs[0]?.label || '');

    useEffect(() => {
        if (!taskFinalData || Object.keys(taskFinalData).length === 0) return;

        const projectTasks = taskFinalData?.ProjectCategoryTasks?.[decodedData?.projectid];
        if (projectTasks) {
            const categories = Object.keys(projectTasks);
            const dynamicTabs = categories.map((category) => {
                const label = category
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                return {
                    label,
                    content: category,
                };
            });

            setTabs((prevTabs) => {
                return [...prevTabs, ...dynamicTabs];
            });
        }
    }, [taskFinalData]);

    const handleChange = (event, newValue) => {
        if (newValue !== null) {
            setSelectedTab(newValue);
        }
    };

    return (
        <Box
            sx={{
                boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px",
                padding: "10px 20px 30px 20px",
                borderRadius: "8px",
            }}
        >
            <Suspense fallback={<></>}>
                <DasboardTab
                    tabData={tabs}
                    selectedTab={selectedTab}
                    decodedData={decodedData}
                    handleChange={handleChange}
                />
            </Suspense>

            <Suspense fallback={<></>}>
                {iswhLoading ? (
                    <LoadingBackdrop isLoading={iswhLoading ? 'true' : 'false'} />
                ) :
                    <DashboardContent
                        tabData={tabs}
                        selectedTab={selectedTab}
                        decodedData={decodedData}
                        background={background}
                        handleDtopen={handleTaskModalOpen}
                        taskFinalData={taskFinalData}
                        taskAssigneeData={taskAssigneeData}
                        isAttLoding={isAttLoding}
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

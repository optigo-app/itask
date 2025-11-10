import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LoadingBackdrop from '../../Utils/Common/LoadingBackdrop';
import { getRandomAvatarColor, mapKeyValuePair } from '../../Utils/globalfun';
import { useRecoilValue } from 'recoil';
import { selectedRowData } from '../../Recoil/atom';
import useFullTaskFormatFile from '../../Utils/TaskList/FullTasKFromatfile';
import { getAttachmentApi } from '../../Api/UploadApi/GetAttachmentApi';
import { taskCommentGetApi } from '../../Api/TaskApi/TaskCommentGetApi';

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
    const [comments, setComments] = useState([]);
    const [commentCount, setCommentCount] = useState(0);
    const [isCommentLoading, setIsCommentLoading] = useState(false);

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

    const handleFetchComment = async () => {
        setIsCommentLoading(true);
        const selectedRow = decodedData;
        try {
            const assigneesMaster = JSON?.parse(sessionStorage.getItem('taskAssigneeData'));
            const apiRes = await taskCommentGetApi(selectedRow);
            
            if (apiRes?.rd?.length > 0) {
                const commentsWithAttachments = apiRes?.rd?.map(comment => {
                    let attachments = [];
                    if (comment?.DocumentName && comment.DocumentName.trim() !== '') {
                        const documentUrls = comment.DocumentName.split(',').map(url => url.trim()).filter(url => url);
                        attachments = documentUrls.map((url, index) => {
                            const urlParts = url.split('/');
                            const filename = urlParts[urlParts.length - 1] || `attachment_${index + 1}`;
                            
                            return {
                                url: url,
                                filename: filename
                            };
                        });
                    }
                    
                    return {
                        ...comment,
                        user: assigneesMaster?.find(assignee => assignee?.userid == comment?.appuserid) ?? [],
                        attachments: attachments
                    };
                })
                .sort((a, b) => new Date(b.entrydate) - new Date(a.entrydate));
                
                setComments(commentsWithAttachments);
                setCommentCount(commentsWithAttachments.length);
            } else {
                setComments([]);
                setCommentCount(0);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setIsCommentLoading(false);
        }
    };

    useEffect(() => {
        if (decodedData?.taskid) {
            handleFetchComment();
        }
    }, [decodedData]);

    const handleTaskModalOpen = () => {
        setTaskDetailModalOpen(true);
    };

    const handleTaskModalClose = () => {
        setTaskDetailModalOpen(false);
    };

    const tabData = [
        { label: 'Reference', content: 'ReferencePr', count: 0 },
        { label: 'Milestone', content: 'MilestoneTimeline', count: 0 },
        { label: 'Team Member', content: 'TeamMember', count: 0 },
        { label: 'Master Bind', content: 'MasterBind', count: 0 },
        { label: 'Comments', content: 'Comments', count: commentCount },
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
                const updatedTabs = prevTabs.map(tab =>
                    tab.label === 'Comments' ? { ...tab, count: commentCount } : tab
                );
                return [...updatedTabs, ...dynamicTabs];
            });
        }
    }, [taskFinalData, commentCount]);

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
                        isCommentLoading={isCommentLoading}
                        comments={comments}
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

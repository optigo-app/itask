import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
    Box, Card, CardContent, Typography, TextField,
    InputAdornment,
    Tooltip,
    styled,
    IconButton,
} from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import { useRecoilValue } from "recoil";
import Fuse from "fuse.js";
import dayjs from "dayjs";
import { Calendar, ListTodo, Flag, User } from "lucide-react";

import './TasklistForCal.scss';
import { TaskData, actualTaskData, calendarData } from "../../Recoil/atom";
import { cleanDate, commonTextFieldProps, flattenTasks, formatDate2, formatDueTask, getUserProfileData, priorityColors, statusColors } from "../../Utils/globalfun";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";
import { CircleCheck, Info } from "lucide-react";
import CustomDateRangePicker from "../ShortcutsComponent/DateRangePicker";
import CustomAutocomplete from "../ShortcutsComponent/CustomAutocomplete";

const getAssigneeIdArray = (assigneids) => {
    if (!assigneids) return [];
    return assigneids
        .toString()
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
};

const buildTaskKeyValueMap = (taskList = []) => {
    const taskById = new Map();
    taskList.forEach((task) => {
        const idNum = Number(task?.taskid);
        if (!Number.isNaN(idNum)) {
            taskById.set(idNum, task);
        }
        if (task?.taskid !== undefined && task?.taskid !== null) {
            taskById.set(String(task.taskid), task);
        }
    });
    return { taskById };
};

const prepareCalendarTaskList = ({
    treeTaskData = [],
    fallbackTaskData = [],
    isAdmin = false,
    userId,
}) => {
    const flattenedTreeTasks = Array.isArray(treeTaskData) && treeTaskData.length > 0
        ? flattenTasks(treeTaskData)
        : [];

    const sourceTasks = flattenedTreeTasks.length > 0 ? flattenedTreeTasks : (fallbackTaskData || []);
    const { taskById } = buildTaskKeyValueMap(sourceTasks);
    const parentWithChildren = new Set();

    sourceTasks.forEach((task) => {
        const parentId = Number(task?.parentid);
        if (!Number.isNaN(parentId) && parentId !== 0) {
            parentWithChildren.add(parentId);
            parentWithChildren.add(String(parentId));
        }
    });

    return sourceTasks
        .map((task) => {
            const parentTask = taskById.get(Number(task?.parentid)) || taskById.get(String(task?.parentid));
            const hasChildren = parentWithChildren.has(Number(task?.taskid)) || parentWithChildren.has(String(task?.taskid));
            const inferredType = Number(task?.parentid) === 0 ? 'module' : (hasChildren ? 'major' : 'minor');
            const inferredModuleId = task?.moduleid || parentTask?.moduleid || (Number(task?.parentid) === 0 ? task?.taskid : parentTask?.taskid || task?.projectid);

            return {
                ...task,
                moduleid: inferredModuleId,
                moduleName: task?.moduleName || parentTask?.moduleName || parentTask?.taskname || task?.taskPr || '-',
                type: task?.type || inferredType,
            };
        })
        .filter((task) => {
            if (isAdmin) return true;
            const assigneeIdsArray = getAssigneeIdArray(task?.assigneids);
            return assigneeIdsArray.includes(String(userId));
        });
};

// Memoized TaskCard component for better performance
const TaskCard = memo(({ child, colorClass, isScheduled, calendarsColor }) => {
    return (
        <Card
            key={child.taskid}
            className={`draggable-task bg-${colorClass} text-default ${isScheduled ? 'scheduled-task' : ''}`}
            data-id={child.taskid}
            sx={{
                cursor: "grab",
                mb: 1,
                ml: 2,
                borderRadius: 1,
                boxShadow: isScheduled
                    ? "0px 2px 8px rgba(115, 103, 240, 0.3)"
                    : "0px 1px 3px rgba(0,0,0,0.1)",
                border: isScheduled
                    ? "2px solid #7367f0"
                    : "1px solid transparent",
                position: "relative",
                opacity: isScheduled ? 0.8 : 1
            }}
        >
            <CardContent
                className={`bg-${colorClass} text-${colorClass}`}
                sx={{ p: '8px !important', m: 0 }}
            >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.2}>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ flex: 1 }}
                    >
                        {child.taskno}{" "}{child.taskname}
                    </Typography>
                    {isScheduled && (
                        <Tooltip title="Task is scheduled in calendar">
                            <Box
                                sx={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: '#7367f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ml: 1
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✓
                                </Typography>
                            </Box>
                        </Tooltip>
                    )}
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    {child?.StartDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                            Start: {child?.StartDate && cleanDate(child?.StartDate)
                                ? formatDate2(cleanDate(child?.StartDate))
                                : '-'}
                        </Typography>
                    )}
                    {child?.DeadLineDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                            Due: {child?.DeadLineDate && formatDate2(cleanDate(child?.DeadLineDate))
                                ? formatDueTask(child?.DeadLineDate)
                                : '-'}
                        </Typography>
                    )}
                </Box>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                        <Box
                            component="span"
                            sx={{
                                fontSize: '12px',
                                px: 0.2,
                                py: 0.4,
                                borderRadius: '4px',
                                bgcolor: '#f0f0f0',
                                color: 'text.secondary',
                                fontWeight: 500,
                                minWidth: 40,
                                textAlign: 'center'
                            }}
                        >
                            Est: {child.estimate_hrs || '-'}
                        </Box>

                        {child?.priority && (
                            <PriorityBadge
                                task={child}
                                priorityColors={priorityColors}
                                disable
                                fontSize={10}
                                padding={2}
                                minWidth={40}
                            />
                        )}

                        {child?.status && (
                            <StatusBadge
                                task={child}
                                statusColors={statusColors}
                                disable
                                fontSize={10}
                                padding={2}
                                minWidth={40}
                            />
                        )}
                    </Box>

                    {(child?.moduleName || child?.roottaskname || child?.Parenttaskname) && (
                        <Tooltip title={
                            <>
                                {child.roottaskname && <span>{child.roottaskname}</span>}
                                {child.Parenttaskname && child.roottaskname && <span> / </span>}
                                {child.Parenttaskname && <span>{child.Parenttaskname}</span>}
                                {(child.roottaskname || child.Parenttaskname) && child.moduleName && <span> / </span>}
                                {child.moduleName && <span>{child.moduleName}</span>}
                            </>
                        }
                            arrow>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: "11px",
                                    maxWidth: 120,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'default'
                                }}
                            >
                                {child.moduleName}
                            </Typography>
                        </Tooltip>
                    )}
                </Box>

            </CardContent>
        </Card>
    );
});

TaskCard.displayName = 'TaskCard';

const TasklistForCal = ({ calendarsColor, onDateRangeChange, onAssigneeChange }) => {
    const task = useRecoilValue(TaskData);
    const actualTaskDataValue = useRecoilValue(actualTaskData);
    const calEvData = useRecoilValue(calendarData);
    const [calTasksList, setCalTasksList] = useState([]);
    const draggableRef = React.useRef(null);
    const [showDraggedTasks, setShowDraggedTasks] = useState(false);
    const [showTodayOnly, setShowTodayOnly] = useState(false);
    const [isCalendarDataLoaded, setIsCalendarDataLoaded] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [showStatusFilter, setShowStatusFilter] = useState(false);
    const [showPriorityFilter, setShowPriorityFilter] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });
    const [selectedStatusId, setSelectedStatusId] = useState(null);
    const [selectedPriorityId, setSelectedPriorityId] = useState(null);
    const [selectedAssigneeId, setSelectedAssigneeId] = useState(null);
    const [statusData, setStatusData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [assigneeData, setAssigneeData] = useState([]);

    const [searchQuery, setSearchQuery] = useState(`start:${formatDate2(new Date())}`);
    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    const handleDateRangeChange = useCallback((newDateRange) => {
        setDateRange(newDateRange);
        if (onDateRangeChange) {
            onDateRangeChange(newDateRange);
        }
    }, [onDateRangeChange]);

    const handleAssigneeChange = useCallback((assigneeId) => {
        setSelectedAssigneeId(assigneeId);
        if (onAssigneeChange) {
            onAssigneeChange(assigneeId);
        }
    }, [onAssigneeChange]);

    const scheduledTaskIds = useMemo(() => {
        if (!calEvData?.length) return new Set();
        return new Set(calEvData.map(meeting => meeting.taskid).filter(Boolean));
    }, [calEvData]);

    useEffect(() => {
        setIsCalendarDataLoaded(calEvData !== undefined);
    }, [calEvData]);

    useEffect(() => {
        try {
            const statusDataFromStorage = JSON.parse(sessionStorage.getItem('taskstatusData') || '[]');
            setStatusData(statusDataFromStorage);
        } catch (error) {
            console.error('Error fetching status data:', error);
            setStatusData([]);
        }
    }, []);

    useEffect(() => {
        try {
            const priorityDataFromStorage = JSON.parse(sessionStorage.getItem('taskpriorityData') || '[]');
            setPriorityData(priorityDataFromStorage);
        } catch (error) {
            console.error('Error fetching priority data:', error);
            setPriorityData([]);
        }
    }, []);

    useEffect(() => {
        try {
            const assigneeDataFromStorage = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
            setAssigneeData(assigneeDataFromStorage);
        } catch (error) {
            console.error('Error fetching assignee data:', error);
            setAssigneeData([]);
        }
    }, []);

    const isTaskScheduled = useCallback((taskId) => {
        return scheduledTaskIds.has(taskId);
    }, [scheduledTaskIds]);

    useEffect(() => {
        const userProfileData = getUserProfileData();
        if (userProfileData?.id && (task?.length > 0 || actualTaskDataValue?.length > 0)) {
            const isAdmin = userProfileData.designation?.toLowerCase() === 'admin';
            const preparedTasks = prepareCalendarTaskList({
                treeTaskData: task || [],
                fallbackTaskData: actualTaskDataValue || [],
                isAdmin,
                userId: userProfileData.id,
            });

            let nonRootTasks = preparedTasks.filter(task => task.parentid !== 0);
            // Filter to hide milestone tasks
            nonRootTasks = nonRootTasks.filter(task => task.ismilestone !== 1);

            // Prefer only minor tasks, but fallback to non-root tasks if minor list is empty
            const minorTasks = nonRootTasks.filter(task => {
                const taskType = (task.type || '').toLowerCase();
                return taskType === 'minor';
            });

            setCalTasksList(minorTasks.length > 0 ? minorTasks : nonRootTasks);
        } else {
            setCalTasksList([]);
        }
    }, [task, actualTaskDataValue]);

    useEffect(() => {
        const container = document.getElementById("external-tasks");
        
        if (container) {
            if (draggableRef.current) {
                draggableRef.current.destroy();
                draggableRef.current = null;
            }

            draggableRef.current = new Draggable(container, {
                itemSelector: ".draggable-task",
                eventData: (eventEl) => {
                    const dragtaskTaskId = eventEl.getAttribute("data-id");
                    const dragtask = calTasksList.find(t => t.taskid == dragtaskTaskId);

                    if (dragtask) {
                        const start = dragtask?.StartDate;
                        const end = dragtask?.DeadLineDate ?? start;
                        const estimate = dragtask?.estimate_hrs ?? 1;
                        const guests = dragtask?.assignee ?? [];

                        return {
                            id: dragtask?.taskid?.toString(),
                            title: dragtask?.taskname ?? "",
                            start,
                            end,
                            taskid: dragtask?.taskid,
                            parentid: dragtask?.parentid,
                            projectid: dragtask?.projectid ?? 0,
                            allDay: dragtask?.allDay ? 1 : 0,
                            category: dragtask?.category ?? "",
                            description: dragtask?.descr ?? "",
                            guests: guests,
                            assigneids: guests.map(u => u.id)?.join(","),
                            createdbyid: dragtask?.createdbyid ?? "",
                            estimate: estimate,
                            estimate_hrs: dragtask?.estimate_hrs ?? 0,
                            estimate1_hrs: dragtask?.estimate1_hrs ?? 0,
                            estimate2_hrs: dragtask?.estimate2_hrs ?? 0,
                            priorityid: dragtask?.priorityid ?? 0,
                            priority: dragtask?.priority ?? "",
                            statusid: dragtask?.statusid ?? 0,
                            status: dragtask?.status ?? "",
                            DeadLineDate: dragtask?.DeadLineDate,
                            ismilestone: dragtask?.ismilestone ?? 0,
                            workcategoryid: dragtask?.workcategoryid ?? 0,
                            RootTaskId: dragtask?.RootTaskId ?? '',
                            extendedProps: {
                                taskid: dragtask?.taskid,
                                parentid: dragtask?.parentid ?? 0,
                                projectid: dragtask?.projectid ?? 0,
                                guests: guests,
                                assigneids: guests.map(u => u.id)?.join(","),
                                estimate: estimate,
                                estimate_hrs: dragtask?.estimate_hrs ?? 0,
                                estimate1_hrs: dragtask?.estimate1_hrs ?? 0,
                                estimate2_hrs: dragtask?.estimate2_hrs ?? 0,
                                workinghr: dragtask?.workinghr ?? 0,
                                description: dragtask?.descr ?? "",
                                category: dragtask?.category ?? "",
                                priorityid: dragtask?.priorityid ?? 0,
                                priority: dragtask?.priority ?? "",
                                statusid: dragtask?.statusid ?? 0,
                                status: dragtask?.status ?? "",
                                workcategoryid: dragtask?.workcategoryid ?? 0,
                                DeadLineDate: dragtask?.DeadLineDate,
                                ismilestone: dragtask?.ismilestone ?? 0,
                                RootTaskId: dragtask?.RootTaskId ?? '',
                                prModule: {
                                    taskid: dragtask?.taskid ?? 0,
                                    projectid: dragtask?.projectid ?? 0,
                                    taskname: dragtask?.taskname ?? "",
                                    projectname: dragtask?.taskPr ?? "",
                                    taskPr: dragtask?.taskPr ?? ""
                                }
                            }
                        };
                    }

                    return {};
                }
            });
        }

        return () => {
            if (draggableRef.current) {
                draggableRef.current.destroy();
                draggableRef.current = null;
            }
        };
    }, [calTasksList]);

    const filteredTasksList = useMemo(() => {
        const tasks = calTasksList;
        if (!isCalendarDataLoaded) return [];
        let filtered = tasks;
        if (selectedStatusId) {
            filtered = filtered.filter(task => String(task.statusid) === String(selectedStatusId));
        }
        if (selectedPriorityId) {
            filtered = filtered.filter(task => String(task.priorityid) === String(selectedPriorityId));
        }
        if (showDraggedTasks) {
            filtered = filtered.filter(t => isTaskScheduled(t.taskid));
        } else {
            filtered = filtered.filter(t => !isTaskScheduled(t.taskid));
        }
        if (showTodayOnly && !searchQuery.trim()) {
            const today = new Date();
            const todayStr = today.toDateString();
            filtered = filtered.filter(task => {
                const taskDate = task.StartDate ? new Date(task.StartDate).toDateString() : null;
                return taskDate === todayStr;
            });
        }
        return filtered;
    }, [calTasksList, isTaskScheduled, showDraggedTasks, showTodayOnly, searchQuery, isCalendarDataLoaded, selectedStatusId, selectedPriorityId]);

    const fuseInstance = useMemo(() => {
        if (!filteredTasksList.length) return null;
        return new Fuse(filteredTasksList, {
            keys: [
                { name: 'taskname', weight: 0.7 },
                { name: 'taskid', weight: 0.3 },
                { name: 'descr', weight: 0.2 },
                { name: 'priority', weight: 0.1 },
                { name: 'status', weight: 0.1 },
                { name: "taskno", weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            ignoreLocation: true,
            findAllMatches: true,
        });
    }, [filteredTasksList]);

    const formatTaskDate = useCallback((dateStr) => {
        if (!dateStr) return null;
        const cleanedDate = cleanDate(dateStr);
        if (!cleanedDate) return null;

        const date = new Date(cleanedDate);
        return {
            formatted: formatDate2(cleanedDate).toLowerCase(),
            monthShort: date.toLocaleString('default', { month: 'short' }).toLowerCase(),
            monthFull: date.toLocaleString('default', { month: 'long' }).toLowerCase(),
            day: date.getDate().toString(),
            year: date.getFullYear().toString()
        };
    }, []);

    const matchesDateQuery = useCallback((dateInfo, query) => {
        if (!dateInfo) return false;
        const queryParts = query.toLowerCase().split(/\s+/).filter(Boolean);
        return queryParts.every(part =>
            dateInfo.formatted.includes(part) ||
            dateInfo.monthShort.includes(part) ||
            dateInfo.monthFull.includes(part) ||
            dateInfo.day.includes(part) ||
            dateInfo.year.includes(part)
        );
    }, []);

    const performSearch = useCallback((query, tasks) => {
        if (!query.trim()) return tasks;
        if (!tasks.length) return tasks; // Early return for empty tasks
        const lowerQuery = query.toLowerCase().trim();
        if (lowerQuery.startsWith("'") && lowerQuery.endsWith("'")) {
            const exactQuery = lowerQuery.slice(1, -1);
            return tasks.filter(task =>
                task.taskname?.toLowerCase() === exactQuery
            );
        }
        if (lowerQuery.startsWith('"') && lowerQuery.endsWith('"')) {
            const relatedQuery = lowerQuery.slice(1, -1);
            return tasks.filter(task =>
                task.taskname?.toLowerCase().includes(relatedQuery) ||
                task.descr?.toLowerCase().includes(relatedQuery)
            );
        }
        if (lowerQuery.startsWith('start:')) {
            const dateQuery = lowerQuery.replace('start:', '').trim();
            return tasks.filter(task => {
                const dateInfo = formatTaskDate(task.StartDate);
                return matchesDateQuery(dateInfo, dateQuery);
            });
        }

        if (lowerQuery.startsWith('due:')) {
            const dateQuery = lowerQuery.replace('due:', '').trim();
            return tasks.filter(task => {
                const dateInfo = formatTaskDate(task.DeadLineDate);
                return matchesDateQuery(dateInfo, dateQuery);
            });
        }

        // Check for status-specific searches
        if (lowerQuery.startsWith('status:')) {
            const statusQuery = lowerQuery.replace('status:', '').trim();
            return tasks.filter(task =>
                task.status?.toLowerCase().includes(statusQuery)
            );
        }

        // Check for priority-specific searches
        if (lowerQuery.startsWith('priority:')) {
            const priorityQuery = lowerQuery.replace('priority:', '').trim();
            return tasks.filter(task =>
                task.priority?.toLowerCase().includes(priorityQuery)
            );
        }

        // Regular search using Fuse.js
        if (!fuseInstance) return tasks;
        const searchResults = fuseInstance.search(query);
        return searchResults.map(result => result.item);
    }, [fuseInstance, formatTaskDate, matchesDateQuery]);

    const getFilteredHierarchy = useCallback(() => {
        const tasksToProcess = performSearch(searchQuery, filteredTasksList);
        if (!tasksToProcess.length) return [];
        const moduleMap = new Map();
        const subtaskIds = new Set();
        for (const task of tasksToProcess) {
            const modId = task.moduleid;
            if (!moduleMap.has(modId)) {
                moduleMap.set(modId, { ...task, subtasks: [] });
            }
        }
        for (const task of tasksToProcess) {
            const modId = task.moduleid;
            if (task.parentid !== 0 && !subtaskIds.has(task.taskid)) {
                const module = moduleMap.get(modId);
                if (module) {
                    module.subtasks.push(task);
                    subtaskIds.add(task.taskid);
                }
            }
        }

        // Convert Map to array and filter
        return Array.from(moduleMap.values()).filter(module => module.subtasks.length > 0);
    }, [filteredTasksList, searchQuery, performSearch]);

    const groupedTasks = getFilteredHierarchy();

    if (task === undefined) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100px"
                role="status"
                aria-live="polite"
            >
                <Typography variant="body2" color="text.secondary">
                    Loading tasks...
                </Typography>
            </Box>
        );
    }

    const CustomTooltip = styled(({ className, ...props }) => (
        <Tooltip {...props} classes={{ popper: className }} />
    ))(({ theme }) => ({
        [`& .MuiTooltip-tooltip`]: {
            backgroundColor: "#fff",
            color: "#333",
            fontSize: "0.7rem",
            padding: "8px 12px",
            borderRadius: "6px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
            maxWidth: 280,
            whiteSpace: "pre-line",   // allows line breaks
        },
    }));

    return (
        <>
            <Box sx={{ px: 1.25, my: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: '#5e5873',
                            fontSize: '16px'
                        }}
                    >
                        Task List
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip
                            arrow
                            placement="top"
                            title={showDateFilter ? "Hide date filter" : "Show date filter"}
                        >
                            <IconButton
                                onClick={() => setShowDateFilter(!showDateFilter)}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: '4px',
                                    backgroundColor:
                                        showDateFilter ? "#7367f0" : "white",
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                    "&:hover": {
                                        backgroundColor: "#7367f0",
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                    },
                                }}
                            >
                                <Calendar
                                    size={18}
                                    color={showDateFilter ? "#fff" : "#0000008a"}
                                />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            arrow
                            placement="top"
                            title={showStatusFilter ? "Hide status filter" : "Show status filter"}
                        >
                            <IconButton
                                onClick={() => setShowStatusFilter(!showStatusFilter)}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: '4px',
                                    backgroundColor:
                                        showStatusFilter ? "#7367f0" : "white",
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                    "&:hover": {
                                        backgroundColor: "#7367f0",
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                    },
                                }}
                            >
                                <ListTodo
                                    size={18}
                                    color={showStatusFilter ? "#fff" : "#0000008a"}
                                />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            arrow
                            placement="top"
                            title={showPriorityFilter ? "Hide priority filter" : "Show priority filter"}
                        >
                            <IconButton
                                onClick={() => setShowPriorityFilter(!showPriorityFilter)}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: '4px',
                                    backgroundColor:
                                        showPriorityFilter ? "#7367f0" : "white",
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                    "&:hover": {
                                        backgroundColor: "#7367f0",
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                    },
                                }}
                            >
                                <Flag
                                    size={18}
                                    color={showPriorityFilter ? "#fff" : "#0000008a"}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        p: 1.5,
                        backgroundColor: '#f8f8f8',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                    }}
                >
                    {showDateFilter && (
                        <>
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        mb: 0.5,
                                        color: '#6d6b77',
                                        display: 'block'
                                    }}
                                >
                                    Date Range
                                </Typography>
                                <CustomDateRangePicker
                                    value={dateRange}
                                    onChange={handleDateRangeChange}
                                />
                            </Box>
                            <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 0.5 }} />
                        </>
                    )}
                    {showStatusFilter && (
                        <>
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        mb: 0.5,
                                        color: '#6d6b77',
                                        display: 'block'
                                    }}
                                >
                                    Status
                                </Typography>
                                <CustomAutocomplete
                                    name="status"
                                    label=""
                                    value={selectedStatusId}
                                    options={statusData}
                                    placeholder="Select status"
                                    onChange={(e) => setSelectedStatusId(e.target.value)}
                                    width="100%"
                                />
                            </Box>
                            <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 0.5 }} />
                        </>
                    )}
                    {showPriorityFilter && (
                        <>
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 500,
                                        mb: 0.5,
                                        color: '#6d6b77',
                                        display: 'block'
                                    }}
                                >
                                    Priority
                                </Typography>
                                <CustomAutocomplete
                                    name="priority"
                                    label=""
                                    value={selectedPriorityId}
                                    options={priorityData}
                                    placeholder="Select priority"
                                    onChange={(e) => setSelectedPriorityId(e.target.value)}
                                    width="100%"
                                />
                            </Box>
                            <Box sx={{ borderBottom: '1px solid #e0e0e0', my: 0.5 }} />
                        </>
                    )}
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 500,
                                mb: 0.5,
                                color: '#6d6b77',
                                display: 'block'
                            }}
                        >
                            Search
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                {...commonTextFieldProps}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <CustomTooltip
                                                title={`Enhanced Search Guide:\n
• Normal text: type keywords (e.g., task name, description)\n
• Exact match: use single quotes 'Task Name' (exact task name)\n
• Related search: use double quotes "keyword" (name + description)\n
• Start date: "start:jan", "start:2024", "start:15" (day/month/year)\n
• Due date: "due:feb", "due:2024", "due:28" (day/month/year)\n
• Fuzzy search: type partial text for flexible matching\n
• Toggle: use "Show dragged tasks" to include already scheduled tasks in this list`}
                                                placement="left"
                                            >
                                                <IconButton edge="end">
                                                    <Info fontSize="small" />
                                                </IconButton>
                                            </CustomTooltip>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <Tooltip
                                arrow
                                placement="top"
                                title={showDraggedTasks
                                    ? "Showing scheduled tasks (click to show unscheduled)"
                                    : "Showing unscheduled tasks (click to show scheduled)"}
                            >
                                <IconButton
                                    aria-label="Completed tasks"
                                    onClick={() => setShowDraggedTasks(!showDraggedTasks)}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        padding: '4px',
                                        backgroundColor:
                                            showDraggedTasks ? "#7367f0" : "white",
                                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                        "&:hover": {
                                            backgroundColor: "#7367f0",
                                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                        },
                                    }}
                                >
                                    <CircleCheck className="iconbtn"
                                        color={
                                            showDraggedTasks ? "#fff" : "#0000008a"
                                        } />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>
            </Box>
            <Box id="external-tasks" sx={{ padding: 1.25, maxHeight: '88vh', overflow: 'auto' }}>
                {groupedTasks?.map(parent => (
                    <Box key={parent.taskid} sx={{ mb: 2 }}>
                        <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="text.primary"
                            sx={{ ml: 1, mb: 0.5, textTransform: 'capitalize' }}
                        >
                            {parent.moduleName}
                        </Typography>

                        {parent?.subtasks?.map(child => {
                            const colorClass = calendarsColor[child.category] || "default";
                            const isScheduled = isTaskScheduled(child.taskid);
                            return (
                                <TaskCard
                                    key={child.taskid}
                                    child={child}
                                    colorClass={colorClass}
                                    isScheduled={isScheduled}
                                    // isScheduled=''
                                    calendarsColor={calendarsColor}
                                />
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </>
    );
};

export default memo(TasklistForCal);

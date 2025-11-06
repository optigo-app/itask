import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
    Box, Card, CardContent, Typography, TextField,
    InputAdornment,
    Tooltip,
    styled,
    IconButton
} from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import { useRecoilValue } from "recoil";
import Fuse from "fuse.js";

import './TasklistForCal.scss';
import { TaskData, calendarData } from "../../Recoil/atom";
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate2, formatDueTask, getUserProfileData, priorityColors, statusColors } from "../../Utils/globalfun";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";
import { Info } from "lucide-react";

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
                        {child.taskname}
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
                            disable={true}
                            fontSize={10}
                            padding={2}
                            minWidth={40}
                        />
                    )}
                    {child?.status && (
                        <StatusBadge
                            task={child}
                            statusColors={statusColors}
                            disable={true}
                            fontSize={10}
                            padding={2}
                            minWidth={40}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
});

TaskCard.displayName = 'TaskCard';

const TasklistForCal = ({ calendarsColor }) => {
    const task = useRecoilValue(TaskData);
    const calEvData = useRecoilValue(calendarData);
    const [calTasksList, setCalTasksList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Debounced search handler for better performance
    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
    }, []);

    // Memoized set of scheduled task IDs for O(1) lookup
    const scheduledTaskIds = useMemo(() => {
        if (!calEvData?.length) return new Set();
        return new Set(calEvData.map(meeting => meeting.taskid).filter(Boolean));
    }, [calEvData]);

    // Optimized function to check if a task is scheduled
    const isTaskScheduled = useCallback((taskId) => {
        return scheduledTaskIds.has(taskId);
    }, [scheduledTaskIds]);

    useEffect(() => {
        const userProfileData = getUserProfileData();
        if (userProfileData?.id && task?.length > 0) {
            const myNestedTasks = filterNestedTasksByView(task, 'me', userProfileData.id);
            const flatMyTasks = flattenTasks(myNestedTasks);
            setCalTasksList(flatMyTasks);
        }
    }, [task]);

    // Drag only children (parentid !== 0)
    useEffect(() => {
        debugger
        const container = document.getElementById("external-tasks");
        if (container) {
            new Draggable(container, {
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
    }, [calTasksList]);


    // Memoized filtered tasks list (excluding completed)
    const filteredTasksList = useMemo(() => {
        return (calTasksList || []).filter(
            task => task.status?.toLowerCase() !== "completed"
        );
    }, [calTasksList]);

    // Memoized Fuse instance for search
    const fuseInstance = useMemo(() => {
        if (!filteredTasksList.length) return null;
        
        return new Fuse(filteredTasksList, {
            keys: [
                { name: 'taskname', weight: 0.7 },
                { name: 'taskid', weight: 0.3 },
                { name: 'descr', weight: 0.2 },
                { name: 'priority', weight: 0.1 },
                { name: 'status', weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            ignoreLocation: true,
            findAllMatches: true,
        });
    }, [filteredTasksList]);

    // Memoized date formatters for better performance
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

    // Optimized date matching function
    const matchesDateQuery = useCallback((dateInfo, query) => {
        if (!dateInfo) return false;
        return dateInfo.formatted.includes(query) ||
               dateInfo.monthShort.includes(query) ||
               dateInfo.monthFull.includes(query) ||
               dateInfo.day.includes(query) ||
               dateInfo.year.includes(query);
    }, []);

    // Enhanced search function with date filtering
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
        
        // Optimized date-specific searches
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

    // Optimized search and hierarchy function
    const getFilteredHierarchy = useCallback(() => {
        // Apply enhanced search
        const tasksToProcess = performSearch(searchQuery, filteredTasksList);
        
        // Early return if no tasks
        if (!tasksToProcess.length) return [];

        // Build module hierarchy with optimized lookups
        const moduleMap = new Map();
        const subtaskIds = new Set();
        
        // First pass: create modules
        for (const task of tasksToProcess) {
            const modId = task.moduleid;
            if (!moduleMap.has(modId)) {
                moduleMap.set(modId, { ...task, subtasks: [] });
            }
        }

        // Second pass: add subtasks with duplicate check
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
• Fuzzy search: type partial text for flexible matching`}
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
                            {parent.taskname}
                        </Typography>

                        {parent?.subtasks?.map(child => {
                            const colorClass = calendarsColor[child.category] || "default";
                            const isScheduled = isTaskScheduled(child.taskid);
                            return (
                                <TaskCard
                                    key={child.taskid}
                                    child={child}
                                    colorClass={colorClass}
                                    // isScheduled={isScheduled}
                                    isScheduled=''
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

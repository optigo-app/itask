import React, { useState, useEffect } from "react";
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
import { TaskData } from "../../Recoil/atom";
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate2, formatDueTask, priorityColors, statusColors } from "../../Utils/globalfun";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";
import { Info } from "lucide-react";

const TasklistForCal = ({ calendarsColor }) => {
    const task = useRecoilValue(TaskData);
    const [calTasksList, setCalTasksList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const userProfileData = JSON?.parse(localStorage?.getItem("UserProfileData"));
        if (userProfileData?.id && task?.length > 0) {
            const myNestedTasks = filterNestedTasksByView(task, 'me', userProfileData.id);
            const flatMyTasks = flattenTasks(myNestedTasks);
            setCalTasksList(flatMyTasks);
        }
    }, [task]);

    // Drag only children (parentid !== 0)
    useEffect(() => {
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


    // Enhanced search with both exact and fuzzy matching
    const getFilteredHierarchy = () => {
        const filteredList = (calTasksList || []).filter(
            task => task.status?.toLowerCase() !== "completed"
        );

        // Check if search query is wrapped in single quotes for exact search
        const isExactSearch = searchQuery.trim().startsWith("'") && searchQuery.trim().endsWith("'");
        const actualSearchQuery = isExactSearch ? searchQuery.trim().slice(1, -1) : searchQuery.trim();
        
        // Check if search query is purely numeric
        const isNumericSearch = /^\d+$/.test(actualSearchQuery);
        
        // Prepare data for Fuse.js search
        const searchableData = filteredList.map(task => {
            const startDate = cleanDate(task?.StartDate);
            const deadline = cleanDate(task?.DeadLineDate);

            const formatForSearch = (date) => {
                if (!date) return {};
                const d = new Date(date);
                return {
                    day: d.getDate().toString().padStart(2, '0'),
                    month: d.toLocaleString('default', { month: 'short' }),
                    year: d.getFullYear().toString(),
                    full: `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
                };
            };

            const start = formatForSearch(startDate);
            const end = formatForSearch(deadline);

            return {
                ...task,
                searchable_startDate: start.full || '',
                searchable_dueDate: end.full || '',
                searchable_startDay: start.day || '',
                searchable_startMonth: start.month || '',
                searchable_startYear: start.year || '',
                searchable_dueDay: end.day || '',
                searchable_dueMonth: end.month || '',
                searchable_dueYear: end.year || '',
                searchable_priority: task?.priority ?? '',
                searchable_status: task?.status ?? '',
                searchable_estimate: task?.estimate_hrs?.toString() ?? '',
                searchable_estimate1: task?.estimate1_hrs?.toString() ?? '',
                searchable_estimate2: task?.estimate2_hrs?.toString() ?? '',
            };
        });

        let matched;
        
        if (!searchQuery) {
            matched = filteredList.map(item => ({ ...item, searchScore: null }));
        } else if (isExactSearch) {
            // Handle exact search when wrapped in single quotes
            matched = filteredList.filter(task => 
                task.taskname?.toLowerCase() === actualSearchQuery.toLowerCase()
            ).map(task => ({ ...task, searchScore: 0 })); // Perfect score for exact matches
        } else {
            // First, try exact matches for numeric searches
            let exactMatches = [];
            if (isNumericSearch) {
                exactMatches = filteredList.filter(task => 
                    task.taskname?.toString().includes(actualSearchQuery) ||
                    task.taskid?.toString() === actualSearchQuery
                ).map(task => ({ ...task, searchScore: 0 })); // Perfect score for exact matches
            }

            const fuse = new Fuse(searchableData, {
                keys: [
                    "taskname",
                    "status",
                    "priority",
                    "searchable_startDate",
                    "searchable_dueDate",
                    "searchable_startDay",
                    "searchable_startMonth",
                    "searchable_startYear",
                    "searchable_dueDay",
                    "searchable_dueMonth",
                    "searchable_dueYear",
                    "searchable_priority",
                    "searchable_status",
                    "searchable_estimate",
                    "searchable_estimate1",
                    "searchable_estimate2"
                ],
                threshold: isNumericSearch ? 0.1 : 0.4, // Stricter threshold for numeric searches
                includeScore: true,
                ignoreLocation: true, // Don't consider location of match
                findAllMatches: true, // Find all matches, not just the first
            });

            // Get fuzzy matches
            const fuzzyMatches = (fuse?.search(actualSearchQuery) || [])
                .sort((a, b) => (a.score ?? 1) - (b.score ?? 1))
                .map(res => ({ ...res.item, searchScore: res.score }));

            // Combine exact and fuzzy matches, prioritizing exact matches
            const exactMatchIds = new Set(exactMatches.map(t => t.taskid));
            const combinedMatches = [
                ...exactMatches,
                ...fuzzyMatches.filter(match => !exactMatchIds.has(match.taskid))
            ];

            matched = combinedMatches.length > 0 ? combinedMatches : [];
        }

        const matchedIds = new Set(matched.map(t => t.taskid));
        const moduleMap = {};

        // Create search score map for sorting
        const searchScoreMap = {};
        matched.forEach(task => {
            searchScoreMap[task.taskid] = task.searchScore;
        });

        filteredList.forEach(task => {
            const modId = task.moduleid;
            if (!moduleMap[modId]) {
                moduleMap[modId] = {
                    ...task,
                    subtasks: [],
                    searchScore: searchScoreMap[task.taskid] || null
                };
            }
        });

        filteredList.forEach(task => {
            const modId = task.moduleid;
            if (task.parentid !== 0 && !moduleMap[modId].subtasks.find(t => t.taskid === task.taskid)) {
                moduleMap[modId].subtasks.push({ 
                    ...task, 
                    searchScore: searchScoreMap[task.taskid] || null 
                });
            }
        });

        const result = Object.values(moduleMap).filter(module => {
            const moduleMatch = matchedIds.has(module.taskid);
            const filteredSubtasks = module.subtasks.filter(child => matchedIds.has(child.taskid));
            
            if (searchQuery) {
                const allSubtasks = moduleMatch ? module.subtasks : filteredSubtasks;
                const finalSubtasks = allSubtasks.filter(child => matchedIds.has(child.taskid));
                if (finalSubtasks.length > 0) {
                    finalSubtasks.sort((a, b) => {
                        const scoreA = a.searchScore ?? 1;
                        const scoreB = b.searchScore ?? 1;
                        return scoreA - scoreB;
                    });
                }
                module.subtasks = finalSubtasks;
            } else {
                module.subtasks = module.subtasks;
            }
            return moduleMatch || module.subtasks.length > 0;
        });
        
        if (searchQuery) {
            result.sort((a, b) => {
                const getModuleBestScore = (module) => {
                    const scores = [module.searchScore, ...module.subtasks.map(s => s.searchScore)]
                        .filter(score => score !== null && score !== undefined);
                    return scores.length > 0 ? Math.min(...scores) : 1;
                };
                const scoreA = getModuleBestScore(a);
                const scoreB = getModuleBestScore(b);
                return scoreA - scoreB;
            });
        }
        return result;
    };


    const groupedTasks = getFilteredHierarchy();
    console.log('groupedTasks: ', groupedTasks);

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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    {...commonTextFieldProps}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <CustomTooltip
                                    title={`Search Guide:\n
• Normal text: type keywords (e.g., task name, status, priority, dates, estimates)\n
• Exact task name: use single quotes '' (e.g., 'Bug Fix Task')\n
• Related search: use double quotes "" (e.g., "Bug Fix Task")\n
• Numeric search: type numbers (e.g., 1560)\n
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
                            return (
                                <Card
                                    key={child.taskid}
                                    className={`draggable-task bg-${colorClass} text-default`}
                                    data-id={child.taskid}
                                    sx={{
                                        cursor: "grab",
                                        mb: 1,
                                        ml: 2,
                                        borderRadius: 1,
                                        boxShadow: "0px 1px 3px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    <CardContent
                                        className={`bg-${colorClass} text-${colorClass}`}
                                        sx={{ p: '8px !important', m: 0 }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            sx={{ mb: 0.2 }}
                                        >
                                            {child.taskname}
                                        </Typography>
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
                        })}
                    </Box>
                ))}
            </Box>
        </>
    );
};

export default TasklistForCal;

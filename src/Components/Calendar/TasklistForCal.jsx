import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, Typography, TextField
} from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import { useRecoilValue } from "recoil";
import Fuse from "fuse.js";

import './TasklistForCal.scss';
import { TaskData } from "../../Recoil/atom";
import { cleanDate, commonTextFieldProps, filterNestedTasksByView, flattenTasks, formatDate2, priorityColors, statusColors } from "../../Utils/globalfun";
import PriorityBadge from "../ShortcutsComponent/PriorityBadge";
import StatusBadge from "../ShortcutsComponent/StatusBadge";

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
    

    // Fuzzy match using Fuse.js
    const getFilteredHierarchy = () => {
        const fuse = new Fuse(
            (calTasksList || []).map(task => {
                const startDate = cleanDate(task?.StartDate);
                const deadline = cleanDate(task?.DeadLineDate);

                const formatForSearch = (date) => {
                    if (!date) return {};
                    const d = new Date(date);
                    return {
                        day: d.getDate().toString().padStart(2, '0'),         // "11"
                        month: d.toLocaleString('default', { month: 'short' }), // "Jun"
                        year: d.getFullYear().toString(),                     // "2025"
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
                };
            }),
            {
                keys: [
                    "taskname",
                    "descr",
                    "status",
                    "priority",
                    "taskPr",
                    "assignee.firstname",
                    "assignee.lastname",
                    "searchable_startDate",
                    "searchable_dueDate",
                    "searchable_startDay",
                    "searchable_startMonth",
                    "searchable_startYear",
                    "searchable_dueDay",
                    "searchable_dueMonth",
                    "searchable_dueYear",
                    "searchable_priority",
                    "searchable_status"
                ],
                threshold: 0.3,
            }
        );
        const matched = searchQuery
            ? (fuse?.search(searchQuery) || []).map(res => res.item)
            : calTasksList || [];
        const matchedIds = new Set(matched.map(t => t.taskid));
        const moduleMap = {};
        (calTasksList || []).forEach(task => {
            const modId = task.moduleid;
            if (!moduleMap[modId]) {
                moduleMap[modId] = {
                    ...task,
                    subtasks: []
                };
            }
        });
        (calTasksList || []).forEach(task => {
            const modId = task.moduleid;
            if (task.parentid !== 0 && !moduleMap[modId].subtasks.find(t => t.taskid === task.taskid)) {
                moduleMap[modId].subtasks.push({ ...task });
            }
        });
        return Object.values(moduleMap).filter(module => {
            const moduleMatch = matchedIds.has(module.taskid);
            const filteredSubtasks = module.subtasks.filter(child => matchedIds.has(child.taskid));
            module.subtasks = moduleMatch ? module.subtasks : filteredSubtasks;
            return moduleMatch || filteredSubtasks.length > 0;
        });
    };

    const groupedTasks = getFilteredHierarchy();

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
                                    <CardContent className={`bg-${colorClass} text-${colorClass}`} sx={{ p: '10px !important', m: 0 }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {child.taskname}
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                                                Est. {child.estimate_hrs || '-'}
                                            </Typography>
                                            {child?.StartDate &&
                                                <Typography variant="caption" color="text.secondary">
                                                    Start: {child?.StartDate && cleanDate(child?.StartDate)
                                                        ? formatDate2(cleanDate(child?.StartDate))
                                                        : '-'}
                                                </Typography>
                                            }
                                        </Box>

                                        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                {child?.priority && (
                                                    <PriorityBadge task={child} priorityColors={priorityColors} disable={true} fontSize={10} padding={5} minWidth={50} />
                                                )}
                                                {child?.status && (
                                                    <StatusBadge task={child} statusColors={statusColors} disable={true} fontSize={10} padding={5} minWidth={50} />
                                                )}
                                            </Box>
                                            {child?.DeadLineDate &&
                                                <Typography variant="caption" color="text.secondary">
                                                    Due:  {child?.DeadLineDate && cleanDate(child?.DeadLineDate)
                                                        ? formatDate2(cleanDate(child?.DeadLineDate))
                                                        : '-'}
                                                </Typography>
                                            }
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

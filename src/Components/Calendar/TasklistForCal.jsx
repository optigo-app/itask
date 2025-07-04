import React, { useState, useEffect } from "react";
import {
    Box, Card, CardContent, Typography, TextField
} from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import { useRecoilValue } from "recoil";
import Fuse from "fuse.js";

import './TasklistForCal.scss';
import { TaskData } from "../../Recoil/atom";
import { commonTextFieldProps, filterNestedTasksByView, flattenTasks } from "../../Utils/globalfun";

const TasklistForCal = ({ calendarsColor }) => {
    const task = useRecoilValue(TaskData);
    console.log('task--->>>>: ', task);
    const [calTasksList, setCalTasksList] = useState([]);
    console.log('calTasksList: ', calTasksList);
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
                        const end = dragtask?.DeadLineDate;
                        return {
                            title: dragtask?.taskname ?? "",
                            start,
                            end,
                            taskid: dragtask?.taskid,
                            projectid: dragtask?.projectid ?? 0,
                            allDay: dragtask?.allDay ?? 0,
                            category: dragtask?.category ?? "",
                            description: dragtask?.descr ?? "",
                            guests: dragtask?.assignee ?? [],
                            estimate: dragtask?.estimate_hrs ?? "",
                            prModule: {
                                taskid: dragtask?.taskid ?? 0,
                                projectid: dragtask?.projectid ?? 0,
                                taskname: dragtask?.taskname ?? "",
                                projectname: dragtask?.taskPr ?? "",
                                taskPr: dragtask?.taskPr ?? ""
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
        const fuse = new Fuse(calTasksList || [], {
            keys: [
                "taskname",
                "descr",
                "status",
                "taskPr",
                "assignee.firstname",
                "assignee.lastname"
            ],
            threshold: 0.4
        });
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
                    children: []
                };
            }
        });
        (calTasksList || []).forEach(task => {
            if (!moduleMap[task.moduleid].children.find(t => t.taskid === task.taskid)) {
                moduleMap[task.moduleid].children.push({ ...task });
            }
        });
        return Object.values(moduleMap).filter(module => {
            const moduleMatch = matchedIds.has(module.taskid);
            const filteredChildren = module.children.filter(child => matchedIds.has(child.taskid));
            module.children = moduleMatch ? module.children : filteredChildren;
            return moduleMatch || filteredChildren.length > 0;
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
                            sx={{ ml: 1, mb: 0.5 }}
                        >
                            {parent.taskname}
                        </Typography>

                        {parent?.children?.map(child => {
                            const colorClass = calendarsColor[child.category] || "default";
                            return (
                                <Card
                                    key={child.taskid}
                                    className={`draggable-task bg-${colorClass} text-white`}
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
                                        <Typography variant="body2">{child.taskname}</Typography>
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

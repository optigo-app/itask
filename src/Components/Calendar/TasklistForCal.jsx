import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import './TasklistForCal.scss'
import { TaskData } from "../../Recoil/atom"
import { useRecoilValue } from "recoil";
import { flattenTasks } from "../../Utils/globalfun";

const TasklistForCal = ({ calendarsColor }) => {
    const task = useRecoilValue(TaskData);
    const [calTasksList, setCalTasksList] = useState([]);

    useEffect(() => {
        setCalTasksList(flattenTasks(task));
    }, [task]);

    // Initialize draggable tasks
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


    return (
        <>
            <Typography variant="h6" sx={{ m: '0px 10px 10px 10px' }}>Today Tasks</Typography>
            <Box id="external-tasks" sx={{ padding: 1.25, maxHeight: '100vh', height: '100%', overflow: 'auto' }}>
                {calTasksList.map((task) => {
                    const colorClass = calendarsColor[task.category] || "default";

                    return (
                        <Card
                            key={task.taskid}
                            className={`draggable-task bg-${colorClass} text-white`}
                            data-id={task.taskid}
                            sx={{
                                cursor: "grab",
                                mb: 1.25,
                                borderRadius: 1,
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <CardContent className={`bg-${colorClass} text-${colorClass}`} sx={{ p: '10px !important', m: 0 }}>
                                <Typography variant="body1">{task.taskname}</Typography>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </>
    );
};

export default TasklistForCal;

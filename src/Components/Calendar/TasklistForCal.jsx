import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { Draggable } from "@fullcalendar/interaction";
import './TasklistForCal.scss'

const initialTasks = [
    {
        "taskId": "1",
        "title": "Meeting with Client",
        "category": "RND",
        "eventUrl": "https://meeting.com/client",
        "start": "2025-02-05T10:00:00.000Z",
        "end": "2025-02-05T11:30:00.000Z",
        "guests": [
            {
                "id": 101,
                "userid": "john.doe@example.com",
                "customercode": "JD123",
                "firstname": "John",
                "lastname": "Doe",
                "designation": "Manager"
            }
        ],
        "description": "Client requirement discussion",
        "allDay": "false",
        "estimate": 1.5
    },
    {
        "taskId": "2",
        "title": "Team Standup",
        "category": "favourite task",
        "eventUrl": "",
        "start": "2025-02-06T09:00:00.000Z",
        "end": "2025-02-06T09:30:00.000Z",
        "guests": [
            {
                "id": 102,
                "userid": "alice@example.com",
                "customercode": "ALICE001",
                "firstname": "Alice",
                "lastname": "Smith",
                "designation": "Team Lead"
            },
            {
                "id": 103,
                "userid": "bob@example.com",
                "customercode": "BOB002",
                "firstname": "Bob",
                "lastname": "Williams",
                "designation": "Developer"
            }
        ],
        "description": "Daily team sync-up",
        "allDay": "false",
        "estimate": 0.5
    },
    {
        "taskId": "3",
        "title": "Meeting with Client",
        "category": "creative",
        "eventUrl": "https://meeting.com/client",
        "start": "2025-02-05T10:00:00.000Z",
        "end": "2025-02-05T11:30:00.000Z",
        "guests": [
            {
                "id": 101,
                "userid": "john.doe@example.com",
                "customercode": "JD123",
                "firstname": "John",
                "lastname": "Doe",
                "designation": "Manager"
            }
        ],
        "description": "Client requirement discussion",
        "allDay": "false",
        "estimate": 2.5
    }
];

const TasklistForCal = ({ calendarsColor }) => {
    const [tasks, setTasks] = useState(initialTasks);

    // Initialize draggable tasks
    useEffect(() => {
        debugger
        const container = document.getElementById("external-tasks");
        if (container) {
            new Draggable(container, {
                itemSelector: ".draggable-task",
                eventData: (eventEl) => {
                    const taskId = eventEl.getAttribute("data-id");
                    console.log('taskId: ', taskId);
                    const task = tasks.find(t => t.taskId === taskId);
                    return task ? { ...task } : {};
                }
            });
        }
    }, [tasks]);

    return (
        <>
            <Typography variant="h6" sx={{ m: '0px 10px 10px 10px' }}>Tasks List</Typography>
            <Box id="external-tasks" sx={{ padding: 1.25 }}>
                {tasks.map((task) => {
                    console.log('tasks: ', tasks);
                    const colorClass = calendarsColor[task.category] || "default";
                    console.log('calendarsColor: ', calendarsColor);

                    return (
                        <Card
                            key={task.id}
                            className={`draggable-task bg-${colorClass} text-white`}
                            data-id={task.id}
                            sx={{
                                cursor: "grab",
                                mb: 1.25,
                                borderRadius: 1,
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <CardContent className={`bg-${colorClass} text-${colorClass}`} sx={{ p: '10px !important', m: 0 }}>
                                <Typography variant="body1">{task.title}</Typography>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </>
    );
};

export default TasklistForCal;

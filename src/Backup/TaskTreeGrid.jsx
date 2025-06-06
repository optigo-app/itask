import React, { useState, useEffect, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Autocomplete,
    TextField,
    Collapse,
    IconButton,
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";

const employees = [
    { id: 101, name: "Alice", teamId: 5 },
    { id: 102, name: "Bob", teamId: 5 },
    { id: 103, name: "Charlie", teamId: 6 },
    { id: 104, name: "Diana", teamId: 5 },
];

const currentUser = { id: 101, teamId: 5 };

// Load from localStorage or fallback to default data
const loadTasksFromStorage = () => {
    try {
        const stored = localStorage.getItem("tasks");
        if (stored) return JSON.parse(stored);
    } catch {}
    return [
        {
            taskId: 1,
            title: "Design Website",
            assigneeId: 101,
            teamId: 5,
            children: [
                {
                    taskId: 2,
                    title: "Create Wireframes",
                    assigneeId: 102,
                    teamId: 5,
                    children: [],
                },
                {
                    taskId: 3,
                    title: "Design UI",
                    assigneeId: 101,
                    teamId: 5,
                    children: [],
                },
            ],
        },
        {
            taskId: 4,
            title: "Backend API",
            assigneeId: 103,
            teamId: 6,
            children: [],
        },
    ];
};

function saveTasksToStorage(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function filterTasks(tasks, viewMode, userId, teamId) {
    return tasks
        .map((task) => {
            const filteredChildren = filterTasks(
                task.children || [],
                viewMode,
                userId,
                teamId
            );

            const isVisible =
                viewMode === "me"
                    ? task.assigneeId === userId
                    : task.teamId === teamId;

            if (isVisible || filteredChildren.length > 0) {
                return { ...task, children: filteredChildren };
            }
            return null;
        })
        .filter(Boolean);
}

function TaskRow({ task, onAssign }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow>
                <TableCell>
                    {task.children && task.children.length > 0 ? (
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                        </IconButton>
                    ) : (
                        <Box sx={{ width: 24, display: "inline-block" }} />
                    )}
                    {task.title}
                </TableCell>
                <TableCell>
                    <Autocomplete
                        size="small"
                        options={employees}
                        getOptionLabel={(option) => option.name}
                        value={employees.find((e) => e.id === task.assigneeId) || null}
                        onChange={(e, newValue) => onAssign(task.taskId, newValue?.id || null)}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                        disableClearable
                        sx={{ width: 200 }}
                    />
                </TableCell>
            </TableRow>
            {task.children && task.children.length > 0 && (
                <TableRow>
                    <TableCell colSpan={2} style={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ marginLeft: 4 }}>
                                <Table size="small">
                                    <TableBody>
                                        {task.children.map((child) => (
                                            <TaskRow key={child.taskId} task={child} onAssign={onAssign} />
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

function flattenTasksWithPath(tasks, path = []) {
    let result = [];
    for (const task of tasks) {
        const currentPath = [...path, task.title];
        result.push({ taskId: task.taskId, title: currentPath.join(" > ") });
        if (task.children && task.children.length > 0) {
            result = result.concat(flattenTasksWithPath(task.children, currentPath));
        }
    }
    return result;
}

export default function TaskTreeGrid() {
    const [viewMode, setViewMode] = useState("me");
    const [tasks, setTasks] = useState(loadTasksFromStorage);

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newAssigneeId, setNewAssigneeId] = useState(currentUser.id);
    const [newParentId, setNewParentId] = useState(null);

    useEffect(() => {
        saveTasksToStorage(tasks);
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        return filterTasks(tasks, viewMode, currentUser.id, currentUser.teamId);
    }, [tasks, viewMode]);

    const handleAssign = (taskId, assigneeId) => {
        const updateTasks = (tasks) =>
            tasks.map((task) => {
                if (task.taskId === taskId) {
                    return { ...task, assigneeId };
                } else if (task.children && task.children.length > 0) {
                    return { ...task, children: updateTasks(task.children) };
                }
                return task;
            });
        setTasks((prev) => updateTasks(prev));
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return alert("Please enter task title");
        if (!employees.find((e) => e.id === newAssigneeId)) {
            return alert("Please select a valid assignee");
        }

        const newTask = {
            taskId: Date.now(),
            title: newTaskTitle.trim(),
            assigneeId: newAssigneeId,
            teamId: employees.find((e) => e.id === newAssigneeId)?.teamId || currentUser.teamId,
            children: [],
        };

        if (!newParentId) {
            setTasks((prev) => [...prev, newTask]);
        } else {
            const addChild = (tasks) =>
                tasks.map((task) => {
                    if (task.taskId === newParentId) {
                        return { ...task, children: [...task.children, newTask] };
                    } else if (task.children && task.children.length > 0) {
                        return { ...task, children: addChild(task.children) };
                    }
                    return task;
                });
            setTasks((prev) => addChild(prev));
        }

        setNewTaskTitle("");
        setNewAssigneeId(currentUser.id);
        setNewParentId(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" mb={2}>
                Task Tree Grid ({viewMode === "me" ? "My Tasks" : "Team Tasks"})
            </Typography>

            <Box mb={2}>
                <Button
                    variant={viewMode === "me" ? "contained" : "outlined"}
                    onClick={() => setViewMode("me")}
                    sx={{ mr: 1 }}
                >
                    Me
                </Button>
                <Button
                    variant={viewMode === "team" ? "contained" : "outlined"}
                    onClick={() => setViewMode("team")}
                >
                    Team
                </Button>
            </Box>

            {/* Add Task Form */}
            <Box
                sx={{
                    mb: 4,
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    maxWidth: 600,
                }}
            >
                <Typography variant="h6" mb={2}>
                    Add New Task
                </Typography>

                <TextField
                    fullWidth
                    label="Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Autocomplete
                    options={employees}
                    getOptionLabel={(option) => option.name}
                    value={employees.find((e) => e.id === newAssigneeId) || null}
                    onChange={(e, newValue) => setNewAssigneeId(newValue?.id || null)}
                    renderInput={(params) => (
                        <TextField {...params} label="Assignee" sx={{ mb: 2 }} />
                    )}
                    disableClearable
                    sx={{ width: 300 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="parent-task-label">Parent Task</InputLabel>
                    <Select
                        labelId="parent-task-label"
                        value={newParentId || ""}
                        label="Parent Task"
                        onChange={(e) =>
                            setNewParentId(e.target.value === "" ? null : e.target.value)
                        }
                    >
                        <MenuItem value="">-- No Parent (Root Task) --</MenuItem>
                        {flattenTasksWithPath(tasks).map((task) => (
                            <MenuItem key={task.taskId} value={task.taskId}>
                                {task.title}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button variant="contained" onClick={handleAddTask}>
                    Add Task
                </Button>
            </Box>

            {/* Tree Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Task Title</TableCell>
                        <TableCell>Assignee</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskRow key={task.taskId} task={task} onAssign={handleAssign} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={2} align="center">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";

// Example project and team structure
const projects = [
    {
        id: 1,
        name: "E-Commerce Website",
        teams: [
            { id: 5, name: "Frontend" },
            { id: 6, name: "Backend" },
        ],
    },
    {
        id: 2,
        name: "Mobile App",
        teams: [
            { id: 7, name: "iOS" },
            { id: 8, name: "Android" },
        ],
    },
];

// All employees with team mapping
const employees = [
    { id: 101, name: "Alice", teamId: 5 },
    { id: 102, name: "Bob", teamId: 5 },
    { id: 103, name: "Charlie", teamId: 6 },
    { id: 104, name: "Diana", teamId: 7 },
    { id: 105, name: "Eve", teamId: 8 },
];

// Simulated logged-in user
const currentUser = { id: 101, teamId: 5, projectId: 1 };

const defaultTasks = {
    1: [ // Project ID
        {
            taskId: 1,
            title: "Design Website",
            assigneeId: 101,
            teamId: 5,
            children: [],
        },
        {
            taskId: 2,
            title: "API Integration",
            assigneeId: 103,
            teamId: 6,
            children: [],
        },
    ],
    2: [
        {
            taskId: 3,
            title: "Login Screen",
            assigneeId: 104,
            teamId: 7,
            children: [],
        },
    ],
};

const TaskRow = ({ task, onAssign }) => {
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
                        options={employees.filter((e) => e.teamId === task.teamId)}
                        getOptionLabel={(opt) => opt.name}
                        value={employees.find((e) => e.id === task.assigneeId) || null}
                        onChange={(e, newVal) => onAssign(task.taskId, newVal?.id || null)}
                        renderInput={(params) => <TextField {...params} variant="standard" />}
                        disableClearable
                        sx={{ width: 200 }}
                    />
                </TableCell>
            </TableRow>
            {task.children.length > 0 && (
                <TableRow>
                    <TableCell colSpan={2} sx={{ p: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ ml: 4 }}>
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
};

const flattenTasksWithPath = (tasks, path = []) => {
    let result = [];
    for (const task of tasks) {
        const currentPath = [...path, task.title];
        result.push({ taskId: task.taskId, title: currentPath.join(" > ") });
        if (task.children.length > 0) {
            result = result.concat(flattenTasksWithPath(task.children, currentPath));
        }
    }
    return result;
};

export default function ProjectTaskManager() {
    const [selectedProjectId, setSelectedProjectId] = useState(currentUser.projectId);
    const [viewMode, setViewMode] = useState("me");
    const [tasksByProject, setTasksByProject] = useState(defaultTasks);

    const tasks = tasksByProject[selectedProjectId] || [];

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newAssigneeId, setNewAssigneeId] = useState(currentUser.id);
    const [newParentId, setNewParentId] = useState(null);

    const currentProject = projects.find((p) => p.id === selectedProjectId);
    const currentTeamIds = currentProject.teams.map((t) => t.id);
    const teamEmployees = employees.filter((e) => currentTeamIds.includes(e.teamId));

    const filteredTasks = useMemo(() => {
        const filter = (taskList) =>
            taskList
                .map((task) => {
                    const visible =
                        viewMode === "me"
                            ? task.assigneeId === currentUser.id
                            : currentTeamIds.includes(task.teamId);
                    const filteredChildren = filter(task.children || []);
                    if (visible || filteredChildren.length > 0) {
                        return { ...task, children: filteredChildren };
                    }
                    return null;
                })
                .filter(Boolean);
        return filter(tasks);
    }, [tasks, viewMode, selectedProjectId]);

    const handleAssign = (taskId, assigneeId) => {
        const update = (taskList) =>
            taskList.map((t) => {
                if (t.taskId === taskId) return { ...t, assigneeId };
                return { ...t, children: update(t.children) };
            });
        setTasksByProject((prev) => ({
            ...prev,
            [selectedProjectId]: update(prev[selectedProjectId] || []),
        }));
    };

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        const assignee = employees.find((e) => e.id === newAssigneeId);
        const newTask = {
            taskId: Date.now(),
            title: newTaskTitle.trim(),
            assigneeId: assignee.id,
            teamId: assignee.teamId,
            children: [],
        };

        const updatedTasks = [...(tasksByProject[selectedProjectId] || [])];

        if (newParentId) {
            const insert = (list) =>
                list.map((t) => {
                    if (t.taskId === newParentId) {
                        return { ...t, children: [...t.children, newTask] };
                    }
                    return { ...t, children: insert(t.children) };
                });
            setTasksByProject((prev) => ({
                ...prev,
                [selectedProjectId]: insert(updatedTasks),
            }));
        } else {
            updatedTasks.push(newTask);
            setTasksByProject((prev) => ({
                ...prev,
                [selectedProjectId]: updatedTasks,
            }));
        }

        setNewTaskTitle("");
        setNewAssigneeId(currentUser.id);
        setNewParentId(null);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" mb={2}>Project Task Manager</Typography>

            <FormControl sx={{ mb: 3, minWidth: 300 }}>
                <InputLabel>Project</InputLabel>
                <Select
                    value={selectedProjectId}
                    label="Project"
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                >
                    {projects.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                            {p.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

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

            {/* Add Task */}
            <Box
                sx={{
                    mb: 4,
                    p: 2,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    maxWidth: 600,
                }}
            >
                <Typography variant="h6" mb={2}>Add New Task</Typography>

                <TextField
                    fullWidth
                    label="Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <Autocomplete
                    options={teamEmployees}
                    getOptionLabel={(option) => option.name}
                    value={teamEmployees.find((e) => e.id === newAssigneeId) || null}
                    onChange={(e, newValue) => setNewAssigneeId(newValue?.id || null)}
                    renderInput={(params) => (
                        <TextField {...params} label="Assignee" sx={{ mb: 2 }} />
                    )}
                    disableClearable
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Parent Task</InputLabel>
                    <Select
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

            {/* Task Tree */}
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

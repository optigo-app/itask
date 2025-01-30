import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Box, Card, CardContent, Typography, IconButton, Avatar } from "@mui/material";
import { Circle, CircleCheck, CircleDotDashed, CircleX, Plus, StickyNote, Target, Workflow } from "lucide-react";
import { getRandomAvatarColor, priorityColors } from "../Utils/globalfun";

const initialData = {
    columns: {
        "column-1": {
            id: "column-1",
            title: "Todo",
            icon: <Circle color="pink" strokeWidth={2} />,
            tasks: [
                {
                    id: "task-1",
                    content: "Design wireframes",
                    assignee: "Alice",
                    project: "demoProject",
                    priority: "High",
                    subtasks: [
                        { id: "subtask-1", content: "Create homepage layout", assignee: "John", priority: "Medium" },
                        { id: "subtask-2", content: "Design dashboard mockup", assignee: "Emma", priority: "High" },
                    ],
                },
                {
                    id: "task-2",
                    content: "Develop API",
                    assignee: "Bob",
                    project: "demoProject",
                    priority: "Medium",
                    subtasks: [
                        { id: "subtask-3", content: "Set up database schema", assignee: "Alice", priority: "Low" },
                    ],
                },
            ],
        },
        "column-2": {
            id: "column-2",
            title: "In Progress",
            icon: <CircleDotDashed color="#EFB036" strokeWidth={2} />,
            tasks: [
                {
                    id: "task-3",
                    content: "Test application",
                    assignee: "Charlie",
                    project: "demoProject",
                    priority: "Low",
                    subtasks: [],
                },
            ],
        },
        "column-3": {
            id: "column-3",
            title: "Done",
            icon: <CircleCheck color="green" strokeWidth={2} />,
            tasks: [],
        },
    },
    columnOrder: ["column-1", "column-2", "column-3"],
};


function TaskApp() {
    const [data, setData] = useState(initialData);
    const [sourceColumnId, setSourceColumnId] = useState(null);

    const onDragStart = (start) => {
        setSourceColumnId(start.source.droppableId);
    };

    const onDragEnd = (result) => {
        const { destination, source } = result;
        setSourceColumnId(null);

        if (!destination) return;

        const startColumn = data.columns[source.droppableId];
        const endColumn = data.columns[destination.droppableId];

        if (startColumn === endColumn) {
            const updatedTasks = Array.from(startColumn.tasks);
            const [movedTask] = updatedTasks.splice(source.index, 1);
            updatedTasks.splice(destination.index, 0, movedTask);

            const updatedColumn = { ...startColumn, tasks: updatedTasks };
            setData({
                ...data,
                columns: { ...data.columns, [updatedColumn.id]: updatedColumn },
            });
        } else {
            const startTasks = Array.from(startColumn.tasks);
            const [movedTask] = startTasks.splice(source.index, 1);

            const endTasks = Array.from(endColumn.tasks);
            endTasks.splice(destination.index, 0, movedTask);

            setData({
                ...data,
                columns: {
                    ...data.columns,
                    [startColumn.id]: { ...startColumn, tasks: startTasks },
                    [endColumn.id]: { ...endColumn, tasks: endTasks },
                },
            });
        }
    };

    return (
        <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <Box display="flex" gap={3} p={2}>
                {data.columnOrder.map((columnId) => {
                    const column = data.columns[columnId];
                    return (
                        <Droppable key={column.id} droppableId={column.id}>
                            {(provided, snapshot) => (
                                <Box
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    sx={{
                                        backgroundColor: snapshot.isDraggingOver
                                            ? "#E8F9FF"
                                            : columnId === sourceColumnId
                                                ? "#fce6e6"
                                                : "#f4f4f4",
                                        borderRadius: 2,
                                        p: 2,
                                        width: 300,
                                        minHeight: 400,
                                        boxShadow: 2,
                                        transition: "background-color 0.3s",
                                        boxShadow: 'none'
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {column.icon}
                                            <Typography variant="h6">{column.title}</Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    background: '#C7C8CC',
                                                    borderRadius: '6px',
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {column.tasks.length}
                                            </Typography>
                                        </Box>
                                        <IconButton onClick={() => alert("Add Task functionality!")}>
                                            <Plus strokeWidth={2} />
                                        </IconButton>
                                    </Box>
                                    {column.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{
                                                        mb: 2,
                                                        backgroundColor: snapshot.isDragging ? "lightyellow" : "white",
                                                        boxShadow: snapshot.isDragging ? 4 : 1,
                                                        transition: "background-color 0.3s, box-shadow 0.3s",
                                                        position: "relative",
                                                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px'
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "flex-start",
                                                                marginBottom: 1
                                                            }}
                                                        >
                                                            <StickyNote
                                                                size={18}
                                                                style={{
                                                                    marginRight: '8px',
                                                                    marginTop: '2px'
                                                                }}
                                                            />
                                                            <Typography
                                                                variant="subtitle1"
                                                                sx={{
                                                                    lineHeight: 1.4,
                                                                    flex: 1
                                                                }}
                                                            >
                                                                {task.content}
                                                            </Typography>
                                                        </Box>

                                                        <div className="itask_separator" />
                                                        <Box display="flex" alignItems="center" mt={1}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    fontSize: '0.7rem',
                                                                    marginRight: 1,
                                                                    backgroundColor: getRandomAvatarColor(task.assignee)
                                                                }}
                                                            >
                                                                {task.assignee.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {task.assignee}
                                                            </Typography>
                                                        </Box>
                                                        <Box display="flex" alignItems="center" my={.5}>
                                                            <Target size={13} style={{ marginRight: '5px' }} />
                                                            <Typography variant="subtitle1">
                                                                {task.project}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary"
                                                            sx={{
                                                                color: priorityColors[task?.priority]?.color,
                                                                backgroundColor: priorityColors[task?.priority]?.backgroundColor,
                                                                width: 'fit-content',
                                                                padding: '0.2rem 0.8rem',
                                                                borderRadius: '5px',
                                                                textAlign: 'center',
                                                                fontSize: '13.5px',
                                                                fontWeight: '500',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                            }}>
                                                            {task.priority}
                                                        </Typography>
                                                        {task?.subtasks?.map((subtask, index) => (
                                                            <Box key={subtask.id} display="flex" alignItems="center" mt={1}>
                                                                <Workflow size={16} style={{ marginRight: '8px' }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {subtask.content}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </CardContent>
                                                    <IconButton
                                                        size="small"
                                                        sx={{ position: "absolute", top: 0, right: 0 }}
                                                        onClick={() => alert("Remove Task functionality!")}
                                                    >
                                                        <CircleX size={18} />
                                                    </IconButton>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    );
                })}
            </Box>
        </DragDropContext>
    );
}

export default TaskApp;

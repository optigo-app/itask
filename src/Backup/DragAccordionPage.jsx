import React, { useState } from "react";
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Collapse,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Sample data
const initialData = [
    {
        id: "group-1",
        title: "Documents",
        content: ["Passport", "License"],
    },
    {
        id: "group-2",
        title: "Tasks",
        content: ["Design UI", "Write API"],
    },
    {
        id: "group-3",
        title: "Status",
        content: ["Pending", "Completed", "Running"],
    },
];

export default function ToggleCardDragDrop() {
    const [leftGroups] = useState(initialData);
    const [rightGroups, setRightGroups] = useState([]);
    const [openCards, setOpenCards] = useState({});

    const toggleCard = (id) => {
        setOpenCards((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleDelete = (id) => {
        setRightGroups((prev) => prev.filter((g) => g.id !== id));
    };

    const handleDragEnd = (result) => {
        const { destination, draggableId } = result;
        if (!destination || destination.droppableId !== "right") return;

        const draggedGroup = leftGroups.find((g) => g.id === draggableId);
        if (!draggedGroup) return;

        const alreadyExists = rightGroups.find((g) => g.id === draggedGroup.id);
        if (alreadyExists) return;

        setRightGroups([...rightGroups, draggedGroup]);
    };

    const renderCard = (group, index, isDeletable = false) => (
        <Draggable draggableId={group.id} index={index} key={group.id}>
            {(provided) => (
                <Paper
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                        p: 1,
                        mb: 2,
                        cursor: "grab",
                        userSelect: "none",
                        border: "1px solid #ccc",
                    }}
                >
                    <Box display="flex" alignItems="center">
                        <DragIndicatorIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography flexGrow={1}>{group.title}</Typography>
                        <IconButton
                            size="small"
                            onClick={() => toggleCard(group.id)}
                            sx={{ ml: 1 }}
                        >
                            {openCards[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        {isDeletable && (
                            <IconButton size="small" onClick={() => handleDelete(group.id)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                    <Collapse in={openCards[group.id]}>
                        <Box mt={1} ml={3}>
                            <ul style={{ margin: 0, padding: 0 }}>
                                {group.content.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </Box>
                    </Collapse>
                </Paper>
            )}
        </Draggable>
    );

    return (
        <Box display="flex" height="100vh" p={2} gap={2}>
            <DragDropContext onDragEnd={handleDragEnd}>
                {/* Left Panel */}
                <Droppable droppableId="left" isDropDisabled>
                    {(provided) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            flex={1}
                            border="1px solid #ccc"
                            p={2}
                            borderRadius={2}
                            bgcolor="#f0f0f0"
                            overflow="auto"
                        >
                            <Typography variant="h6" mb={2}>
                                Available Groups
                            </Typography>

                            {leftGroups.map((group, index) => {
                                const alreadyAssigned = rightGroups.some(
                                    (g) => g.id === group.id
                                );

                                if (alreadyAssigned) {
                                    // Render non-draggable card
                                    return (
                                        <Paper
                                            key={group.id}
                                            sx={{
                                                p: 1,
                                                mb: 2,
                                                border: "1px solid #ccc",
                                                opacity: 0.5,
                                                cursor: "not-allowed",
                                                backgroundColor: "#f2f2f2",
                                            }}
                                        >
                                            <Box display="flex" alignItems="center">
                                                <DragIndicatorIcon fontSize="small" sx={{ mr: 1 }} />
                                                <Typography flexGrow={1}>{group.title}</Typography>
                                                <Typography variant="caption" color="error">
                                                    Already Assigned
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    );
                                }

                                return renderCard(group, index, false);
                            })}

                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>

                {/* Right Panel */}
                <Droppable droppableId="right">
                    {(provided) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            flex={1}
                            border="1px solid #ccc"
                            p={2}
                            borderRadius={2}
                            bgcolor="#e7fbe7"
                            overflow="auto"
                        >
                            <Typography variant="h6" mb={2}>
                                Assigned Groups
                            </Typography>

                            {rightGroups.map((group, index) =>
                                renderCard(group, index, true)
                            )}

                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
        </Box>
    );
}

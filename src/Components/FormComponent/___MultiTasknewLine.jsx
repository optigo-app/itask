import React, { useState } from "react";
import {
    Box, Button, TextareaAutosize, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton,
    Typography
} from "@mui/material";
import { Save, X as Close, Pencil, Trash } from "lucide-react";

const MultiTasknewLine = ({ onSave }) => {
    const [text, setText] = useState("");
    const [tasks, setTasks] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [showEdit, setShowEdit] = useState(true);

    const handleSave = () => {
        if (text.trim() === "") return;

        const newTasks = text.split("\n").filter(line => line.trim() !== "").map(line => ({
            taskName: line,
            estimate: "",
        }));

        setTasks([...tasks, ...newTasks]);
        setText("");
        setShowEdit(false);
        onSave(newTasks);
    };

    const handleEdit = (index) => {
        setEditIndex(index);
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
    };

    const handleSaveEdit = () => {
        setEditIndex(null);
    };

    const handleTaskChange = (index, key, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][key] = value;
        setTasks(updatedTasks);
        onSave(updatedTasks);
    };

    const handleDelete = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
    };

    return (
        <Box>
            <Stack spacing={2}>
                {showEdit ? (
                    <>
                        <TextareaAutosize
                            suppressHydrationWarning
                            minRows={4}
                            placeholder="Enter tasks (each line = new task)..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                outline: "none",
                                resize: "vertical",
                            }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "end", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                className="buttonClassname"
                            >
                                Add Tasks
                            </Button>
                        </Box>
                    </>
                ) :
                    <>
                        {tasks.length > 0 && (
                            <TableContainer component={Paper} sx={{ mt: 2 }} className="bulTaskTableContainer">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ width: "50%" }}><b>Task Name</b></TableCell>
                                            <TableCell sx={{ width: "30%" }}><b>Estimate</b></TableCell>
                                            <TableCell sx={{ width: "20%", textAlign: "center" }}><b>Actions</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tasks.map((task, index) => (
                                            <TableRow key={index}>
                                                {/* Task Name Column */}
                                                <TableCell sx={{ width: "50%" }}>
                                                    {editIndex === index ? (
                                                        <TextField
                                                            size="small"
                                                            className="textfieldsClass"
                                                            fullWidth
                                                            value={task.taskName}
                                                            onChange={(e) => handleTaskChange(index, "taskName", e.target.value)}
                                                        />
                                                    ) : (
                                                        <Typography variant="body1">{task.taskName}</Typography>
                                                    )}
                                                </TableCell>

                                                {/* Estimate Column - Always Active */}
                                                <TableCell sx={{ width: "30%" }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        className="textfieldsClass"
                                                        fullWidth
                                                        value={task.estimate}
                                                        onChange={(e) => handleTaskChange(index, "estimate", e.target.value)}
                                                    />
                                                </TableCell>

                                                {/* Actions Column */}
                                                <TableCell sx={{ width: "20%", textAlign: "center" }}>
                                                    {editIndex === index ? (
                                                        <>
                                                            <IconButton onClick={handleSaveEdit} color="success">
                                                                <Save size={20} />
                                                            </IconButton>
                                                            <IconButton onClick={handleCancelEdit} color="error">
                                                                <Close size={20} />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton onClick={() => handleEdit(index)}>
                                                                <Pencil size={20} />
                                                            </IconButton>
                                                            <IconButton onClick={() => handleDelete(index)} color="error">
                                                                <Trash size={20} />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                }
            </Stack>
        </Box>
    );
};

export default MultiTasknewLine;

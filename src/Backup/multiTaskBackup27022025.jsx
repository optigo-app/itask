import React, { useState, useRef, useEffect } from "react";
import {
    Box, Button, TextareaAutosize, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Typography, Grid
} from "@mui/material";
import { Save, X as Close, Pencil, Trash, Plus, Minus } from "lucide-react";

const MultiTaskInput = ({ onSave, multiType }) => {
    const [tasks, setTasks] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [showEdit, setShowEdit] = useState(true);
    const [text, setText] = useState("");
    const [values, setValues] = useState([""]);
    const inputRefs = useRef([]);
    const maxInputs = 50;

    // Handle bulk text entry
    const handleSaveTextArea = () => {
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

    // Handle dynamic text field input
    const addField = () => {
        if (values.length < maxInputs) {
            setValues((prev) => [...prev, ""]);
            setTimeout(() => {
                const lastIndex = inputRefs.current.length - 1;
                inputRefs.current[lastIndex]?.focus();
            }, 100);
        }
    };

    const handleChangeField = (index, value) => {
        const newValues = [...values];
        newValues[index] = value;
        setValues(newValues);
    };

    const removeField = (index) => {
        const newValues = values.filter((_, i) => i !== index);
        setValues(newValues);
    };

    const handleSaveFields = () => {
        const newTasks = values.filter(val => val.trim() !== "").map(val => ({
            taskName: val,
            estimate: "",
        }));

        setTasks([...tasks, ...newTasks]);
        setValues([""]);
        setShowEdit(false);
        onSave(newTasks);
    };

    // Task edit functions
    const handleEdit = (index) => setEditIndex(index);
    const handleCancelEdit = () => setEditIndex(null);
    const handleSaveEdit = () => setEditIndex(null);

    const handleTaskChange = (index, key, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][key] = value;
        setTasks(updatedTasks);
        onSave(updatedTasks);
    };

    const handleDelete = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
        onSave(tasks.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (tasks.length === 0) {
            setShowEdit(true);
        }
    }, [tasks])

    return (
        <Box className="mltMainBox">
            <Stack spacing={2}>
                {showEdit ? (
                    <>
                        {multiType === "multi1" ? (
                            <>
                                {values.map((value, index) => (
                                    <Grid container spacing={1} alignItems="center" key={index} sx={{ mb: 1 }}>
                                        <Grid item xs={10}>
                                            <TextField
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                                value={value}
                                                inputRef={(el) => (inputRefs.current[index] = el)}
                                                onChange={(e) => handleChangeField(index, e.target.value)}
                                                className="textfieldsClass"
                                            />
                                        </Grid>
                                        <Grid item xs={2} sx={{ display: "flex", justifyContent: "space-between" }}>
                                            {index === values.length - 1 && values.length < maxInputs && (
                                                <IconButton onClick={addField} color="primary">
                                                    <Plus color="#444050" />
                                                </IconButton>
                                            )}
                                            {index !== values.length - 1 && values.length > 1 && (
                                                <IconButton onClick={() => removeField(index)} color="error">
                                                    <Minus />
                                                </IconButton>
                                            )}
                                        </Grid>
                                    </Grid>
                                ))}
                                <Box sx={{ display: "flex", justifyContent: "end" }}>
                                    <Button variant="contained" onClick={handleSaveFields} className="buttonClassname">
                                        Add Tasks
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <>
                                <TextareaAutosize
                                    suppressHydrationWarning
                                    minRows={4}
                                    maxRows={30}
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
                                        overflow: "auto",
                                    }}
                                />
                                <Box sx={{ display: "flex", justifyContent: "end" }}>
                                    <Button variant="contained" onClick={handleSaveTextArea} className="buttonClassname">
                                        Add Tasks
                                    </Button>
                                </Box>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {tasks?.length !== 0 && (
                            <>
                                <Box className="taskCount">
                                    <Typography variant="body">Count: {tasks?.length}</Typography>
                                </Box>
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
                                            {tasks?.map((task, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ width: "50%" }}>
                                                        {editIndex === index ? (
                                                            <TextField
                                                                size="small"
                                                                className="textfieldsClass"
                                                                fullWidth
                                                                value={task.taskName}
                                                                inputRef={(el) => (inputRefs.current[index] = el)}
                                                                onChange={(e) => handleTaskChange(index, "taskName", e.target.value)}
                                                            />
                                                        ) : (
                                                            <Typography variant="body1">{task.taskName}</Typography>
                                                        )}
                                                    </TableCell>

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
                            </>

                        )}
                    </>
                )}
            </Stack>
        </Box>
    );
};

export default MultiTaskInput;

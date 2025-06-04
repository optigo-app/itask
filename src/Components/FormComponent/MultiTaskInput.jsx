import React, { useState, useRef, useEffect } from "react";
import {
    Box, Button, TextareaAutosize, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Typography
} from "@mui/material";
import { Save, X as Close, Pencil, Trash, Plus, ArrowLeft } from "lucide-react";
import './SidebarDrawer.scss';

const MultiTaskInput = ({ onSave }) => {
    const [tasks, setTasks] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [showEdit, setShowEdit] = useState(true);
    const [text, setText] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newEstimate, setNewEstimate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef(null);
    const estimateRefs = useRef([]);
    const [totalEstimate, setTotalEstimate] = useState('');
    const [editingName, setEditingName] = useState("");
    const [editingEstimate, setEditingEstimate] = useState("");

    useEffect(() => {
        estimateRefs.current = estimateRefs.current.slice(0, tasks.length);
    }, [tasks]);

    const parseEstimate = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const updateTotalEstimate = (taskList = tasks) => {
        const total = taskList.reduce((sum, task) => sum + parseEstimate(task.estimate), 0);
        setTotalEstimate(total.toFixed(2));
    };

    // Handle bulk text entry
    const handleSaveTextArea = () => {
        if (text.trim() === "") return;
        const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
        if (lines.some(line => !isValidInput(line))) {
            setErrorMessage("Tasks cannot contain ',' or '#'.");
            return;
        }
        setErrorMessage("");
        const newTasks = lines.map(line => ({
            taskName: line,
            estimate: "",
        }));

        setTasks([...tasks, ...newTasks]);
        setText("");
        setShowEdit(false);
        onSave([...tasks, ...newTasks]);
    };

    // Add new task from input field
    const addNewTask = () => {
        if (newTask.trim() === "") return;
        if (!isValidInput(newTask)) {
            setErrorMessage("Task name cannot contain ',' or '#'.");
            return;
        }
        setErrorMessage("");
        let newTasks = [...tasks, { taskName: newTask, estimate: newEstimate ?? '' }];

        setTasks(newTasks);
        onSave(newTasks);
        updateTotalEstimate(newTasks);
        setNewTask("");
        setNewEstimate("");
        inputRef.current?.focus();
    };

    const handleTaskChange = (index, key, value) => {
        if (!isValidInput(value)) {
            setErrorMessage("Task name cannot contain ',' or '#'.");
            return;
        }
        setErrorMessage("");
        const updatedTasks = [...tasks];
        updatedTasks[index][key] = value;
        setTasks(updatedTasks);
        updateTotalEstimate(updatedTasks);
        onSave(updatedTasks);
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (!isValidInput(newTask)) {
                setErrorMessage("Task name cannot contain ',' or '#'.");
                return;
            }
            setErrorMessage("");
            addNewTask();
        }
    };

    const handleEstimateKeyPress = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextIndex = index + 1;
            if (nextIndex < tasks.length) {
                estimateRefs.current[nextIndex]?.focus();
            } else {
                inputRef.current?.focus();
            }
        }
    };

    // Task edit functions
    const handleEdit = (index) => {
        setEditIndex(index);
        setEditingName(tasks[index].taskName);
        setEditingEstimate(tasks[index].estimate);
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditingName("");
        setEditingEstimate("");
        setErrorMessage("");
    };
    const handleSaveEdit = () => {
        if (editingName?.trim() === "") {
            setErrorMessage("Task name is required.");
            return;
        }

        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = {
            ...updatedTasks[editIndex],
            taskName: editingName?.trim(),
            estimate: tasks?.[editIndex]?.estimate || ""
        };

        setTasks(updatedTasks);
        updateTotalEstimate(updatedTasks);
        setEditIndex(null);
        setEditingName("");
        setEditingEstimate("");
        setErrorMessage("");
    };

    const isValidInput = (value) => {
        return !/[,#]/.test(value); // Disallow "," and "#"
    };

    const handleDelete = (index) => {
        const updatedTasks = tasks.filter((_, i) => i !== index);
        setTasks(updatedTasks);
        updateTotalEstimate(updatedTasks);
        onSave(updatedTasks);
    };

    useEffect(() => {
        if (tasks.length === 0) {
            setShowEdit(true);
        }
    }, [tasks]);

    const handleBack = () => {
        const tasksText = tasks.map(task => task.taskName)?.join('\n');
        setText(tasksText);
        setTasks([]);
        onSave([]);
        setShowEdit(true);
    };

    const splitEstimate = (total) => {
        const parsedTotal = parseFloat(total);
        if (!tasks.length || isNaN(parsedTotal)) return;
        const estimatePerTask = parsedTotal / tasks.length;
        const updatedTasks = tasks.map(task => ({
            ...task,
            estimate: estimatePerTask.toFixed(2),
        }));
        setTasks(updatedTasks);
        onSave(updatedTasks);
        // setTotalEstimate(estimatePerTask.toFixed(2));
    };

    const BackButton = ({ onClick }) => (
        <Button
            className="backbtn"
            onClick={onClick}
            startIcon={<ArrowLeft size={20} />}
            sx={{
                color: '#7d7f85',
                backgroundColor: 'transparent',
                border: '1px solid #7d7f85',
                borderRadius: '4px',
                padding: '6px 12px',
                textTransform: 'none',
                '&:hover': {
                    backgroundColor: 'rgba(125, 127, 133, 0.1)',
                },
            }}
        >
            <Typography variant="body2">Back</Typography>
        </Button>
    );

    const isValidDecimalInput = (value) => /^\d{0,2}(\.\d{0,2})?$/.test(value);
    const handleDecimalInputKeyPress = (e, currentValue = "") => {
        const char = e.key;
        if (['-', '+', 'e'].includes(char) || (char === '.' && currentValue.includes('.'))) {
            e.preventDefault();
            return;
        }
        const [beforeDecimal, afterDecimal = ""] = currentValue.split('.');
        const cursorAtDecimal = currentValue.includes('.') && e.target.selectionStart > currentValue.indexOf('.');
        if (!currentValue.includes('.') && beforeDecimal.length >= 2 && char !== '.') {
            e.preventDefault();
        }
        if (cursorAtDecimal && afterDecimal.length >= 2) {
            e.preventDefault();
        }
    };


    return (
        <Box className="mltMainBox">
            <Stack spacing={2}>
                {showEdit ? (
                    <>
                        <TextareaAutosize
                            minRows={5}
                            placeholder="Enter tasks (each line = new task, ',' and '#' not allowed)..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{
                                padding: "10px",
                                fontSize: "14px",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                outline: "none",
                                resize: "vertical",
                                overflow: "auto",
                            }}
                            className="textareaCustCss"
                        />
                        {errorMessage && (
                            <Typography variant="body2" sx={{
                                color: '#d32f2f !important',
                                marginTop: '4px !important',
                            }}>
                                {errorMessage}
                            </Typography>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "end" }}>
                            <Button className="buttonClassname" onClick={handleSaveTextArea}>
                                Add Tasks
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        {tasks.length !== 0 && (
                            <>
                                <Box className="taskCount">
                                    <Box sx={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                                        <Typography className="taskCountTypo" variant="body">Count: {tasks?.length}</Typography>
                                        <Box>
                                            <Typography
                                                variant="subtitle1"
                                                className="form-label"
                                                htmlFor="taskName"
                                            >
                                                Estimate Total
                                            </Typography>
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                type="text"
                                                placeholder="Enter Total est..."
                                                className="textfieldsClass"
                                                sx={{ maxWidth: '150px' }}
                                                value={totalEstimate}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (isValidDecimalInput(value)) {
                                                        setTotalEstimate(value);
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (!isNaN(val)) {
                                                        splitEstimate(val);
                                                    }
                                                }}
                                                onKeyPress={(e) => {
                                                    handleDecimalInputKeyPress(e, totalEstimate || "");
                                                    handleEstimateKeyPress(e);
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <BackButton onClick={handleBack} />
                                </Box>
                                <TableContainer component={Paper} sx={{
                                    mt: 2,
                                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;",
                                    borderRadius: "8px",
                                }}>
                                    <Table className="Mlt-denseTable">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ width: "60%" }}><b>Task Name</b></TableCell>
                                                <TableCell sx={{ width: "20%" }}><b>Estimate</b></TableCell>
                                                <TableCell sx={{ width: "20%", textAlign: "center" }}><b>Actions</b></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tasks.map((task, index) => (
                                                <>
                                                    <TableRow key={index}>
                                                        <TableCell sx={{ width: "60%" }}>
                                                            {editIndex === index ? (
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    value={editingName}
                                                                    onChange={(e) => setEditingName(e.target.value)}
                                                                    className="textfieldsClass"
                                                                />
                                                            ) : (
                                                                <Typography>{task.taskName}</Typography>
                                                            )}
                                                        </TableCell>

                                                        <TableCell sx={{ width: "20%" }}>
                                                            <TextField
                                                                type="number"
                                                                size="small"
                                                                fullWidth
                                                                value={task.estimate}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (/^\d*\.?\d*$/.test(value)) {
                                                                        handleTaskChange(index, "estimate", value);
                                                                    }
                                                                }}
                                                                onKeyPress={(e) => {
                                                                    if (['-', '+', 'e'].includes(e.key)) {
                                                                        e.preventDefault();
                                                                    }
                                                                    if (e.key === '.' && task.estimate.includes('.')) {
                                                                        e.preventDefault();
                                                                    }
                                                                    handleEstimateKeyPress(e, index);
                                                                }}
                                                                inputRef={(el) => estimateRefs.current[index] = el}
                                                                className="textfieldsClass"
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ width: "20%", textAlign: "center" }}>
                                                            {editIndex === index ? (
                                                                <>
                                                                    <IconButton onClick={handleSaveEdit} color="success">
                                                                        <Save size={18} />
                                                                    </IconButton>
                                                                    <IconButton onClick={handleCancelEdit} color="error">
                                                                        <Close size={18} />
                                                                    </IconButton>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <IconButton onClick={() => handleEdit(index)}>
                                                                        <Pencil size={18} />
                                                                    </IconButton>
                                                                    <IconButton onClick={() => handleDelete(index)} color="error">
                                                                        <Trash size={18} />
                                                                    </IconButton>
                                                                </>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                </>
                                            ))}

                                            {/* Add New Task Row */}
                                            <TableRow>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="New task..."
                                                        value={newTask}
                                                        onChange={(e) => setNewTask(e.target.value)}
                                                        onKeyPress={handleKeyPress}
                                                        inputRef={inputRef}
                                                        className="textfieldsClass"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        type="text"
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Estimate"
                                                        value={newEstimate}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (/^\d{0,2}(\.\d{0,2})?$/.test(value)) {
                                                                setNewEstimate(value);
                                                            }
                                                        }}
                                                        onKeyPress={(e) => {
                                                            const char = e.key;
                                                            const currentValue = newEstimate || "";
                                                            if (['-', '+', 'e'].includes(char)) {
                                                                e.preventDefault();
                                                            }
                                                            if (char === '.' && currentValue.includes('.')) {
                                                                e.preventDefault();
                                                            }
                                                            const [beforeDecimal, afterDecimal = ""] = currentValue.split('.');
                                                            const cursorAtDecimal = currentValue.includes('.') && e.target.selectionStart > currentValue.indexOf('.');
                                                            if (!currentValue.includes('.') && beforeDecimal.length >= 2 && char !== '.') {
                                                                e.preventDefault();
                                                            }
                                                            if (cursorAtDecimal && afterDecimal.length >= 2) {
                                                                e.preventDefault();
                                                            }
                                                            handleKeyPress(e);
                                                        }}
                                                        className="textfieldsClass"
                                                    />

                                                </TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <IconButton onClick={addNewTask}
                                                        sx={{
                                                            color: 'white',
                                                            backgroundColor: '#7d7f85',
                                                            '&:hover': {
                                                                backgroundColor: '#115293',
                                                            },
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                            transition: 'all 0.3s ease',
                                                            '&:active': {
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(1px)',
                                                            },
                                                        }}
                                                    >
                                                        <Plus fontSize={18} width={18} height={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                    {errorMessage && <Typography sx={{ m: 1, fontSize: '12px', color: '#d32f2f !important' }}>{errorMessage}</Typography>}
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
// {editIndex === index ? (
//     <TextField
//         type="text"
//         size="small"
//         fullWidth
//         value={editIndex === index ? editingEstimate : task.estimate}
//         onChange={(e) => {
//             const value = e.target.value;
//             if (isValidDecimalInput(value)) {
//                 setEditingEstimate(value);
//             }
//         }}
//         className="textfieldsClass"
//     />
// ) : (
//     <Typography>{task.estimate}</Typography>
// )}
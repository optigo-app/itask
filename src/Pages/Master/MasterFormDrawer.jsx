import React, { useState } from "react";
import { Drawer, Box, Typography, TextField, Button, IconButton, ToggleButtonGroup, ToggleButton, TextareaAutosize } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { commonTextFieldProps } from "../../Utils/globalfun";
import { Grid2x2, ListTodo } from "lucide-react";

const MasterFormDrawer = ({ open, onClose, activeTab, onSubmit, formData, formattedData, setFormData, selectedRow }) => {
    const [masterType, setMasterType] = useState("single");
    const [text, setText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [displayOrderError, setDisplayOrderError] = useState("");
    const [masterName, setMasterName] = useState('');

    const master_OPTIONS = [
        { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
        { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
    ];

    const handleMasterChange = (event, newTaskType) => {
        if (newTaskType !== null) setMasterType(newTaskType);
    };

    const handleChange = (e) => {
        if (activeTab == "Advanced Master") {
        } else {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const isValidInput = (value) => {
        if (typeof value !== 'string') return true;
        return !/[,#]/.test(value);
    };

    const handleSaveTextArea = () => {
        if (text.trim() === "") return;
        const lines = text.split("\n").map(line => line.trim()).filter(line => line !== "");
        if (lines.some(line => !isValidInput(line))) {
            setErrorMessage("Tasks cannot contain ',' or '#'.");
            return;
        }
        setErrorMessage("");
        const newTasks = lines.map(line => ({
            masterName: masterName ?? '',
            masterValue: line,
        }));

        setText("");
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, padding: "10px 15px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Typography variant="h6">Master Form</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <div style={{
                    margin: "15px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }} />
                {activeTab == "Advanced Master" && (
                    <Box className="masterSideBarTgBox">
                        <ToggleButtonGroup
                            value={masterType}
                            exclusive
                            onChange={handleMasterChange}
                            aria-label="task type"
                            size="small"
                            className="toggle-group"
                        >
                            {master_OPTIONS?.map(({ id, value, label, icon }) => (
                                <ToggleButton
                                    key={id}
                                    value={value}
                                    className="toggle-button"
                                    sx={{
                                        borderRadius: "8px",
                                    }}
                                >
                                    {icon}
                                    {label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                )}
                {activeTab != "Advanced Master" ? (
                    <>
                        <Typography variant="body2">{activeTab}</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter Data..."
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                        <Typography variant="body2">Display Order</Typography>
                        <TextField
                            fullWidth
                            type="number"
                            placeholder="Enter Display Order..."
                            name="displayorder"
                            value={formData.displayorder}
                            onChange={handleChange}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                        {displayOrderError && (
                            <Typography
                                variant="body2"
                                sx={{ color: "#d32f2f !important", fontSize: "0.75rem", marginTop: "4px" }}
                            >
                                {displayOrderError}
                            </Typography>
                        )}
                    </>
                ) :
                    <Box>
                        {masterType == "single" ? (
                            <>
                                <Typography variant="body2">Master Group</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Master Group name..."
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    margin="normal"
                                    {...commonTextFieldProps}
                                    sx={{ marginTop: .5 }}
                                />
                                <Typography variant="body2">Master Name</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Data..."
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    margin="normal"
                                    {...commonTextFieldProps}
                                    sx={{ marginTop: .5 }}
                                />
                                <Typography variant="body2">Master Value</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Data..."
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    margin="normal"
                                    {...commonTextFieldProps}
                                    sx={{ marginTop: .5 }}
                                />
                            </>
                        ) :
                            <Box sx={{ marginBlock: 2 }}>
                                <Typography variant="body2">Master Group</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Master Group name..."
                                    name="name"
                                    value={masterName ?? ''}
                                    onChange={handleChange}
                                    margin="normal"
                                    {...commonTextFieldProps}
                                    sx={{ marginTop: .5 }}
                                />
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
                                        width: "-webkit-fill-available",
                                        marginBottom: 1
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
                            </Box>
                        }
                    </Box>
                }
                <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: '10px' }}>
                    <Button variant="outlined" className="secondaryBtnClassname" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        className="buttonClassname"
                        onClick={() => {
                            const isDuplicate = formattedData.some(
                                (item) =>
                                    item.displayorder == formData.displayorder &&
                                    (selectedRow ? item.id !== selectedRow.id : true)
                            );

                            if (isDuplicate) {
                                setDisplayOrderError("Display order already exists.");
                                return;
                            }

                            setDisplayOrderError("");
                            onSubmit(selectedRow);
                        }}
                    >
                        {formData.name ? "Save" : "Add"}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default MasterFormDrawer;

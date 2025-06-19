import React, { useState } from "react";
import "./Master.scss"
import {
    Drawer, Box, Typography, TextField, Button, IconButton,
    ToggleButtonGroup, ToggleButton, TextareaAutosize, TableContainer,
    Table, TableHead, TableRow, TableCell, TableBody, Paper
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Pencil, Save, Trash, Plus } from "lucide-react";
import { commonTextFieldProps } from "../../Utils/globalfun";
import { Grid2x2, ListTodo } from "lucide-react";

const MasterAdvFormDrawer = ({ open, onClose, activeTab, onSubmit, formData, setFormData, selectedRow }) => {
    console.log('formData: ', formData);
    const [masterType, setMasterType] = useState("single");
    const [text, setText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [masterName, setMasterName] = useState('');
    const [bulkList, setBulkList] = useState([]);
    console.log('bulkList: ', bulkList);
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [editName, setEditName] = useState("");

    const master_OPTIONS = [
        { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
        { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
    ];

    const handleMasterChange = (event, newType) => {
        if (newType !== null) {
            setMasterType(newType);
            setBulkList([]);
            setMasterName('');
            setFormData({ ...formData, name: '' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (masterType === "single") {
            setFormData({ ...formData, [name]: value });
        } else {
            setMasterName(value);
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
            setErrorMessage("Values cannot contain ',' or '#'.");
            return;
        }
        const newEntries = lines.map(line => ({
            masterName: masterName,
            masterValue: line,
        }));
        setBulkList(prev => [...prev, ...newEntries]);
        setText("");
        setErrorMessage("");
    };

    const handleDelete = (index) => {
        setBulkList(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditName(bulkList[index].masterName);
        setEditValue(bulkList[index].masterValue);
    };

    const handleSaveEdit = () => {
        const updated = [...bulkList];
        updated[editIndex] = { masterName: editName, masterValue: editValue };
        setBulkList(updated);
        setEditIndex(null);
        setEditValue("");
        setEditName("");
    };

    const handleCancelEdit = () => {
        setEditIndex(null);
        setEditValue("");
        setEditName("");
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, padding: "10px 15px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Typography variant="h6">Master Form</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <Box className="masterSideBarTgBox">
                    <ToggleButtonGroup
                        value={masterType}
                        exclusive
                        onChange={handleMasterChange}
                        size="small"
                        className="toggle-group"
                    >
                        {master_OPTIONS.map(({ id, value, label, icon }) => (
                            <ToggleButton key={id} value={value} className="toggle-button" sx={{ borderRadius: "8px" }}>
                                {icon} {label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {masterType === "single" ? (
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
                        <Typography variant="body2">Master Data</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter Data..."
                            name="value"
                            value={formData.value || ''}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                    </>
                ) : (
                    <>
                        {bulkList.length <= 0 &&
                            <>
                                <Typography variant="body2">Master Group</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Enter Master Group name..."
                                    name="name"
                                    value={masterName}
                                    onChange={handleChange}
                                    margin="normal"
                                    {...commonTextFieldProps}
                                    sx={{ marginTop: .5 }}
                                />
                                <TextareaAutosize
                                    minRows={5}
                                    placeholder="Enter values (each line = one entry, ',' and '#' not allowed)..."
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    style={{
                                        padding: 10,
                                        fontSize: 14,
                                        borderRadius: 8,
                                        border: '1px solid #ccc',
                                        outline: 'none',
                                        resize: 'vertical',
                                        color: "#6D6B77",
                                        width: "-webkit-fill-available"
                                    }}
                                />
                                {errorMessage && (
                                    <Typography variant="body2" sx={{ color: '#d32f2f', marginTop: '4px' }}>{errorMessage}</Typography>
                                )}
                                <Box sx={{ display: "flex", justifyContent: "end", mt: 1 }}>
                                    <Button size="small" variant="contained" className="buttonClassname" onClick={handleSaveTextArea}>Add Entries</Button>
                                </Box>
                            </>
                        }
                        {bulkList.length > 0 &&
                            <TableContainer className="advMasterTC" component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
                                <Table className="advMasterTable">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><b>Master Name</b></TableCell>
                                            <TableCell><b>Master Value</b></TableCell>
                                            <TableCell align="center"><b>Actions</b></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bulkList.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {editIndex === index ? (
                                                        <TextField size="small" fullWidth value={editName} {...commonTextFieldProps} onChange={(e) => setEditName(e.target.value)} />
                                                    ) : (
                                                        item.masterName
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {editIndex === index ? (
                                                        <TextField size="small" fullWidth value={editValue} {...commonTextFieldProps} onChange={(e) => setEditValue(e.target.value)} />
                                                    ) : (
                                                        item.masterValue
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    {editIndex === index ? (
                                                        <>
                                                            <IconButton color="success" onClick={handleSaveEdit}><Save size={18} /></IconButton>
                                                            <IconButton color="error" onClick={handleCancelEdit}><CloseIcon fontSize="small" /></IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton onClick={() => handleEdit(index)}><Pencil size={18} /></IconButton>
                                                            <IconButton onClick={() => handleDelete(index)} color="error"><Trash size={18} /></IconButton>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                    </>
                )}
                {(masterType === "single" || (masterType === "multi" && bulkList.length > 0)) && (
                    <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: 1 }}>
                        <Button size="small" className="secondaryBtnClassname" variant="outlined" onClick={onClose}>Cancel</Button>
                        <Button size="small" className="buttonClassname" variant="contained" onClick={() => onSubmit(selectedRow)}>
                            {formData.name ? "Save" : "Add"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default MasterAdvFormDrawer;

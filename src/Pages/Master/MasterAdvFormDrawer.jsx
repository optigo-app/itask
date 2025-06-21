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
import DynamicMasterDrawer from "./DynamicMasterDrawer";

const MasterAdvFormDrawer = ({ open, onClose, mode, activeTab, onSubmit, formData, setFormData, selectedRow }) => {
    console.log('formData: ', formData);
    const [masterType, setMasterType] = useState("single");
    const [groups, setGroups] = useState([]);

    const master_OPTIONS = [
        { id: 1, value: "single", label: "Single", icon: <ListTodo size={20} /> },
        { id: 2, value: "multi_input", label: "Bulk", icon: <Grid2x2 size={20} /> },
    ];

    const handleMasterChange = (event, newType) => {
        if (newType !== null) {
            setMasterType(newType);
            setFormData({ ...formData, name: '' });
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 450, padding: "10px 15px" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <Typography variant="h6">Master Form</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Box>
                <div style={{
                    margin: "15px 0",
                    border: "1px dashed #7d7f85",
                    opacity: 0.3,
                }} />
                {mode !== 'edit' &&
                    <Box className="masterSideBarTgBox">
                        <ToggleButtonGroup
                            value={masterType}
                            exclusive
                            onChange={handleMasterChange}
                            size="small"
                            className="toggle-group"
                        >
                            {master_OPTIONS?.map(({ id, value, label, icon }) => (
                                <ToggleButton key={id} value={value} className="toggle-button" sx={{ borderRadius: "8px" }}>
                                    {icon} {label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>
                }

                {masterType === "single" ? (
                    <>
                        <Typography variant="body2">Master Group</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter Master Group name..."
                            name="name"
                            value={formData.masterName || ''}
                            onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                        <Typography variant="body2">Master Name</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter Data..."
                            name="value"
                            value={formData.subMasterName || ''}
                            onChange={(e) => setFormData({ ...formData, subMasterName: e.target.value })}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                        <Typography variant="body2">Master Data</Typography>
                        <TextField
                            fullWidth
                            placeholder="Enter Data..."
                            name="value"
                            value={formData.masterValue || ''}
                            onChange={(e) => setFormData({ ...formData, masterValue: e.target.value })}
                            margin="normal"
                            {...commonTextFieldProps}
                            sx={{ marginTop: .5 }}
                        />
                    </>
                ) : (
                    <>
                        <DynamicMasterDrawer
                            groups={groups}
                            setGroups={setGroups}
                        />

                    </>
                )}

                {(masterType === "single" || (masterType == "multi_input" && groups.length > 0)) && (
                    <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: 1 }}>
                        <Button size="small" className="secondaryBtnClassname" variant="outlined" onClick={onClose}>Cancel</Button>
                        <Button size="small" className="buttonClassname" variant="contained" onClick={() => onSubmit(groups)}>
                            {formData.masterName ? "Save" : "Add"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default MasterAdvFormDrawer;

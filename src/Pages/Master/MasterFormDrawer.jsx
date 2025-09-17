import React, { useState } from "react";
import { Drawer, Box, Typography, TextField, Button, IconButton, ToggleButtonGroup, ToggleButton, TextareaAutosize } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { commonTextFieldProps } from "../../Utils/globalfun";
import { Grid2x2, ListTodo } from "lucide-react";
import ColorPicker from "../../Components/Common/ColorPicker";

const MasterFormDrawer = ({ open, onClose, activeTab, onSubmit, formData, formattedData, setFormData, selectedRow }) => {

    const handleChange = (e) => {
        if (activeTab == "Advanced Master") {
        } else {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleColorSelect = (colorKey) => {
        setFormData((prev) => ({ ...prev, colorKey: colorKey }));
    };

    // Check if this is a priority or status master
    const isPriorityMaster = activeTab?.toLowerCase().includes('priority');
    const isStatusMaster = activeTab?.toLowerCase().includes('status');

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
                    
                    {/* Color Picker for Priority and Status Masters */}
                    {(isPriorityMaster || isStatusMaster) && (
                        <Box sx={{ mt: 2 }}>
                            <ColorPicker
                                selectedColor={formData.colorKey}
                                onColorSelect={handleColorSelect}
                                label={`${activeTab} Color`}
                                showPreview={true}
                                size="medium"
                            />
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                This color will be used for {activeTab.toLowerCase()} display in tasks and grids
                            </Typography>
                        </Box>
                    )}
                </>
                <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: '10px' }}>
                    <Button variant="outlined" className="secondaryBtnClassname" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        className="buttonClassname"
                        onClick={() => {
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

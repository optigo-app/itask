import React from "react";
import { Drawer, Box, Typography, TextField, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { commonTextFieldProps } from "../../Utils/globalfun";

const MasterFormDrawer = ({ open, onClose, activeTab,  onSubmit, formData, setFormData, selectedRow }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 400, padding: "10px 15px" }}>
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
                }}/>
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

                <Box sx={{ display: "flex", justifyContent: "end", marginTop: 3, gap: '10px' }}>
                    <Button variant="outlined" className="secondaryBtnClassname" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        className="buttonClassname"
                        onClick={() => onSubmit(selectedRow)}
                    >
                        {formData.name ? "Save" : "Add"}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default MasterFormDrawer;

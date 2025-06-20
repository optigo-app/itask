import React from "react";
import {
    Drawer,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
} from "@mui/material";

const statusOptions = {
    document: ["Pending", "Running", "Competed"],
    coder: ["Pending", "Code Running", "Code Competed"],
};

const priorityOptions = ["High", "Medium", "Low"];

const StatusDrawer = ({ open, onClose }) => {
    const [docStatus, setDocStatus] = React.useState("");
    const [docPriority, setDocPriority] = React.useState("");
    const [coderStatus, setCoderStatus] = React.useState("");
    const [coderPriority, setCoderPriority] = React.useState("");

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 300, p: 3 }}>
                {/* Document Section */}
                <Typography variant="h6" gutterBottom>Document</Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={docStatus} onChange={(e) => setDocStatus(e.target.value)} label="Status">
                        {statusOptions.document.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 4 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select value={docPriority} onChange={(e) => setDocPriority(e.target.value)} label="Priority">
                        {priorityOptions.map((priority) => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Divider sx={{ mb: 3 }} />

                {/* Coder Section */}
                <Typography variant="h6" gutterBottom>Coder</Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={coderStatus} onChange={(e) => setCoderStatus(e.target.value)} label="Status">
                        {statusOptions.coder.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select value={coderPriority} onChange={(e) => setCoderPriority(e.target.value)} label="Priority">
                        {priorityOptions.map((priority) => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Drawer>
    );
};

export default StatusDrawer;

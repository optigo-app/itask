import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Typography,
    IconButton,
    Paper,
    Box,
    TextField,
    Stack
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { commonTextFieldProps } from "../../Utils/globalfun";

const TaskDetailsModal = ({ open, onClose, employee }) => {
    const [searchText, setSearchText] = useState('');

    // 🔍 Filtered Tasks based on searchText
    const filteredTasks = useMemo(() => {
        if (!employee?.Tasks) return [];

        if (!searchText.trim()) return employee.Tasks;

        const lowerSearch = searchText.toLowerCase();
        return employee.Tasks.filter(task =>
            Object.values(task).some(val =>
                val?.toString().toLowerCase().includes(lowerSearch)
            )
        );
    }, [employee, searchText]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#f5f5f5",
                    borderBottom: "1px solid #e0e0e0",
                    pr: 2
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: '100%' }}
                    spacing={2}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Task Details
                    </Typography>
                    
                    <Box>
                        <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Search tasks..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ minWidth: 250 }}
                            {...commonTextFieldProps}
                        />
                    </Box>

                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    p: 0,
                    minHeight: 500,
                    maxHeight: 500,
                    overflowY: 'auto',
                }}

            >
                {employee ? (
                    <TableContainer component={Paper} className='muiTableTaContainer'>
                        <Table aria-label="task table" className='muiTable'>
                            <TableHead className='muiTableHead'>
                                <TableRow sx={{ backgroundColor: "#fafafa" }}>
                                    <TableCell width={20} sx={{ fontWeight: 600 }}>Sr#</TableCell>
                                    <TableCell width={250} sx={{ fontWeight: 600 }}>Task Name</TableCell>
                                    <TableCell width={150} sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell width={150} sx={{ fontWeight: 600 }}>Priority</TableCell>
                                    <TableCell width={150} sx={{ fontWeight: 600 }}>Category</TableCell>
                                    <TableCell width={60} sx={{ fontWeight: 600 }}>Estimate (hrs)</TableCell>
                                    <TableCell width={60} sx={{ fontWeight: 600 }}>Working (hrs)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTasks?.length > 0 ? (
                                    filteredTasks.map((task, index) => (
                                        <TableRow key={index} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{task.taskname}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{task.status}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{task.priority}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{task.category}</Typography>
                                            </TableCell>
                                            <TableCell>{task.estimate_hrs}</TableCell>
                                            <TableCell>{task.estimate1_hrsT}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No matching tasks found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsModal;

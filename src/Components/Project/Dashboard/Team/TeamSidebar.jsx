import { Box, Drawer, IconButton, Typography, TextField, Button, Autocomplete } from '@mui/material';
import { CircleX } from 'lucide-react';
import React, { useState } from 'react';
import './TeamSidebar.scss';
import { commonTextFieldProps } from '../../../../Utils/globalfun';

const TeamSidebar = ({ open, onClose, taskAssigneeData, onSave }) => {
    const [employee, setEmployee] = useState(null);
    const [role, setRole] = useState('');

    const handleSave = () => {
        onSave(employee, role);
        console.log('Saved:', { employee, role });
        onClose();
    };

    const handleCancel = () => {
        setEmployee(null);
        setRole('');
        onClose();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            className="TMainDrawer"
        >
            <Box className="tMainBox">
                <Box className="drawerHeader">
                    <Typography variant="h6" className='drawer-title'>Team Members</Typography>
                    <IconButton onClick={onClose}>
                        <CircleX />
                    </IconButton>
                </Box>
                <div
                    style={{
                        margin: "10px 0",
                        border: "1px dashed #7d7f85",
                        opacity: 0.3,
                    }}
                />
                <Box className="drawerContent">
                    <Box className="form-group">
                        <Typography
                            variant="subtitle1"
                            className="form-label"
                            htmlFor="taskName"
                        >
                            Team Member
                        </Typography>
                        <Autocomplete
                            value={employee}
                            onChange={(event, newValue) => setEmployee(newValue)}
                            disableClearable
                            options={taskAssigneeData}
                            getOptionLabel={(option) => `${option.firstname} ${option.lastname}`}
                            isOptionEqualToValue={(option, value) => option.id == value?.id}
                            renderInput={(params) => (
                                <TextField
                                    placeholder='Select Team Member'
                                    {...params}
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    {...commonTextFieldProps}
                                />
                            )}
                        />
                    </Box>
                    <Box className="form-group">
                        <Typography
                            variant="subtitle1"
                            className="form-label"
                            htmlFor="taskName"
                        >
                            Role
                        </Typography>
                        <TextField
                            placeholder='Enter Role'
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            {...commonTextFieldProps}
                        />
                    </Box>
                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleCancel} variant="outlined" className='secondaryBtnClassname' style={{ marginRight: '10px' }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} variant="contained" className='buttonClassname'>
                            Save
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

export default TeamSidebar;

import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    IconButton,
    Typography,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Paper
} from '@mui/material';
import { CircleX, Pencil, Trash2 } from 'lucide-react';
import './TeamSidebar.scss';
import { commonTextFieldProps } from '../../../../Utils/globalfun';
import DepartmentAssigneeAutocomplete from '../../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';

const TeamSidebar = ({ open, onClose, taskAssigneeData, selectedTeamMember, handleFinalSave }) => {
    console.log('selectedTeamMember: ', selectedTeamMember);
    const [employee, setEmployee] = useState(null);
    const [role, setRole] = useState('');
    const [teamList, setTeamList] = useState([]);
    console.log('teamList: ', teamList);
    const [editIndex, setEditIndex] = useState(null);
    console.log('employee: ', employee, role);

    const [employeeError, setEmployeeError] = useState(false);
    const [roleError, setRoleError] = useState(false);

    useEffect(() => {
        if (!open) resetForm();
        setEmployee(selectedTeamMember);
        setRole(selectedTeamMember?.rolename)
    }, [open]);

    const validate = () => {
        let isValid = true;
        setEmployeeError(false);
        setRoleError(false);
        if (!employee) {
            setEmployeeError(true);
            isValid = false;
        }
        if (!role.trim()) {
            setRoleError(true);
            isValid = false;
        }
        return isValid;
    };

    function handleSave() {
        if (!validate()) return;
        const newMember = { employee, role: role.trim() };
        let updatedList;
        if (editIndex !== null) {
            updatedList = [...teamList];
            updatedList[editIndex] = newMember;
        } else {
            updatedList = [...teamList, newMember];
        }
        setTeamList(updatedList);
        resetForm();
    }

    const resetForm = () => {
        setEmployee(null);
        setRole('');
        setEditIndex(null);
        setEmployeeError(false);
        setRoleError(false);
    };

    const handleEdit = (index) => {
        const member = teamList[index];
        setEmployee(member.employee);
        setRole(member.role);
        setEditIndex(index);
        setEmployeeError(false);
        setRoleError(false);
    };

    const handleDelete = (index) => {
        const updated = [...teamList];
        updated.splice(index, 1);
        setTeamList(updated);
    };

    const handleRoleChange = (e) => {
        const value = e.target.value;
        if (value.includes('#') || value.includes(',')) return;
        setRole(value);
        if (value.trim()) setRoleError(false);
    };

    const handleEmployeeChange = (newValue) => {
        setEmployee(newValue);
        if (newValue) setEmployeeError(false);
    };


    return (
        <Drawer anchor="right" open={open} onClose={onClose} className="TMainDrawer">
            <Box className="tMainBox" p={2} width={400}>
                <Box className="drawerHeader" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" className="drawer-title">Team Members</Typography>
                    <IconButton onClick={() => { onClose(); resetForm(); }}><CircleX /></IconButton>
                </Box>

                <div style={{ margin: "10px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />

                <Box className="drawerContent">
                    <Box className="form-group">
                        <DepartmentAssigneeAutocomplete
                            value={employee}
                            options={taskAssigneeData}
                            label="Team Member"
                            placeholder="Select assignee"
                            multiple={false}
                            onChange={handleEmployeeChange}
                            error={employeeError}
                            helperText={employeeError ? 'Please select a team member' : ''}
                        />
                    </Box>

                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">Role</Typography>
                        <TextField
                            name="role"
                            placeholder="Enter Role"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={role}
                            onChange={handleRoleChange}
                            error={roleError}
                            helperText={roleError ? 'Please enter a valid role (no # or ,)' : ''}
                            {...commonTextFieldProps}
                        />
                    </Box>

                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleSave} variant="contained" className="buttonClassname">
                            {editIndex !== null ? 'Update' : 'Add'}
                        </Button>
                    </Box>

                    {teamList.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="subtitle2" gutterBottom>Team List</Typography>
                            <TableContainer component={Paper} sx={{
                                mt: 2,
                                boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                                borderRadius: "8px",
                            }}>
                                <Table size="small" className="AssigneeTable">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Member</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teamList.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{`${item.employee?.firstname || ''} ${item.employee?.lastname || ''}`.trim()}</TableCell>
                                                <TableCell>{item.role}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={() => handleEdit(index)}><Pencil size={18} /></IconButton>
                                                    <IconButton onClick={() => handleDelete(index)}><Trash2 size={18} /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box mt={2} display="flex" justifyContent="flex-end">
                                <Button onClick={resetForm} variant="outlined" className="secondaryBtnClassname" sx={{ mr: 1 }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => handleFinalSave(teamList)} variant="contained" className="buttonClassname">
                                    Save
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
};

export default TeamSidebar;

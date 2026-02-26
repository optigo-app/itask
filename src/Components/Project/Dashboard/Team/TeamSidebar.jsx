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
    Paper,
    Checkbox
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { CircleX, Pencil, Trash2 } from 'lucide-react';
import './TeamSidebar.scss';
import { commonTextFieldProps } from '../../../../Utils/globalfun';
import DepartmentAssigneeAutocomplete from '../../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';

const TeamSidebar = ({ open, onClose, taskAssigneeData, selectedTeamMember, teamMemberData, handleFinalSave }) => {
    const theme = useTheme();
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [role, setRole] = useState('');
    const [limitedAccess, setLimitedAccess] = useState(false);
    const [isReadonly, setIsReadonly] = useState(false);
    const [teamList, setTeamList] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [duplicateError, setDuplicateError] = useState(false);
    const [employeeError, setEmployeeError] = useState(false);
    const [roleError, setRoleError] = useState(false);

    useEffect(() => {
        if (!open) return;
        if (selectedTeamMember && Object.keys(selectedTeamMember).length > 0) {
            setSelectedEmployees([selectedTeamMember]);
            setRole(selectedTeamMember?.rolename || '');
            setLimitedAccess(selectedTeamMember?.islimitedaccess === 1);
            setIsReadonly(selectedTeamMember?.isreadonly === 1);
        } else {
            resetForm();
        }
    }, [open, selectedTeamMember]);

    const validate = () => {
        let isValid = true;
        setEmployeeError(false);
        setDuplicateError(false);
        setRoleError(false);

        if (!selectedEmployees || selectedEmployees.length === 0) {
            setEmployeeError(true);
            isValid = false;
        }

        if (!role?.trim()) {
            setRoleError(true);
            isValid = false;
        }

        selectedEmployees.forEach(emp => {
            // Duplicate check
            const isAlreadyInMain = teamMemberData?.some(item =>
                item?.assigneeid === emp?.id && (editIndex === null || item.id !== selectedTeamMember?.id)
            );
            const isAlreadyInLocal = teamList?.some((item, idx) =>
                item?.employee?.id === emp?.id && idx !== editIndex
            );

            if (isAlreadyInMain || isAlreadyInLocal) {
                setDuplicateError(true);
                isValid = false;
            }
        });

        return isValid;
    };

    const permissionCheckboxSx = {
        color: alpha(theme.palette.primary.main, 0.65),
        "&.Mui-checked": {
            color: theme.palette.primary.main,
        },
    };

    function handleSave() {
        if (!validate()) return;

        const roleList = role.split(',').map(r => r.trim()).filter(r => r !== "");
        const newMembers = selectedEmployees.map((emp, index) => {
            let memberRole = role;

            // Smart Mapping Logic
            if (roleList.length === selectedEmployees.length) {
                // 1:1 mapping
                memberRole = roleList[index];
            } else if (roleList.length > 0) {
                // If only one role provided, or mismatched counts, use the first role if multiple provided
                // or the full string if only one item. Actually, if only one role in list, use it.
                // If count doesn't match and list > 1, we fallback to first role for simplicity or full string.
                // Re-reading user requirement: "flag check then it add in all" and "role comma separated"
                // Let's stick to 1:1 if match, else use first role if single, else use full string.
                memberRole = roleList.length === 1 ? roleList[0] : (roleList[index] || roleList[0]);
            }

            return {
                employee: emp,
                role: memberRole?.trim(),
                limitedAccess: limitedAccess === true,
                isReadonly: isReadonly === true,
            };
        });

        let updatedList;
        if (editIndex !== null) {
            updatedList = [...teamList];
            updatedList[editIndex] = newMembers[0];
        } else {
            updatedList = [...teamList, ...newMembers];
        }
        setTeamList(updatedList);
        resetForm();
    }

    const handleAccessToggle = (index, checked) => {
        const updated = [...teamList];
        updated[index].limitedAccess = checked;
        setTeamList(updated);

        if (editIndex === index) {
            setLimitedAccess(checked);
        }
    };

    const handleReadOnlyToggle = (index, checked) => {
        const updated = [...teamList];
        updated[index].isReadonly = checked;
        setTeamList(updated);

        if (editIndex === index) {
            setIsReadonly(checked);
        }
    };

    const resetForm = () => {
        setSelectedEmployees([]);
        setRole('');
        setLimitedAccess(false);
        setIsReadonly(false);
        setEditIndex(null);
        setEmployeeError(false);
        setRoleError(false);
        setDuplicateError(false);
    };

    const handleEdit = (index) => {
        const member = teamList[index];
        setSelectedEmployees([member.employee]);
        setRole(member.role);
        setLimitedAccess(member?.limitedAccess === true);
        setIsReadonly(member?.isReadonly === true);
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
        if (value.includes('#')) return; // Allow commas now
        setRole(value);
        if (value?.trim()) setRoleError(false);
    };

    const handleEmployeeChange = (newValues) => {
        setSelectedEmployees(newValues);
        setEmployeeError(false);
        setDuplicateError(false);
    };

    const filteredOptions = taskAssigneeData?.filter(option => {
        // Exclude if already in teamMemberData (main project list)
        const inMain = teamMemberData?.some(m => String(m.assigneeid) === String(option.id));
        // Exclude if already in teamList (local list in sidebar)
        const inLocal = teamList?.some(m => String(m.employee?.id) === String(option.id));

        // However, if we are EDITING, we should allow the current editing member to be in the list?
        // Actually, if we are editing, we are just changing the role/flags of an already added member.
        // But the autocomplete is used for ADDING new members. 
        // In the edit case (editIndex !== null), we set the selectedEmployees to that one member.

        return !inMain && !inLocal;
    }) || [];

    const handleClose = () => {
        onClose();
        resetForm();
        setTeamList([]);
    }

    return (
        <Drawer anchor="right" open={open} onClose={handleClose} className="TMainDrawer">
            <Box className="tMainBox" p={2} width={400}>
                <Box className="drawerHeader" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" className="drawer-title">Team Members</Typography>
                    <IconButton onClick={() => handleClose()}><CircleX /></IconButton>
                </Box>

                <div style={{ margin: "10px 0", border: "1px dashed #7d7f85", opacity: 0.3 }} />

                <Box className="drawerContent">
                    <Box className="form-group">
                        <DepartmentAssigneeAutocomplete
                            value={selectedEmployees}
                            options={filteredOptions}
                            label="Team Member"
                            placeholder="Select assignees"
                            multiple={true}
                            onChange={handleEmployeeChange}
                            error={employeeError || duplicateError}
                            helperText={
                                employeeError
                                    ? 'Please select at least one team member'
                                    : duplicateError
                                        ? 'One or more team members are already added'
                                        : ''
                            }
                        />
                    </Box>

                    <Box className="form-group">
                        <Typography variant="subtitle1" className="form-label">Role</Typography>
                        <TextField
                            name="role"
                            placeholder="Enter Role (e.g. Dev, QA)"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            value={role}
                            onChange={handleRoleChange}
                            error={roleError}
                            helperText={roleError ? 'Please enter a valid role' : ''}
                            {...commonTextFieldProps}
                        />
                    </Box>

                    <Box mt={1} display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={limitedAccess}
                                onChange={(e) => setLimitedAccess(e.target.checked)}
                                sx={permissionCheckboxSx}
                            />
                            <Typography variant="body2">Limited Access</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={isReadonly}
                                onChange={(e) => setIsReadonly(e.target.checked)}
                                sx={permissionCheckboxSx}
                            />
                            <Typography variant="body2">Read Only</Typography>
                        </Box>
                    </Box>

                    <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button onClick={handleSave} variant="contained" className="buttonClassname" disabled={selectedEmployees.length === 0}>
                            {editIndex !== null ? 'Update' : 'Add to List'}
                        </Button>
                    </Box>

                    {teamList.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="subtitle2" gutterBottom>Team List</Typography>
                            <TableContainer
                                component={Paper}
                                sx={{
                                    mt: 2,
                                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                                    borderRadius: "8px",
                                }}
                            >
                                <Table size="small" className="AssigneeTable">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Member</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>Limited Access</TableCell>
                                            <TableCell>Read Only</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teamList?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {`${item.employee?.firstname || ""} ${item.employee?.lastname || ""}`.trim()}
                                                </TableCell>
                                                <TableCell>{item.role}</TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={item.limitedAccess || false}
                                                        onChange={(e) => handleAccessToggle(index, e.target.checked)}
                                                        sx={permissionCheckboxSx}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={item.isReadonly || false}
                                                        onChange={(e) => handleReadOnlyToggle(index, e.target.checked)}
                                                        sx={permissionCheckboxSx}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={() => handleEdit(index)}>
                                                        <Pencil size={18} />
                                                    </IconButton>
                                                    <IconButton onClick={() => handleDelete(index)}>
                                                        <Trash2 size={18} />
                                                    </IconButton>
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

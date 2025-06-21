import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Divider,
} from '@mui/material';
import { commonTextFieldProps } from '../../Utils/globalfun';

const DynamicMasterDrawer = ({ groups, setGroups, handleMasterSave }) => {
    const [hideAddGroupBtn, setHideAddGroupBtn] = useState(false);

    const addGroup = () => {
        setGroups(prev => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                masters: []
            }
        ]);
        setHideAddGroupBtn(true);
    };

    const removeGroup = (id) => {
        setGroups(prev => prev.filter(group => group.id !== id));
        setHideAddGroupBtn(false);
    };

    const updateGroupName = (id, name) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === id ? { ...group, name } : group
            )
        );
    };

    const addMaster = (groupId) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        masters: [
                            ...group.masters,
                            {
                                id: Date.now(),
                                name: '',
                                values: ''
                            }
                        ]
                    }
                    : group
            )
        );
    };

    const removeMaster = (groupId, masterId) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        masters: group.masters.filter(master => master.id !== masterId)
                    }
                    : group
            )
        );
    };

    const updateMaster = (groupId, masterId, field, value) => {
        setGroups(prev =>
            prev.map(group =>
                group.id === groupId
                    ? {
                        ...group,
                        masters: group.masters.map(master =>
                            master.id === masterId ? { ...master, [field]: value } : master
                        )
                    }
                    : group
            )
        );
    };
    

    return (
        <Box sx={{ mt: 2 }}>
            {groups?.map(group => (
                <Paper
                    key={group.id}
                    sx={{
                        p: 2, mb: 3,
                        mt: 2,
                        borderRadius: '8px',
                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px, rgba(0, 0, 0, 0.03) 0px 0px 0px 1px;'
                    }}
                    elevation={2}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="end" mb={2}>
                        <Box className="form-group">
                            <Typography
                                variant="subtitle1"
                                className="form-label"
                                htmlFor="taskName"
                            >
                                Group Name
                            </Typography>
                            <TextField
                                placeholder='Enter Group Name'
                                variant="outlined"
                                size="small"
                                value={group.name}
                                onChange={e => updateGroupName(group.id, e.target.value)}
                                {...commonTextFieldProps}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => removeGroup(group.id)}
                                className='dangerbtnClassname'
                            >
                                Remove Group
                            </Button>
                        </Box>
                    </Box>

                    {group.masters.map(master => (
                        <Box key={master.id} sx={{ borderTop: '1px solid #ccc', pt: 2, mt: 2 }}>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="taskName"
                                >
                                    Master Name
                                </Typography>
                                <TextField
                                    placeholder='Enter Master Name'
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    value={master.name}
                                    onChange={e => updateMaster(group.id, master.id, 'name', e.target.value)}
                                    {...commonTextFieldProps}
                                />
                            </Box>
                            <Box className="form-group">
                                <Typography
                                    variant="subtitle1"
                                    className="form-label"
                                    htmlFor="taskName"
                                >
                                    Master Values (comma or newline separated)
                                </Typography>
                                <TextField
                                    name="description"
                                    value={master.values}
                                    onChange={e => updateMaster(group.id, master.id, 'values', e.target.value)}
                                    multiline
                                    rows={3}
                                    placeholder="e.g. Pending, Running, Completed"
                                    {...commonTextFieldProps}
                                    sx={{
                                        marginBottom: '10px'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() => removeMaster(group.id, master.id)}
                                    className='dangerbtnClassname'
                                >
                                    Remove Master
                                </Button>
                            </Box>
                        </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => addMaster(group.id)}
                        className='buttonClassname'
                    >
                        + Add Master
                    </Button>
                </Paper>
            ))}
            {!hideAddGroupBtn &&
                <Button fullWidth variant="contained" color="primary" onClick={addGroup} className='buttonClassname'>
                    + Add Group
                </Button>
            }
        </Box>
    );
};

export default DynamicMasterDrawer;

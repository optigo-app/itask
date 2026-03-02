import React, { memo, useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, TextField } from '@mui/material';
import { X, Upload } from 'lucide-react';
import DepartmentAssigneeAutocomplete from '../../Components/ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import CustomAutocomplete from '../../Components/ShortcutsComponent/CustomAutocomplete';
import { commonTextFieldProps } from '../../Utils/globalfun';
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from 'dayjs/plugin/timezone';

const BugTrackingForm = memo(({
    isFormOpen,
    selectedTask,
    selectedBugId,
    formData,
    handleChange,
    handleAttributeChange,
    handleSolvedByChange,
    handleTestedByChange,
    handleDateChange,
    handleSubmit,
    handleImageUpload,
    handleDragOver,
    handleDrop,
    taskBugStatusData,
    taskBugPriorityData,
    taskAssigneeData,
    setFormOpen,
    handleRemoveImage,
    isSubmitting
}) => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [titleError, setTitleError] = useState(false);
    const [titleHelperText, setTitleHelperText] = useState('');
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Reset error state when form opens or bug changes
    useEffect(() => {
        setTitleError(false);
        setTitleHelperText('');
        setHasAttemptedSubmit(false);
    }, [isFormOpen, selectedBugId]);

    if (!isFormOpen || !selectedTask) return null;

    const handleTitleChange = (e) => {
        handleChange(e);

        // Only validate if user has already attempted to submit
        if (hasAttemptedSubmit) {
            const value = e.target.value.trim();

            if (!value) {
                setTitleError(true);
                setTitleHelperText('Bug title is required');
            } else if (value.length < 3) {
                setTitleError(true);
                setTitleHelperText('Bug title must be at least 3 characters');
            } else {
                setTitleError(false);
                setTitleHelperText('');
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        // Validate bug title before submit
        const titleValue = formData.bugtitle?.trim();
        if (!titleValue) {
            setTitleError(true);
            setTitleHelperText('Bug title is required');
            return;
        } else if (titleValue.length < 3) {
            setTitleError(true);
            setTitleHelperText('Bug title must be at least 3 characters');
            return;
        }

        // If validation passes, call the original handleSubmit
        handleSubmit(e);

        // Reset error state after successful submit
        setTitleError(false);
        setTitleHelperText('');
        setHasAttemptedSubmit(false);
    };

    const renderAutocomplete = (label, name, value, placeholder, options, onChange, error = false, helperText = '', disabled) => (
        <CustomAutocomplete
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            disabled={disabled}
            error={error}
            helperText={helperText}
            getOptionLabel={(option) => option?.labelname || ''}
        />
    );

    return (
        <Box className="column right-column" sx={{ width: '400px', borderLeft: '1px solid #eee', bgcolor: '#fff', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box className="form-header" sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedBugId && String(selectedBugId).startsWith('temp') ? 'New Bug' : selectedBugId ? 'Edit Bug' : 'New Bug'}</Typography>
                <IconButton size="small" onClick={() => setFormOpen(false)}><X size={20} /></IconButton>
            </Box>

            <Box className="bug-form-container" sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                <form onSubmit={handleFormSubmit}>

                    {/* Bug Title */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
                            Bug Title <span style={{ color: '#d32f2f', fontSize: '1.1em' }}>*</span>
                        </Typography>
                        <TextField
                            name="bugtitle"
                            value={formData.bugtitle}
                            onChange={handleTitleChange}
                            placeholder="e.g. Button not clicking..."
                            fullWidth
                            size="small"
                            error={titleError}
                            helperText={titleHelperText}
                            {...commonTextFieldProps}
                        />
                    </Box>

                    {/* Solved By (Multi-select) */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Solved By</Typography>
                        <DepartmentAssigneeAutocomplete
                            multiple
                            options={taskAssigneeData || []}
                            value={formData.solvedby || []}
                            onChange={handleSolvedByChange}
                            label=""
                            placeholder="Select Assignees"
                            limitTags={3}
                        />
                    </Box>

                    {/* Tested By */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Tested By</Typography>
                        <DepartmentAssigneeAutocomplete
                            value={formData.testby || null}
                            options={taskAssigneeData || []}
                            label=""
                            placeholder="Select assignee"
                            onChange={handleTestedByChange}
                        />
                    </Box>

                    {/* Status & Priority Row */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Bug Status</Typography>
                            {renderAutocomplete('', 'busstatusid', formData.busstatusid, 'Select', taskBugStatusData, (e) => handleAttributeChange(e))}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Bug Priority</Typography>
                            {renderAutocomplete('', 'bugpriorityid', formData.bugpriorityid, 'Select', taskBugPriorityData, (e) => handleAttributeChange(e))}
                        </Box>
                    </Box>

                    {/* Description */}
                    <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Description</Typography>
                        <TextField
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Describe the bug..."
                            {...commonTextFieldProps}
                        />
                    </Box>

                    {/* Image Upload */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>Screenshot</Typography>
                        <Box
                            sx={{
                                border: '2px dashed #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                bgcolor: '#fafafa',
                                '&:hover': { borderColor: '#7367f0', bgcolor: '#f5f5f9' },
                                position: 'relative',
                                minHeight: '120px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="bug-upload"
                                hidden
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="bug-upload" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {formData.imagePreview ? (
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.preventDefault(); handleRemoveImage(); }}
                                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                        >
                                            <X size={16} />
                                        </IconButton>
                                        <img src={formData.imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '130px', borderRadius: 8, display: 'block', marginBottom: '8px' }} />
                                        <Typography variant="caption" sx={{ color: '#7367f0', fontWeight: 600 }}>Change Image</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ py: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Upload size={24} color="#999" />
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                                            Click to Upload <br /> or Drag & Drop / Paste
                                        </Typography>
                                    </Box>
                                )}
                            </label>
                        </Box>
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={!selectedTask?.taskid || isSubmitting}
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 600, textTransform: 'none', fontSize: '1rem', boxShadow: '0 4px 14px 0 rgba(115, 103, 240, 0.3)' }}
                    >
                        {isSubmitting ? 'Saving...' : (selectedBugId && !String(selectedBugId).startsWith('temp') ? 'Update Bug' : 'Add Bug')}
                    </Button>

                </form>
            </Box>
        </Box>
    );
});

export default BugTrackingForm;

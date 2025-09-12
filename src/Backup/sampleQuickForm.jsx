import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Stack,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add, Close, Save, Clear } from '@mui/icons-material';
import dayjs from 'dayjs';

// Sample data - replace with actual data from your APIs
const sampleProjects = [
  { id: 1, taskPr: 'Project Alpha', taskname: 'Module 1', projectid: 1 },
  { id: 2, taskPr: 'Project Beta', taskname: 'Module 2', projectid: 2 },
  { id: 3, taskPr: 'Project Gamma', taskname: 'Module 3', projectid: 3 },
];

const sampleCategories = [
  { id: 1, labelname: 'Development' },
  { id: 2, labelname: 'Testing' },
  { id: 3, labelname: 'Design' },
  { id: 4, labelname: 'Meeting' },
];

const samplePriorities = [
  { id: 1, labelname: 'High' },
  { id: 2, labelname: 'Medium' },
  { id: 3, labelname: 'Low' },
];

const sampleStatuses = [
  { id: 1, labelname: 'To Do' },
  { id: 2, labelname: 'In Progress' },
  { id: 3, labelname: 'Review' },
  { id: 4, labelname: 'Completed' },
];

const sampleAssignees = [
  { id: 1, name: 'John Doe', department: 'Development' },
  { id: 2, name: 'Jane Smith', department: 'Design' },
  { id: 3, name: 'Mike Johnson', department: 'Testing' },
  { id: 4, name: 'Sarah Wilson', department: 'Management' },
];

const SampleQuickForm = () => {
  const [formData, setFormData] = useState({
    taskName: '',
    project: null,
    category: null,
    priority: null,
    status: null,
    assignees: [],
    dueDate: dayjs().hour(20).minute(0).second(0), // Current date at 8 PM
    startDate: dayjs(), // Current date and time
    description: '',
    isMilestone: false,
    estimateHours: '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    
    if (!formData.project) {
      newErrors.project = 'Project/Module is required';
    }
    
    if (formData.assignees.length === 0) {
      newErrors.assignees = 'At least one assignee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Here you would typically call your API
      alert('Task created successfully!');
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      taskName: '',
      project: null,
      category: null,
      priority: null,
      status: null,
      assignees: [],
      dueDate: dayjs().hour(20).minute(0).second(0), // Current date at 8 PM
      startDate: dayjs(), // Current date and time
      description: '',
      isMilestone: false,
      estimateHours: '',
    });
    setErrors({});
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, margin: '20px auto', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Quick Task Add Form
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new task quickly with essential information
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            {/* Task Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name *"
                value={formData.taskName}
                onChange={(e) => handleInputChange('taskName', e.target.value)}
                error={!!errors.taskName}
                helperText={errors.taskName}
                placeholder="Enter task name"
                size="small"
              />
            </Grid>

            {/* Project/Module */}
            <Grid item xs={12}>
              <Autocomplete
                value={formData.project}
                onChange={(_, newValue) => handleInputChange('project', newValue)}
                options={sampleProjects}
                getOptionLabel={(option) => `${option.taskPr}/${option.taskname}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Project/Module *"
                    error={!!errors.project}
                    helperText={errors.project}
                    placeholder="Select Project/Module"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <strong>{option.taskPr}</strong>/{option.taskname}
                  </li>
                )}
              />
            </Grid>

            {/* Category and Priority */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={formData.category}
                onChange={(_, newValue) => handleInputChange('category', newValue)}
                options={sampleCategories}
                getOptionLabel={(option) => option.labelname}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    placeholder="Select Category"
                    size="small"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                value={formData.priority}
                onChange={(_, newValue) => handleInputChange('priority', newValue)}
                options={samplePriorities}
                getOptionLabel={(option) => option.labelname}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Priority"
                    placeholder="Select Priority"
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Chip 
                      label={option.labelname} 
                      size="small"
                      color={
                        option.labelname === 'High' ? 'error' : 
                        option.labelname === 'Medium' ? 'warning' : 'success'
                      }
                    />
                  </li>
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={formData.status}
                onChange={(_, newValue) => handleInputChange('status', newValue)}
                options={sampleStatuses}
                getOptionLabel={(option) => option.labelname}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Status"
                    placeholder="Select Status"
                    size="small"
                  />
                )}
              />
            </Grid>

            {/* Estimate Hours */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimate Hours"
                type="number"
                value={formData.estimateHours}
                onChange={(e) => handleInputChange('estimateHours', e.target.value)}
                placeholder="0"
                size="small"
                inputProps={{ min: 0, step: 0.5 }}
              />
            </Grid>

            {/* Assignees */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                value={formData.assignees}
                onChange={(_, newValue) => handleInputChange('assignees', newValue)}
                options={sampleAssignees}
                getOptionLabel={(option) => `${option.name} (${option.department})`}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign To *"
                    error={!!errors.assignees}
                    helperText={errors.assignees}
                    placeholder="Select assignees"
                    size="small"
                  />
                )}
              />
            </Grid>



            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add task description..."
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClear}
          color="secondary"
        >
          Clear
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          color="primary"
        >
          Create Task
        </Button>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Stats:
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip 
            label={`Task Name: ${formData.taskName || 'Not set'}`} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            label={`Project: ${formData.project?.taskPr || 'Not selected'}`} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            label={`Assignees: ${formData.assignees.length}`} 
            size="small" 
            variant="outlined" 
          />
          <Chip 
            label={`Priority: ${formData.priority?.labelname || 'Not set'}`} 
            size="small" 
            variant="outlined" 
          />
        </Stack>
      </Box>
    </Paper>
  );
};

export default SampleQuickForm;

import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button
} from '@mui/material';
import { CircleX } from 'lucide-react';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import CustomAutocomplete from '../ShortcutsComponent/CustomAutocomplete';

const ModuleDrawerForm = ({
  rootSubrootflagval,
  formValues,
  handleChange,
  handleDateChange,
  handleClear,
  handleSubmit,
  isLoading,
  isTaskNameEmpty,
  isDuplicateTask,
  teams,
  projectData,
  taskCategory,
  statusData,
  priorityData,
  commonTextFieldProps,
  renderAutocomplete,
  renderDateField
}) => {
  return (
    <Box className="pr_drawer-container">
      <Box className="drawer-header">
        <Typography variant="h6" className="drawer-title">
          {rootSubrootflagval?.Task === 'AddTask' ? 'Add Project Module' : 'Edit Project Module'}
        </Typography>
        <IconButton onClick={handleClear}>
          <CircleX />
        </IconButton>
      </Box>

      <div
        style={{
          margin: '10px 0',
          border: '1px dashed #7d7f85',
          opacity: 0.3
        }}
      />

      <Grid container spacing={1} className="form-row">
        <Grid item xs={12}>
          {renderAutocomplete('Project', 'project', formValues.project, 'Select Project', projectData, handleChange)}
        </Grid>

        <Grid item xs={12}>
          <Box className="form-group">
            <Typography
              variant="subtitle1"
              className="form-label"
              htmlFor="taskName"
            >
              Module
            </Typography>
            <TextField
              name="taskName"
              placeholder="Enter task name"
              value={formValues.taskName}
              onChange={handleChange}
              {...commonTextFieldProps}
              error={isTaskNameEmpty || isDuplicateTask}
              helperText={
                isTaskNameEmpty
                  ? 'Module name is required.'
                  : isDuplicateTask
                  ? 'This module name already exists for the selected project.'
                  : ''
              }
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <DepartmentAssigneeAutocomplete
            value={formValues?.createdBy}
            options={teams}
            label="Created By"
            placeholder="Select assignees"
            limitTags={2}
            onChange={(newValue) =>
              handleChange({ target: { name: 'createdBy', value: newValue } })
            }
            disabled
          />
        </Grid>

        <Grid item xs={12}>
          {renderAutocomplete('Category', 'category', formValues.category, 'Select Category', taskCategory, handleChange)}
        </Grid>

        <Grid item xs={12}>
          {renderAutocomplete('Status', 'status', formValues.status, 'Select Status', statusData, handleChange)}
        </Grid>

        <Grid item xs={12}>
          <CustomAutocomplete
            label="Priority"
            name="priority"
            value={formValues.priority}
            onChange={handleChange}
            options={priorityData}
            placeholder="Select Priority"
          />
        </Grid>

        {[
          { label: 'Start Date', name: 'startDate' },
          { label: 'Deadline Date', name: 'dueDate' }
        ].map(({ label, name }) => (
          <Grid item xs={12} key={name}>
            {renderDateField(label, name, formValues[name], handleDateChange)}
          </Grid>
        ))}

        <Grid item xs={12}>
          <Box className="form-group">
            <Typography variant="subtitle1" className="form-label">
              Description
            </Typography>
            <TextField
              name="description"
              value={formValues.description}
              onChange={handleChange}
              multiline
              rows={2}
              placeholder="Add a description"
              {...commonTextFieldProps}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mt: 3, textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{ marginRight: '10px' }}
              className="secondaryBtnClassname"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={isLoading || isTaskNameEmpty || isDuplicateTask}
              onClick={() => handleSubmit({ module: true })}
              className="primary-btn"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModuleDrawerForm;

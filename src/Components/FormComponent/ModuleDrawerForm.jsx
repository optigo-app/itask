import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import { CircleX } from 'lucide-react';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import CustomAutocomplete from '../ShortcutsComponent/CustomAutocomplete';
import dayjs from 'dayjs';

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
  isCategoryEmpty,
  isDeadlineEmpty,
  openDeadlineMenuSignal,
  teams,
  projectData,
  taskCategory,
  statusData,
  priorityData,
  commonTextFieldProps,
  renderAutocomplete,
  renderDateField
}) => {
  const quickBtnRef = useRef(null);
  const [deadlineMenuAnchorEl, setDeadlineMenuAnchorEl] = useState(null);
  const isDeadlineMenuOpen = Boolean(deadlineMenuAnchorEl);

  const openDeadlineMenu = (event) => {
    setDeadlineMenuAnchorEl(event?.currentTarget || quickBtnRef.current);
  };

  const closeDeadlineMenu = () => {
    setDeadlineMenuAnchorEl(null);
  };

  const applyDeadlineQuickAction = (action) => {
    if (action === 'clear') {
      handleDateChange(null, 'dueDate');
      closeDeadlineMenu();
      return;
    }

    const base = dayjs();
    const newValue =
      action === 'today'
        ? base
        : action === 'tomorrow'
          ? base.add(1, 'day')
          : action === 'week'
            ? base.add(7, 'day')
            : base;

    handleDateChange(newValue, 'dueDate');
    closeDeadlineMenu();
  };

  useEffect(() => {
    if (!openDeadlineMenuSignal) return;
    if (formValues?.dueDate) return;
    if (!quickBtnRef.current) return;
    setDeadlineMenuAnchorEl(quickBtnRef.current);
  }, [openDeadlineMenuSignal]);

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
          {renderAutocomplete(
            'Category',
            'category',
            formValues.category,
            'Select Category',
            taskCategory,
            handleChange,
            isCategoryEmpty,
            isCategoryEmpty ? 'Category is required.' : ''
          )}
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
            {name === 'dueDate' ? (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography className="form-label" variant="subtitle1">
                    {label}
                  </Typography>
                  <Button
                    ref={quickBtnRef}
                    size="small"
                    variant="text"
                    className="varientTextBtn"
                    onClick={openDeadlineMenu}
                    sx={{ color: '#685dd8 !important' }}
                  >
                    Quick
                  </Button>
                </Box>

                {renderDateField('', name, formValues[name], handleDateChange)}

                <Menu
                  anchorEl={deadlineMenuAnchorEl}
                  open={isDeadlineMenuOpen}
                  onClose={closeDeadlineMenu}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      mt: 0.5,
                      borderRadius: '12px',
                      border: '1px solid rgba(115, 103, 240, 0.18)',
                      boxShadow: '0 10px 30px rgba(15, 20, 34, 0.15)',
                      overflow: 'hidden',
                      '& .MuiMenuItem-root': {
                        fontFamily: '"Public Sans", sans-serif',
                        fontSize: '14px',
                        borderRadius: '10px',
                        mx: 0.5,
                        my: 0.25,
                      },
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: 'rgba(115, 103, 240, 0.08)',
                      },
                    },
                  }}
                  MenuListProps={{
                    sx: { p: 0.5 },
                  }}
                >
                  <MenuItem onClick={() => applyDeadlineQuickAction('today')}>Today</MenuItem>
                  <MenuItem onClick={() => applyDeadlineQuickAction('tomorrow')}>Tomorrow</MenuItem>
                  <MenuItem onClick={() => applyDeadlineQuickAction('week')}>+7 days</MenuItem>
                  <MenuItem onClick={() => applyDeadlineQuickAction('clear')}>Clear</MenuItem>
                </Menu>
              </>
            ) : (
              renderDateField(label, name, formValues[name], handleDateChange)
            )}
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
              disabled={isLoading || isTaskNameEmpty || isDuplicateTask || isCategoryEmpty}
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

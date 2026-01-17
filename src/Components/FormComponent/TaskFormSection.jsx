import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Stack,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import dayjs from 'dayjs';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import EstimateInput from '../../Utils/Common/EstimateInput';
import CustomSwitch from '../../Utils/Common/CustomSwitch';
import { useLocation } from 'react-router-dom';

const TaskFormSection = ({
  taskType,
  formValues,
  prModule,
  allDayShow = false,
  handleChange,
  handleDateChange,
  handleEstimateChange,
  isTaskNameEmpty,
  isDuplicateTask,
  isCategoryEmpty,
  openDeadlineMenuSignal,
  taskCategory,
  statusData,
  secStatusData,
  priorityData,
  teams,
  prModuleMaster,
  renderAutocomplete,
  renderDateField,
  renderTextField,
  commonTextFieldProps,
  handleMeetingDt,
}) => {
  const location = useLocation();
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
    <Box>
      {taskType === 'single' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(formValues?.milestoneChecked)}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: 'milestoneChecked',
                          value: e.target.checked ? 1 : 0
                        }
                      })
                    }
                    color="primary"
                    className="textfieldsClass milestone-checkbox"
                  />
                }
                label="Milestone"
                className="milestone-label"
              />
              {allDayShow &&
                <Box className="form-group">
                  <Typography
                    variant="subtitle1"
                    className="form-label"
                    htmlFor="title"
                  >
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <CustomSwitch
                      checked={formValues.isAllDay === 1}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: 'isAllDay',
                            value: e.target.checked ? 1 : 0
                          }
                        })
                      }
                    />
                    <Typography>All Day</Typography>
                  </Stack>
                </Box>
              }
            </Box>
            {formValues?.taskName && location?.pathname?.includes("/myCalendar") &&
              <Box>
                {formValues.title != "" &&
                  <Grid item xs={12}>
                    <Button size='small' className="meetingDtBtn" variant="text" onClick={() => handleMeetingDt(formValues)}>
                      Meeting Detail
                    </Button>
                  </Grid>
                }
              </Box>
            }
          </Box>

          <Grid container spacing={1} className="form-row">
            <Grid item xs={12} md={12}>
              {renderTextField(
                'Task Name',
                'taskName',
                formValues.taskName,
                'Enter task name',
                isTaskNameEmpty || isDuplicateTask,
                isTaskNameEmpty
                  ? 'Task name is required.'
                  : isDuplicateTask
                    ? 'This taskname already exists for the selected module.'
                    : '',
                handleChange
              )}
            </Grid>

            <Grid item xs={12}>
              <Box className="form-group">
                <Typography
                  variant="subtitle1"
                  className="form-label"
                  htmlFor=" Project/Module"
                >
                  Project/Module
                </Typography>
                <Autocomplete
                  key={formValues?.prModule?.taskid ?? 'autocomplete'}
                  value={formValues?.prModule ?? null}
                  options={prModuleMaster}
                  getOptionLabel={(option) => `${option?.taskPr}/${option?.taskname}`}
                  {...commonTextFieldProps}
                  disabled={prModule !== true}
                  onChange={(_, newValue) =>
                    handleChange({
                      target: {
                        name: 'prModule',
                        value: newValue
                      }
                    })
                  }
                  renderOption={(props, option) => (
                    <li {...props}>
                      <strong>{option?.taskPr}</strong>/{option?.taskname}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Select Project/Module"
                    />
                  )}
                />

              </Box>
            </Grid>

            <Grid item xs={6}>
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

            <Grid item xs={12} md={6}>
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
              <DepartmentAssigneeAutocomplete
                value={formValues?.guests}
                options={teams}
                label="Assign To"
                placeholder="Select assignees"
                limitTags={5}
                onChange={(newValue) =>
                  handleChange({ target: { name: 'guests', value: newValue } })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              {renderAutocomplete('Status', 'status', formValues.status, 'Select Status', statusData, handleChange)}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderAutocomplete('What Next', 'secStatus', formValues.secStatus, 'Select Secondary Status', secStatusData, handleChange)}
            </Grid>

            <Grid item xs={12} md={6}>
              {renderAutocomplete('Priority', 'priority', formValues.priority, 'Select Priority', priorityData, handleChange)}
            </Grid>

            {[{ label: 'Start Date', name: 'startDate' }, { label: 'End Date', name: 'endDate' }, { label: 'Deadline Date', name: 'dueDate' }].map(({ label, name }) => (
              <Grid item xs={12} md={6} key={name}>
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

            {[{ label: 'Estimate', field: 'estimate_hrs' }, { label: 'Actual Estimate', field: 'estimate1_hrs' }, { label: 'Final Estimate', field: 'estimate2_hrs' }].map(({ label, field }) => (
              <Grid item xs={12} md={4} key={field}>
                <Box className="form-group">
                  <Typography className="form-label" variant="subtitle1">{label}</Typography>
                  <EstimateInput
                    value={formValues[field]}
                    onChange={(val) => handleEstimateChange(field, val)}
                  />
                </Box>
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
                  placeholder="Add a description..."
                  {...commonTextFieldProps}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default TaskFormSection;

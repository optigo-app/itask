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
  MenuItem,
  Tooltip,
  IconButton,
} from '@mui/material';
import dayjs from 'dayjs';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import EstimateInput from '../../Utils/Common/EstimateInput';
import CustomSwitch from '../../Utils/Common/CustomSwitch';
import { useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';

const TaskFormSection = ({
  taskType,
  formValues,
  prModule,
  allDayShow = false,
  handleChange,
  handleDateChange,
  handleEstimateChange,
  showSplitHint,
  splitHintMeta,
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
  hiddenFields = [],
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
              {!hiddenFields.includes('milestone') && (
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
              )}
              {allDayShow && !hiddenFields.includes('isAllDay') &&
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
            {formValues?.taskName && location?.pathname?.includes("/myCalendar") && !hiddenFields.includes('meetingDetail') &&
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
            {!hiddenFields.includes('taskName') && (
              <Grid item xs={12} md={12}>
                {renderTextField(
                  hiddenFields.find(f => f.startsWith('label:taskName:'))?.split(':')[2] || 'Task Name',
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
            )}

            {!hiddenFields.includes('prModule') && (
              <Grid item xs={12}>
                <Box className="form-group">
                  <Typography
                    variant="subtitle1"
                    className="form-label"
                    htmlFor=" Project/Module"
                  >
                    {hiddenFields.find(f => f.startsWith('label:prModule:'))?.split(':')[2] || 'Project/Module'}
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
            )}

            {!hiddenFields.includes('createdBy') && (
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
            )}

            {!hiddenFields.includes('category') && (
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
            )}

            {!hiddenFields.includes('guests') && (
              <Grid item xs={12}>
                <DepartmentAssigneeAutocomplete
                  value={formValues?.guests}
                  options={teams}
                  label={hiddenFields.find(f => f.startsWith('label:guests:'))?.split(':')[2] || 'Assign To'}
                  placeholder="Select assignees"
                  limitTags={5}
                  onChange={(newValue) =>
                    handleChange({ target: { name: 'guests', value: newValue } })
                  }
                />
              </Grid>
            )}

            {!hiddenFields.includes('status') && (
              <Grid item xs={12} md={6}>
                {renderAutocomplete(
                  hiddenFields.find(f => f.startsWith('label:status:'))?.split(':')[2] || 'Status',
                  'status',
                  formValues.status,
                  'Select Status',
                  statusData,
                  handleChange
                )}
              </Grid>
            )}

            {!hiddenFields.includes('secStatus') && (
              <Grid item xs={12} md={6}>
                {renderAutocomplete('What Next', 'secStatus', formValues.secStatus, 'Select Secondary Status', secStatusData, handleChange)}
              </Grid>
            )}

            {!hiddenFields.includes('priority') && (
              <Grid item xs={12} md={6}>
                {renderAutocomplete(
                  hiddenFields.find(f => f.startsWith('label:priority:'))?.split(':')[2] || 'Priority',
                  'priority',
                  formValues.priority,
                  'Select Priority',
                  priorityData,
                  handleChange
                )}
              </Grid>
            )}

            {[{ label: 'Start Date', name: 'startDate' }, { label: 'End Date', name: 'endDate' }, { label: 'Deadline Date', name: 'dueDate' }].map(({ label, name }) => (
              !hiddenFields.includes(name) && (
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
              )
            ))}

            {!hiddenFields.includes('estimates') && [{ label: 'Estimate', field: 'estimate_hrs' }, { label: 'Actual Estimate', field: 'estimate1_hrs' }, { label: 'Final Estimate', field: 'estimate2_hrs' }].map(({ label, field }) => (
              <Grid item xs={12} md={4} key={field}>
                <Box className="form-group">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography className="form-label" variant="subtitle1">{label}</Typography>
                    {Boolean(showSplitHint) && (
                      <Tooltip
                        arrow
                        title={`On save, ${label} will be split equally across ${splitHintMeta?.subtaskCount ?? 0} subtasks. Per subtask: ${splitHintMeta?.perSubtask?.[field] ?? 0}`}
                      >
                        <IconButton size="small" sx={{ color: "#7367f0" }}>
                          <Info size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  <EstimateInput
                    value={formValues[field]}
                    onChange={(val) => handleEstimateChange(field, val)}
                  />
                </Box>
              </Grid>
            ))}

            {!hiddenFields.includes('description') && (
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
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default TaskFormSection;

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Stack
} from '@mui/material';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import EstimateInput from '../../Utils/Common/EstimateInput';
import CustomSwitch from '../../Utils/Common/CustomSwitch';

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
  taskCategory,
  statusData,
  priorityData,
  teams,
  prModuleMaster,
  renderAutocomplete,
  renderDateField,
  renderTextField,
  commonTextFieldProps
}) => {
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
                      checked={formValues.allDay === 1}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: 'allDay',
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

            <Grid item xs={6}>
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

            <Grid item xs={12} md={6}>
              {renderAutocomplete('Category', 'category', formValues.category, 'Select Category', taskCategory, handleChange)}
            </Grid>

            <Grid item xs={12}>
              <DepartmentAssigneeAutocomplete
                value={formValues?.guests}
                options={teams}
                label="Assign To"
                placeholder="Select assignees"
                limitTags={2}
                onChange={(newValue) =>
                  handleChange({ target: { name: 'guests', value: newValue } })
                }
              />
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
              {renderAutocomplete('Status', 'status', formValues.status, 'Select Status', statusData, handleChange)}
            </Grid>


            <Grid item xs={12} md={6}>
              {renderAutocomplete('Priority', 'priority', formValues.priority, 'Select Priority', priorityData, handleChange)}
            </Grid>

            {[{ label: 'Start Date', name: 'startDate' }, { label: 'End Date', name: 'endDate' }, { label: 'Deadline Date', name: 'dueDate' }].map(({ label, name }) => (
              <Grid item xs={12} md={6} key={name}>
                {renderDateField(label, name, formValues[name], handleDateChange)}
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

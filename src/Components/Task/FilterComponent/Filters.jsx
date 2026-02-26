import React, { useState } from "react";
import { Box, TextField, Typography, MenuItem, Menu, Checkbox, ListItemText, Button, Autocomplete } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Advfilters, dynamicFilterDrawer, selectedCategoryAtom } from "../../../Recoil/atom";
import { commonTextFieldProps, customDatePickerProps } from "../../../Utils/globalfun";
import DepartmentAssigneeAutocomplete from "../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete";
import { useLocation } from "react-router-dom";

const Filters = ({
  onFilterChange,
  priorityData,
  assigneeData,
  statusData,
  taskProject,
  taskDepartment,
}) => {
  const location = useLocation();
  const [dynamicFilter, setDynamicFilters] = useRecoilState(dynamicFilterDrawer)
  const activetaskView = localStorage.getItem("activeTaskTab")
  const [filters, setFilters] = useRecoilState(Advfilters);

  const [filterVisibility, setFilterVisibility] = useState({
    status: true,
    priority: true,
    department: true,
    assignee: true,
    project: true,
    dueDate: true,
    startDate: true,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [dueDateVisible, setDueDateVisible] = useState(true);
  const [startDateVisible, setStartDateVisible] = useState(true);
  const [assigneeVisible, setAssigneeVisible] = useState(true);
  const [guest, setGuest] = useState({});

  const openMenu = Boolean(anchorEl);


  const handleVisibilityChange = (filterKey) => {
    setFilterVisibility((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const handleFilterChange = (key, value) => {
    let newValue = value;
    if (key === 'assignee' && value && typeof value === 'object') {
      setGuest((prev) => ({
        ...prev,
        [key]: value,
      }));
      newValue = `${value.firstname} ${value.lastname}`;
    }
    setFilters((prev) => ({ ...prev, [key]: newValue }));
    onFilterChange(key, newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDynamicFilterOpen = () => {
    setDynamicFilters(!dynamicFilter);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDueDateVisibilityChange = (event) => {
    setDueDateVisible(event.target.checked);
  };

  const handleStartDateVisibilityChange = (event) => {
    setStartDateVisible(event.target.checked);
  };

  const handleAssigneeVisibilityChange = (event) => {
    setAssigneeVisible(event.target.checked);
  };


  return (
    <Box className="filterMainContainer">
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: 'end', gap: 2 }}>
        <>
          {[
            { label: "Project", key: "project", data: taskProject },
            { label: "Status", key: "status", data: statusData },
            { label: "Priority", key: "priority", data: priorityData },
          ]?.map((filter) =>
            filterVisibility[filter.key] ? (
              <Box key={filter.key} className="form-group" sx={{ minWidth: 180, maxWidth: 180 }}>
                <Typography variant="subtitle1" className="filterLabletxt">
                  {filter.label}
                </Typography>
                <Autocomplete
                  size="small"
                  fullWidth
                  value={filters[filter.key] || null}
                  {...commonTextFieldProps}
                  onChange={(event, newValue) =>
                    handleFilterChange(filter.key, newValue)
                  }
                  options={filter?.data?.map((item) =>
                    filter.key === "assignee"
                      ? `${item?.firstname} ${item?.lastname}`
                      : item?.labelname
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={`Select ${filter.label}`}
                      className="textfieldsClass"
                    />
                  )}
                />
              </Box>
            ) : null
          )}
        </>
        {assigneeVisible && (
          <Box sx={{ maxWidth: 250 }}>
            <DepartmentAssigneeAutocomplete
              name="assignee"
              value={guest?.assignee}
              options={assigneeData?.filter((emp) => emp.isactive === 1)}
              label="Assignee"
              placeholder="Select assignees"
              limitTags={2}
              onChange={(newValue) => handleFilterChange('assignee', newValue)}
              minWidth={250}
              multiple={false}
            />
          </Box>
        )}

        {/* start Date Filter */}
        {startDateVisible && (
          <Box className="form-group" sx={{ maxWidth: 180 }}>
            <Typography variant="subtitle1" className="filterLabletxt">Start Date</Typography>
            <DatePicker
              name="startDate"
              value={filters.startDate}
              onChange={(newDate) => handleFilterChange("startDate", newDate)}
              className="textfieldsClass"
              sx={{ padding: "0", minWidth: 180 }}
              {...customDatePickerProps}
              format="DD/MM/YYYY"
              textField={(params) => (
                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
              )}
            />
          </Box>
        )}

        {/* Due Date Filter */}
        {dueDateVisible && (
          <Box className="form-group" sx={{ maxWidth: 180 }}>
            <Typography variant="subtitle1" className="filterLabletxt">Due Date</Typography>
            <DatePicker
              name="dueDate"
              value={filters.dueDate}
              onChange={(newDate) => handleFilterChange("dueDate", newDate)}
              className="textfieldsClass"
              sx={{ padding: "0", minWidth: 180 }}
              {...customDatePickerProps}
              format="DD/MM/YYYY"
              textField={(params) => (
                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
              )}
            />
          </Box>
        )}
      </Box>

      <Box>
        {(location?.pathname?.includes("/tasks") && activetaskView == "Dynamic-Filter") ? (
          <Button size='medium' className="buttonClassname" variant="contained" onClick={handleDynamicFilterOpen} sx={{ marginRight: '10px' }}>More Filter</Button>
        ) :
          <Button size='medium' className="buttonClassname" variant="contained" onClick={handleMenuOpen} sx={{ marginRight: '10px' }}>Show Filter</Button>
        }
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
        >
          {[
            { label: "Status", key: "status" },
            { label: "Priority", key: "priority" },
            { label: "Project", key: "project" }
          ].map(({ key, label }) => (
            <MenuItem key={key} onClick={() => handleVisibilityChange(key)}>
              <Checkbox checked={filterVisibility[key]} style={{ color: '#7367f0' }} />
              <ListItemText primary={label} />
            </MenuItem>
          ))}
          <MenuItem>
            <Checkbox checked={assigneeVisible} onChange={handleAssigneeVisibilityChange} style={{ color: '#7367f0' }} />
            <ListItemText primary="Assignee" />
          </MenuItem>
          <MenuItem>
            <Checkbox checked={startDateVisible} onChange={handleStartDateVisibilityChange} style={{ color: '#7367f0' }} />
            <ListItemText primary="Start Date" />
          </MenuItem>
          <MenuItem>
            <Checkbox checked={dueDateVisible} onChange={handleDueDateVisibilityChange} style={{ color: '#7367f0' }} />
            <ListItemText primary="Due Date" />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Filters;

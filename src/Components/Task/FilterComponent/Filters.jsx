import React, { useState } from "react";
import { Box, TextField, Typography, MenuItem, Menu, Checkbox, ListItemText, Button, Autocomplete } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Advfilters, selectedCategoryAtom } from "../../../Recoil/atom";
import { commonTextFieldProps, customDatePickerProps } from "../../../Utils/globalfun";

const Filters = ({
  onFilterChange,
  priorityData,
  assigneeData,
  statusData,
  taskProject,
  taskDepartment,
}) => {
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom)
  const [filters, setFilters] = useRecoilState(Advfilters);

  const [filterVisibility, setFilterVisibility] = useState({
    status: true,
    priority: true,
    department: true,
    assignee: true,
    project: true,
    dueDate: true,
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [dueDateVisible, setDueDateVisible] = useState(true);

  const openMenu = Boolean(anchorEl);


  const handleVisibilityChange = (filterKey) => {
    setFilterVisibility((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    onFilterChange(key, value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearFilter = () => {
    setFilters({
      priority: "",
      status: "",
      assignee: "",
      department: "",
      project: "",
      dueDate: null,
      category: null
    });
    onFilterChange("clearFilter", null);
    setSelectedCategory(null)
  };

  const handleDueDateVisibilityChange = (event) => {
    setDueDateVisible(event.target.checked);
  };

  return (
    <Box className="filterMainContainer">
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: 'end', gap: 2 }}>
        {[
          { label: "Project", key: "project", data: taskProject },
          { label: "Status", key: "status", data: statusData },
          { label: "Assignee", key: "assignee", data: assigneeData },
          { label: "Priority", key: "priority", data: priorityData },
          { label: "Department", key: "department", data: taskDepartment },
        ]?.map((filter) =>
          filterVisibility[filter.key] ? (
            <Box key={filter.key} className="form-group" sx={{ minWidth: 180 }}>
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

        {/* Due Date Filter */}
        {dueDateVisible && (
          <Box className="form-group">
            <Typography variant="subtitle1" className="filterLabletxt">Due Date</Typography>
            <DatePicker
              name="startDateTime"
              value={filters.dueDate}
              onChange={(newDate) => handleFilterChange("dueDate", newDate)}
              className="textfieldsClass"
              sx={{ padding: "0", minWidth: 200 }}
              {...customDatePickerProps}
              format="DD/MM/YYYY"
              textField={(params) => (
                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
              )}
            />
          </Box>
        )}

        {/* <Button size='small' className="clearAllBtn" variant="text" onClick={handleClearFilter}>
          Clear All
        </Button> */}
      </Box>


      <Box>
        <Button size='medium' className="buttonClassname" variant="contained" onClick={handleMenuOpen} sx={{ marginRight: '10px' }}>Show Filter</Button>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
        >
          {[
            { label: "Status", key: "status" },
            { label: "Priority", key: "priority" },
            { label: "Department", key: "department" },
            { label: "Assignee", key: "assignee" },
            { label: "Project", key: "project" }
          ].map(({ key, label }) => (
            <MenuItem key={key} onClick={() => handleVisibilityChange(key)}>
              <Checkbox checked={filterVisibility[key]} style={{ color: '#7367f0' }} />
              <ListItemText primary={label} />
            </MenuItem>
          ))}
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

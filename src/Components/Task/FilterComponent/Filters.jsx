import React, { useEffect, useState, useRef } from "react";
import { Box, TextField, Typography, MenuItem, Menu, Checkbox, ListItemText, Button, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSetRecoilState } from "recoil";
import { selectedCategoryAtom, timerCompOpen } from "../../../Recoil/atom";
import { TimerIcon } from "lucide-react";
import { commonSelectProps, customDatePickerProps } from "../../../Utils/globalfun";
import TaskTimeTrackerComp from "../../ShortcutsComponent/TaskTimeTrackerComp";

const Filters = ({
  searchTerm,
  onFilterChange,
  priorityData,
  assigneeData,
  statusData,
  taskProject,
  taskCategory,
  taskDepartment,
}) => {
  const setSelectedCategory = useSetRecoilState(selectedCategoryAtom)
  const [filters, setFilters] = React.useState({
    priority: "",
    status: "",
    assignee: "",
    department: "",
    project: "",
    dueDate: null,
  });

  const [filterVisibility, setFilterVisibility] = useState({
    status: true,
    priority: true,
    department: true,
    assignee: true,
    project: true,
    dueDate: true, // Added visibility for Due Date
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [dueDateVisible, setDueDateVisible] = useState(true);
  const setTimerComponentOpen = useSetRecoilState(timerCompOpen);

  const openMenu = Boolean(anchorEl);

  const filterRefs = {
    priority: useRef(),
    status: useRef(),
    assignee: useRef(),
    department: useRef(),
    project: useRef(),
  };

  const handleVisibilityChange = (filterKey) => {
    setFilterVisibility((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  useEffect(() => {
    if (Object.values(filters).every((value) => value === "" || value === null)) {
      Object.keys(filterRefs).forEach((key) => {
        const element = filterRefs[key].current;
        if (element) {
          const span = element.querySelector(".notranslate");
          if (span) {
            if (!filters[key]) {
              span.textContent = `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`;
            }
          }
        }
      });
    }
  }, [handleVisibilityChange, handleVisibilityChange]);

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

  // const commonSelectProps = {
  //   select: true,
  //   fullWidth: true,
  //   size: "small",
  //   sx: {
  //     minWidth: 180,
  //     "& .MuiOutlinedInput-root": {
  //       borderRadius: "8px",
  //       "& fieldset": {
  //         borderRadius: "8px",
  //       },
  //     },
  //   },
  //   SelectProps: {
  //     MenuProps: {
  //       PaperProps: {
  //         sx: {
  //           borderRadius: "8px",
  //           "& .MuiMenuItem-root": {
  //             fontFamily: '"Public Sans", sans-serif',
  //             color: "#444050",
  //             margin: "5px 10px",
  //             "&:hover": {
  //               borderRadius: "8px",
  //               backgroundColor: "#7367f0",
  //               color: "#fff",
  //             },
  //             "&.Mui-selected": {
  //               backgroundColor: "#80808033",
  //               borderRadius: "8px",
  //               "&:hover": {
  //                 backgroundColor: "#7367f0",
  //                 color: "#fff",
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // };

  // const customDatePickerProps = {
  //   slotProps: {
  //     popper: {
  //       sx: {
  //         '& .MuiDateCalendar-root': {
  //           borderRadius: '8px',
  //           fontFamily: '"Public Sans", sans-serif',
  //         },
  //         '& .MuiButtonBase-root, .MuiPickersCalendarHeader-label, .MuiPickersYear-yearButton': {
  //           color: '#444050',
  //           fontFamily: '"Public Sans", sans-serif',
  //         },
  //         '& .MuiPickersDay-root, .MuiPickersYear-yearButton': {
  //           '&:hover': {
  //             backgroundColor: '#7367f0',
  //             color: '#fff',
  //           },
  //         },
  //         '& .MuiPickersDay-root.Mui-selected, .Mui-selected ': {
  //           backgroundColor: '#7367f0',
  //           color: '#fff',
  //         },
  //         '& .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton:hover': {
  //           backgroundColor: '#7367f0',
  //           color: '#fff',
  //         },
  //       },
  //     },
  //   },
  // };

  const handleDueDateVisibilityChange = (event) => {
    setDueDateVisible(event.target.checked);
  };

  const handleTimerCompOpen = () => {
    setTimerComponentOpen(true);
  };

  return (
    <Box className="filterMainContainer">
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {[
          { label: "Status", key: "status", data: statusData },
          { label: "Priority", key: "priority", data: priorityData },
          { label: "Department", key: "department", data: taskDepartment },
          { label: "Assignee", key: "assignee", data: assigneeData },
          { label: "Project", key: "project", data: taskProject },
        ].map((filter) =>
          filterVisibility[filter.key] ? (
            <Box key={filter.key} className="form-group">
              <Typography variant="subtitle1" id={filter?.label} className="filterLabletxt">
                {filter?.label}
              </Typography>
              <TextField
                aria-label={`Select ${filter?.label}`}
                id={filter?.label}
                name={filter?.key}
                value={filters[filter?.key]}
                onChange={(e) => handleFilterChange(filter?.key, e.target.value)}
                {...commonSelectProps}
                ref={filterRefs[filter?.key]}
                className="textfieldsClass"
              >
                <MenuItem value="">
                  <span className="notranslate">Select {filter?.label}</span>
                </MenuItem>
                {filter.data?.map((item) => (
                  <MenuItem
                    key={item?.id}
                    value={filter.key === "assignee" ? `${item?.firstname} ${item?.lastname}` : item?.labelname}
                  >
                    {filter.key === "assignee" ? `${item?.firstname} ${item?.lastname}` : item?.labelname}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ) : null
        )}

        {/* Due Date Filter */}
        {dueDateVisible && (
          <Box className="form-group">
            <Typography variant="subtitle1">Due Date</Typography>
            <DatePicker
              name="startDateTime"
              value={filters.dueDate}
              onChange={(newDate) => handleFilterChange("dueDate", newDate)}
              className="textfieldsClass"
              {...customDatePickerProps}
              sx={{ padding: "0" }}
              format="DD/MM/YYYY"
              textField={(params) => (
                <TextField {...params} size="small" fullWidth className="textfieldsClass" sx={{ padding: "0" }} />
              )}
            />
          </Box>
        )}
        <Button size='small' className="clearAllBtn" variant="text" onClick={handleClearFilter}>
          clear All
        </Button>
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
          {/* Due Date Visibility Toggle */}
          <MenuItem>
            <Checkbox checked={dueDateVisible} onChange={handleDueDateVisibilityChange} style={{ color: '#7367f0' }} />
            <ListItemText primary="Due Date" />
          </MenuItem>
        </Menu>
        <IconButton
          size='medium'
          className="buttonClassname"
          onClick={handleTimerCompOpen}
          sx={{ ml: 1 }}
        >
          <TimerIcon sx={{ color: '#fff' }} />
        </IconButton>
        <TaskTimeTrackerComp />
      </Box>
    </Box>
  );
};

export default Filters;

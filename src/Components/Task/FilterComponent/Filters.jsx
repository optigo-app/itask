import React, { useState } from "react";
import { Box, TextField, Typography, MenuItem, Menu, Checkbox, ListItemText, Button, Autocomplete } from "@mui/material";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Advfilters, dynamicFilterDrawer, filterDrawer, selectedCategoryAtom } from "../../../Recoil/atom";
import { commonTextFieldProps } from "../../../Utils/globalfun";
import DepartmentAssigneeAutocomplete from "../../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete";
import { useLocation } from "react-router-dom";
import CustomDateRangePicker from "../../ShortcutsComponent/DateRangePicker";

const Filters = ({
  onFilterChange,
  priorityData,
  assigneeData,
  statusData,
  secStatusData,
  taskProject,
  taskDepartment,
  taskCategory,
  filters: filtersProp,
  setFilters: setFiltersProp,
  isMulti = false,
}) => {
  const location = useLocation();
  const [dynamicFilter, setDynamicFilters] = useRecoilState(dynamicFilterDrawer)
  const setFilterDrawerOpen = useSetRecoilState(filterDrawer);
  const activetaskView = localStorage.getItem("activeTaskTab")
  const [globalFilters, setGlobalFilters] = useRecoilState(Advfilters);
  const filters = filtersProp ?? globalFilters;
  const setFilters = setFiltersProp ?? setGlobalFilters;

  const [filterVisibility, setFilterVisibility] = useState({
    status: true,
    secStatus: true,
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
      newValue = Array.isArray(value)
        ? value.map((v) => `${v?.firstname ?? ''} ${v?.lastname ?? ''}`.trim())
        : `${value.firstname} ${value.lastname}`;
    }

    // Check if it's a date range object and handle it
    if ((key === 'startDate' || key === 'dueDate') && value && typeof value === 'object' && value.startDate && value.endDate) {
      setFilters((prev) => ({ ...prev, [key]: value }));
      onFilterChange(key, value);
    } else {
      setFilters((prev) => ({ ...prev, [key]: newValue }));
      onFilterChange(key, newValue);
    }
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


  // Hybrid filter bar (Jira-style): the primary filters always render inline;
  // secondary filters only appear once they hold a value — everything is also
  // editable in the right drawer via the "+ Filters" button.
  const QUICK_KEYS = ['status', 'secStatus', 'priority'];
  const hasValue = (key) => {
    const v = filters?.[key];
    if (v == null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Boolean(v.startDate || v.endDate || v.firstname);
    return true;
  };
  const activeCount = ['project', 'status', 'secStatus', 'priority', 'assignee', 'department', 'category', 'startDate', 'dueDate']
    .filter(hasValue).length;

  return (
    <Box className="filterMainContainer">
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: 'flex-start', gap: 1 }}>
        <>
          {[
            { label: "Status", key: "status", data: statusData },
            ...(secStatusData ? [{ label: "What Next", key: "secStatus", data: secStatusData }] : []),
            { label: "Priority", key: "priority", data: priorityData },
            { label: "Category", key: "category", data: taskCategory },
            { label: "Department", key: "department", data: taskDepartment },
          ]?.map((filter) => {
            const selectedArr = Array.isArray(filters[filter.key])
              ? filters[filter.key]
              : (filters[filter.key] ? [filters[filter.key]] : []);
            const hasSelection = isMulti ? selectedArr.length > 0 : Boolean(filters[filter.key]);
            return (
              <Box key={filter.key} className="form-group" sx={{
                flex: '1 1 260px',
                minWidth: 260,
                maxWidth: 300,
              }}>
                <Typography variant="subtitle1" className="filterLabletxt">{filter.label}</Typography>
                <Autocomplete
                  size="small"
                  fullWidth
                  value={isMulti ? selectedArr : (filters[filter.key] || null)}
                  {...commonTextFieldProps}
                  onChange={(event, newValue) =>
                    handleFilterChange(filter.key, newValue)
                  }
                  options={filter?.data?.map((item) =>
                    filter.key === "assignee"
                      ? `${item?.firstname} ${item?.lastname}`
                      : item?.labelname
                  )}
                  {...(isMulti && {
                    multiple: true,
                    disableCloseOnSelect: true,
                    limitTags: 1,
                    isOptionEqualToValue: (option, val) => option === val,
                    renderOption: (props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox checked={selected} sx={{ p: 0.5, mr: 0.5, color: '#7367f0', '&.Mui-checked': { color: '#7367f0' } }} size="small" />
                        <ListItemText primary={option} />
                      </li>
                    ),
                    slotProps: {
                      chip: {
                        size: 'small',
                        sx: {
                          height: 20,
                          fontSize: '11px',
                          fontWeight: 600,
                          maxWidth: 120,
                          backgroundColor: 'rgba(115, 103, 240, 0.12)',
                          color: '#7367f0',
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                          '& .MuiChip-deleteIcon': { fontSize: 14, color: '#7367f0' },
                        },
                      },
                      paper: {
                        sx: {
                          borderRadius: '10px',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                          border: '1px solid #ececf1',
                          mt: 0.5,
                          '& .MuiAutocomplete-option': {
                            fontSize: '13px',
                            py: 0.5,
                            color: '#444050',
                            '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)', color: '#444050' },
                            '&.Mui-focused': { backgroundColor: 'rgba(115, 103, 240, 0.12)', color: '#444050' },
                            '&[aria-selected="true"]': {
                              backgroundColor: 'rgba(115, 103, 240, 0.15)',
                              color: '#444050',
                              '&.Mui-focused': { backgroundColor: 'rgba(115, 103, 240, 0.2)', color: '#444050' },
                            },
                          },
                        },
                      },
                      listbox: {
                        sx: { maxHeight: 260, py: 0.5 },
                      },
                    },
                  })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={`Select ${filter.label}`}
                      className="textfieldsClass"
                      InputProps={{
                        ...params.InputProps,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          minHeight: 38,
                          fontSize: '13px',
                          borderRadius: '8px',
                          py: 0.5,
                          flexWrap: 'wrap',
                          '& .MuiAutocomplete-tag': { my: 0 },
                          backgroundColor: hasSelection ? 'rgba(115, 103, 240, 0.06)' : '#fff',
                          '& fieldset': { borderColor: hasSelection ? 'rgba(115, 103, 240, 0.4)' : '#e0e0e0' },
                          '&:hover fieldset': { borderColor: '#7367f0' },
                        },
                      }}
                    />
                  )}
                />
              </Box>
            );
          })}
        </>
        {(
          <Box sx={{ flex: '1 1 260px', minWidth: 260, maxWidth: 300 }}>
            <DepartmentAssigneeAutocomplete
              name="assignee"
              value={guest?.assignee}
              options={assigneeData?.filter((emp) => emp.isactive === 1)}
              label="Assignee"
              placeholder="Select assignees"
              limitTags={2}
              onChange={(newValue) => handleFilterChange('assignee', newValue)}
              minWidth={250}
              multiple={isMulti}
            />
          </Box>
        )}

        {/* start Date Filter */}
        {(
          <Box className="form-group" sx={{ flex: '1 1 260px', minWidth: 260, maxWidth: 300 }}>
            <Typography variant="subtitle1" className="filterLabletxt">Start Date</Typography>
            <CustomDateRangePicker
              value={filters.startDate}
              onChange={(newRange) => handleFilterChange("startDate", newRange)}
              placeholder="Start date"
            />
          </Box>
        )}

        {/* Due Date Filter — always visible in the opened filter section */}
        {(
          <Box className="form-group" sx={{ flex: '1 1 260px', minWidth: 260, maxWidth: 300 }}>
            <Typography variant="subtitle1" className="filterLabletxt">Due Date</Typography>
            <CustomDateRangePicker
              value={filters.dueDate}
              onChange={(newRange) => handleFilterChange("dueDate", newRange)}
              placeholder="Due date"
            />
          </Box>
        )}

        {/* Created Date Filter */}
        {(
          <Box className="form-group" sx={{ flex: '1 1 260px', minWidth: 260, maxWidth: 300 }}>
            <Typography variant="subtitle1" className="filterLabletxt">Created Date</Typography>
            <CustomDateRangePicker
              value={filters.entrydate}
              onChange={(newRange) => handleFilterChange("entrydate", newRange)}
              placeholder="Created date"
            />
          </Box>
        )}

        {/* "+ Filters" — inline, right after the quick selects (task page only;
            single-select consumers always render their controls) */}
        {false && isMulti && (
          <Button
            size="small"
            variant="text"
            onClick={() => setFilterDrawerOpen(true)}
            sx={{
              height: 38,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '12.5px',
              fontWeight: 600,
              px: 1.5,
              mb:'-15px',
              alignSelf: 'center',
              flexShrink: 0,
              color: '#7367f0',
              backgroundColor: activeCount > 0 ? 'rgba(115, 103, 240, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(115, 103, 240, 0.12)',
              },
            }}
          >
            + Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        )}
      </Box>

      {/* <Box>
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
      </Box> */}
    </Box>
  );
};

export default Filters;

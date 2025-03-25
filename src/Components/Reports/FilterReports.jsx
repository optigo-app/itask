import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, TextField, MenuItem, InputAdornment } from "@mui/material";
import { commonSelectProps } from "../../Utils/globalfun";
import { SearchIcon } from "lucide-react";

const FilterReports = ({filters, setFilters, handleFilterChange }) => {

  const [filterData, setFilterData] = useState({
    status: [],
    priority: [],
    department: [],
    assignee: [],
    project: [],
  });

  const filterRefs = {
    status: useRef(),
    priority: useRef(),
    department: useRef(),
    assignee: useRef(),
    project: useRef(),
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
  }, [handleFilterChange]);

  useEffect(() => {
    const getStoredData = (key) => {
      try {
        return JSON.parse(sessionStorage.getItem(key)) || [];
      } catch (error) {
        console.error(`Error parsing ${key} from sessionStorage:`, error);
        return [];
      }
    };

    setFilterData({
      status: getStoredData("taskstatusData"),
      priority: getStoredData("taskpriorityData"),
      department: getStoredData("taskdepartmentData"),
      assignee: getStoredData("taskAssigneeData"),
      project: getStoredData("taskprojectData"),
    });
  }, []);

  return (
    <Box className="reports_filterMainBox">
      <Box className="reports_filterBox">
        {[
          { label: "Status", key: "status" },
          { label: "Priority", key: "priority" },
          { label: "Department", key: "department" },
          { label: "Assignee", key: "assignee" },
          { label: "Project", key: "project" },
        ].map(
          (filter) =>
            filterData[filter.key] && (
              <Box key={filter.key} className="form-group">
                <Typography variant="subtitle1" className="filterLabletxt">
                  {filter?.label}
                </Typography>
                <TextField
                  aria-label={`Select ${filter.label}`}
                  id={filter.label}
                  name={filter.key}
                  value={filters[filter.key] || ""}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  ref={filterRefs[filter?.key]}
                  className="textfieldsClass"
                  {...commonSelectProps}
                  select
                >
                  <MenuItem value="">
                    <span className="notranslate">Select {filter.label}</span>
                  </MenuItem>
                  {filterData[filter.key].map((item) => (
                    <MenuItem
                      key={item.id}
                      value={filter.key === "assignee" ? `${item.firstname} ${item.lastname}` : item.labelname}
                    >
                      {filter.key === "assignee" ? `${item.firstname} ${item.lastname}` : item.labelname}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )
        )}
      </Box>
      {/* <Box sx={{ display: 'flex', justifyContent: 'end' }}>
        <TextField
          placeholder="Search tasks..."
          value={filters?.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          size="small"
          className="textfieldsClass"
          sx={{
            minWidth: 250,
            "@media (max-width: 600px)": { minWidth: "100%" },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon size={20} color="#7d7f85" opacity={0.5} />
              </InputAdornment>
            ),
          }}
          aria-label='Search tasks...'
        />
      </Box> */}
    </Box>
  );
};

export default FilterReports;

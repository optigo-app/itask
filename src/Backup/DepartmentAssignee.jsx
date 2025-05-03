// DepartmentAssignee.js
import React, { useState } from "react";
import { Autocomplete, TextField, Box, Typography, Paper } from "@mui/material";
import "./DepartmentAssignee.scss";

const DepartmentAssignee = ({ data }) => {
  const [selectedEmployees, setSelectedEmployees] = useState({});

  const handleChange = (departmentId, value) => {
    setSelectedEmployees((prev) => ({
      ...prev,
      [departmentId]: value,
    }));
  };

  return (
    <Box className="department-assignee-container">
      {data.map((dept) => (
        <Paper key={dept.id} className="department-card" elevation={3}>
          <Typography variant="h6" className="department-name">{dept.name}</Typography>
          <Autocomplete
            multiple
            options={dept.employees}
            getOptionLabel={(option) => option.name}
            value={selectedEmployees[dept.id] || []}
            onChange={(e, newValue) => handleChange(dept.id, newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Select Employees" placeholder="Employee name" />
            )}
            className="autocomplete-field"
          />
        </Paper>
      ))}
    </Box>
  );
};

export default DepartmentAssignee;

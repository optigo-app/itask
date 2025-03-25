import React from "react";
import "./ReportsGrid.scss";
import { TextField, MenuItem, Box } from "@mui/material";
import { commonSelectProps, commonTextFieldProps } from "../../Utils/globalfun";

const Filters = ({ filterShow, setFilterShow, filters, handleFilterChange, filterColumns }) => {
    console.log('filterShow: ', filterShow);
    console.log('filterColumns: ', filterColumns);
  return (
    <Box className="filters-container" sx={{display:'flex', gap:'10px', marginBlock:2}}>
      {filterShow && filterColumns?.map((col) => (
        <div key={col.key} className="filter-item">
          {col.type === "select" ? (
            <TextField
              select
              label={col.label}
              value={filters[col.key] || ""}
              onChange={(e) => handleFilterChange(col.key, e.target.value)}
              fullWidth
              {...commonSelectProps}
              {...commonTextFieldProps}
            >
              <MenuItem value="">All</MenuItem>
              {col.options?.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          ) : col.type === "date" ? (
            <TextField
              type="date"
              label={col.label}
              value={filters[col.key] || ""}
              onChange={(e) => handleFilterChange(col.key, e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              {...commonTextFieldProps}
            />
          ) : (
            <TextField
              label={col.label}
              value={filters[col.key] || ""}
              onChange={(e) => handleFilterChange(col.key, e.target.value)}
              fullWidth
              {...commonTextFieldProps}
            />
          )}
        </div>
      ))}
    </Box>
  );
};

export default Filters;

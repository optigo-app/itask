import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  Typography,
  Chip,
  Box,
  Container,
  Paper,
} from "@mui/material";

const SmartDropdown = ({
  label,
  value,
  setValue,
  options,
  setOptions,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [newlyAdded, setNewlyAdded] = useState([]);

  const filterOptions = (opts, { inputValue }) => {
    const filtered = opts.filter((opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );

    const isExisting = opts.some(
      (opt) => opt.toLowerCase() === inputValue.toLowerCase()
    );

    if (inputValue !== "" && !isExisting) {
      filtered.push(`Add "${inputValue}"`);
    }

    return filtered;
  };

  const handleChange = (e, newValue) => {
    if (typeof newValue === "string" && newValue.startsWith("Add ")) {
      const newVal = newValue.replace(/^Add\s"|"$/g, "");
      setOptions((prev) => [...prev, newVal]);
      setNewlyAdded((prev) => [...prev, newVal]);
      setValue(newVal);
    } else {
      setValue(newValue);
    }
  };

  return (
    <Box mt={3}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Autocomplete
        freeSolo
        fullWidth
        options={options}
        value={value}
        inputValue={inputValue}
        onInputChange={(e, val) => setInputValue(val)}
        onChange={handleChange}
        filterOptions={filterOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={placeholder || `Select or add ${label}`}
          />
        )}
        renderOption={(props, option) => {
          const isNew = newlyAdded.includes(option);
          return (
            <Box
              component="li"
              {...props}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>{option}</span>
              {isNew && (
                <Chip
                  label="new"
                  size="small"
                  color="primary"
                  sx={{ ml: 1, fontSize: "10px" }}
                />
              )}
            </Box>
          );
        }}
      />
    </Box>
  );
};

const SmartDropdownTest = () => {
  const [formData, setFormData] = useState({
    masterName: "",
    subMasterName: "",
    masterValue: "",
  });

  const [masterOptions, setMasterOptions] = useState(["Group A", "Group B"]);
  const [subMasterOptions, setSubMasterOptions] = useState(["Name 1", "Name 2"]);
  const [masterValueOptions, setMasterValueOptions] = useState(["Value X", "Value Y"]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Smart Dropdown Form
        </Typography>

        <SmartDropdown
          label="Master Group"
          value={formData.masterName}
          setValue={(val) => setFormData({ ...formData, masterName: val })}
          options={masterOptions}
          setOptions={setMasterOptions}
        />

        <SmartDropdown
          label="Master Name"
          value={formData.subMasterName}
          setValue={(val) => setFormData({ ...formData, subMasterName: val })}
          options={subMasterOptions}
          setOptions={setSubMasterOptions}
        />

        <SmartDropdown
          label="Master Data"
          value={formData.masterValue}
          setValue={(val) => setFormData({ ...formData, masterValue: val })}
          options={masterValueOptions}
          setOptions={setMasterValueOptions}
        />
      </Paper>
    </Container>
  );
};

export default SmartDropdownTest;

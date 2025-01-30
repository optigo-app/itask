import React, { useState } from "react";
import { Autocomplete, TextField, Chip, Box, Typography } from "@mui/material";

const MultiSelectChipWithLimit = ({
    options,
    label,
    placeholder = "Select assignees",
    limitTags = 2,
    onChange,
    value
}) => {
    const [selectedValues, setSelectedValues] = useState(value || []);
    console.log('selectedValues: ', selectedValues);

    const handleChange = (event, newValue) => {
        setSelectedValues(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const commonTextFieldProps = {
        fullWidth: true,
        size: "small",
        className: "textfieldsClass",
    };

    return (
        <Box className="form-group">
            <Typography
                variant="subtitle1"
                className="form-label"
                htmlFor="assignee">{label}</Typography>
            <Autocomplete
                multiple
                fullWidth
                options={options}
                getOptionLabel={(option) => option.label}
                value={selectedValues}
                onChange={handleChange}
                limitTags={limitTags}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            key={option.id}
                            label={option.label}
                            {...commonTextFieldProps}
                            {...getTagProps({ index })}
                            sx={{ borderRadius: "8px" }}
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...commonTextFieldProps}
                        placeholder={!selectedValues || selectedValues?.length !== 2 ? placeholder : ''}
                        variant="outlined"
                        fullWidth
                    />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionSelected={(option, value) => option.id === value.id}
            />
        </Box>
    );
};

export default MultiSelectChipWithLimit;

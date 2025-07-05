import React, { useState } from "react";
import {
    Autocomplete,
    TextField,
    Typography,
    Box,
    Chip
} from "@mui/material";
import { commonTextFieldProps } from "../../Utils/globalfun";

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
        const filtered = opts.filter(
            (opt) => opt.toLowerCase().includes(inputValue.toLowerCase())
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
        <Box mt={2}>
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
                {...commonTextFieldProps}
                renderInput={(params) => (
                    <TextField {...params} size="small" placeholder={placeholder || `Select or add ${label}`} />
                )}
                renderOption={(props, option) => {
                    const isNew = newlyAdded.includes(option);
                    return (
                        <Box component="li" {...props} sx={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{option}</span>
                            {isNew && <Chip label="new" size="small" color="primary" sx={{ ml: 1 }} />}
                        </Box>
                    );
                }}
            />
        </Box>
    );
};

export default SmartDropdown;

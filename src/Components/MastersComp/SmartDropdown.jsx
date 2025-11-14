import React, { useState, useEffect } from "react";
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
    error: externalError,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [newlyAdded, setNewlyAdded] = useState([]);
    const [error, setError] = useState("");

    // Sync inputValue with value when disabled to ensure proper display
    useEffect(() => {
        if (disabled && value) {
            setInputValue(value);
        }
    }, [disabled, value]);

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

    const handleChange = (e, newValue, reason) => {
        if (disabled) return;
        setError(""); // Clear error on change
        if (typeof newValue === "string" && newValue.startsWith("Add ")) {
            const newVal = newValue.replace(/^Add\s"|"$/g, "");
            if (newVal.trim() === "") {
                setError("Value cannot be empty");
                return;
            }
            setOptions((prev) => [...prev, newVal]);
            setNewlyAdded((prev) => [...prev, newVal]);
            setValue(newVal);
        } else {
            setValue(newValue);
        }
    };

    const handleInputChange = (e, val, reason) => {
        if (disabled) return;
        setInputValue(val);
        if (error) setError(""); // Clear error when user starts typing
    };

    const handleBlur = () => {
        if (disabled) return;
        if (inputValue && inputValue.trim() !== "") {
            const trimmedValue = inputValue.trim();
            const isExisting = options.some(
                (opt) => opt.toLowerCase() === trimmedValue.toLowerCase()
            );
            
            if (!isExisting) {
                setOptions((prev) => [...prev, trimmedValue]);
                setNewlyAdded((prev) => [...prev, trimmedValue]);
                setValue(trimmedValue);
            } else {
                const existingOption = options.find(
                    (opt) => opt.toLowerCase() === trimmedValue.toLowerCase()
                );
                setValue(existingOption);
            }
        } else if (inputValue && inputValue.trim() === "") {
            setError("Value cannot be empty");
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
                onInputChange={handleInputChange}
                onChange={handleChange}
                filterOptions={filterOptions}
                {...commonTextFieldProps}
                disabled={disabled}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        size="small" 
                        placeholder={placeholder || `Select or add ${label}`}
                        onBlur={handleBlur}
                        error={!!(error || externalError)}
                        helperText={error || externalError}
                        disabled={disabled}
                    />
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

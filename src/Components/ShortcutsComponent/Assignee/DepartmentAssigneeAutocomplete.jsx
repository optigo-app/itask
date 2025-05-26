import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    TextField,
    Chip,
    Typography,
    Box,
    Avatar,
} from "@mui/material";
import { commonTextFieldProps, getRandomAvatarColor, ImageUrl } from "../../../Utils/globalfun";

export default function DepartmentAssigneeAutocomplete({
    options,
    label,
    placeholder = "Select assignees",
    limitTags = 2,
    onChange,
    value,
    error,
    helperText }) {
    const [selectedValues, setSelectedValues] = useState([]);

    useEffect(() => {
        if (value) {
            setSelectedValues(value);
        }
    }, [value]);

    const handleChange = (event, newValue) => {
        setSelectedValues(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const background = (assignee) => {
        const avatarBackgroundColor = assignee?.avatar
            ? "transparent"
            : getRandomAvatarColor(assignee);
        return avatarBackgroundColor;
    };

    const getFullName = (emp) => `${emp.firstname} ${emp.lastname}`;
    const getDeptAssignee = (emp) => `${emp.department} / ${getFullName(emp)}`;

    const filterOptions = (options, { inputValue }) =>
        options.filter(
            (emp) =>
                getFullName(emp).toLowerCase().includes(inputValue.toLowerCase()) ||
                emp.department.toLowerCase().includes(inputValue.toLowerCase())
        );

    return (
        <Box className="form-group">
            <Typography variant="subtitle1" className="form-label">{label}</Typography>
            <Autocomplete
                multiple
                limitTags={limitTags}
                options={options}
                filterOptions={filterOptions}
                getOptionLabel={(option) => getDeptAssignee(option)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedValues}
                onChange={handleChange}
                sx={{
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        paddingTop: selectedValues.length > 2 ? "5px !important" : "0px",
                    },
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                        const imageSrc = ImageUrl(option);
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                            <Chip
                                key={key}
                                avatar={
                                    imageSrc ? (
                                        <Avatar src={imageSrc} alt={option.firstname} />
                                    ) : (
                                        <Avatar
                                            sx={{
                                                fontSize: "14px",
                                                textTransform: "capitalize",
                                                backgroundColor: background(option?.firstname),
                                            }}
                                        >
                                            {option.firstname.charAt(0)}
                                        </Avatar>
                                    )
                                }
                                label={
                                    <Box
                                        sx={{
                                            maxWidth: "80px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {option.firstname + " " + option.lastname}
                                    </Box>
                                }
                                {...tagProps}
                                sx={{ borderRadius: "8px", fontSize: "14px", textTransform: "capitalize", mr: 0.5, }}
                                {...commonTextFieldProps}
                            />
                        );
                    })
                }
                renderOption={(props, option) => {
                    const imageSrc = ImageUrl(option);
                    return (
                        <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                src={imageSrc}
                                alt={option.firstname}
                                sx={{
                                    width: 25,
                                    height: 25,
                                    marginRight: 1,
                                    fontSize: "14px",
                                    textTransform: "capitalize",
                                    backgroundColor: background(option?.firstname),
                                }}
                            >
                                {!imageSrc && option.firstname.charAt(0)}
                            </Avatar>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'bottom' }}>
                                    {option.department}
                                </span>
                                {" "} / {option.firstname} {option.lastname}
                            </div>
                        </li>
                    );
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...commonTextFieldProps}
                        placeholder={selectedValues.length === 0 ? placeholder : ''}
                        variant="outlined"
                        fullWidth
                        size="small"
                        error={error}
                        helperText={helperText}
                    />
                )}
            />
        </Box>
    );
}



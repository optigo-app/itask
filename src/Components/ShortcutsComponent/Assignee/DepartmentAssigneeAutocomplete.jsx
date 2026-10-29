import React, { useEffect, useState } from "react";
import {
    Autocomplete,
    TextField,
    Chip,
    Typography,
    Box,
    Avatar,
} from "@mui/material";
import { commonTextFieldProps, ImageUrl, getAvatarColors, getInitials } from '../../../Utils/globalfun';
import SafeAvatar from '../SafeAvatar';

export default function DepartmentAssigneeAutocomplete({
    options,
    label,
    placeholder = "Select assignees",
    limitTags = 2,
    onChange,
    value,
    error,
    multiple = true, // Fixed typo
    minWidth = 180,
    helperText,
    disabled = false
}) {
    const [selectedValues, setSelectedValues] = useState(multiple ? [] : null);

    useEffect(() => {
        setSelectedValues(value || (multiple ? [] : null));
    }, [value, multiple]);

    const handleChange = (event, newValue) => {
        setSelectedValues(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const getFullName = (emp) => `${emp?.firstname || ''} ${emp?.lastname || ''}`;
    const getDeptAssignee = (emp) => `${emp?.department || ''} / ${getFullName(emp)}`;

    // Chip avatar size — one place to tune width/height for selected-assignee chips.
    // !important needed: MUI's .MuiChip-avatar class also sets w/h/fontSize on the avatar.
    const chipAvatarSx = {
        width: '22px !important',
        height: '22px !important',
        fontSize: '10.5px !important',
        fontWeight: 700,
        marginLeft: '4px !important',
        marginRight: '-4px !important',
    };

    const filterOptions = (options, { inputValue }) =>
        options.filter(
            (emp) =>
                emp && (
                    getFullName(emp).toLowerCase().includes(inputValue.toLowerCase()) ||
                    (emp?.department || '').toLowerCase().includes(inputValue.toLowerCase())
                )
        );

    return (
        <Box
            className="form-group"
            sx={{
                fontFamily: "Calibri, Arial, Helvetica, sans-serif",
                '& *': {
                    fontFamily: "Calibri, Arial, Helvetica, sans-serif",
                },
            }}
        >
            <Typography variant="subtitle1" className="form-label">{label}</Typography>
            <Autocomplete
                multiple={multiple}
                limitTags={limitTags}
                options={options}
                disabled={disabled}
                filterOptions={filterOptions}
                getOptionLabel={(option) =>
                    option && option.firstname ? getDeptAssignee(option) : ""
                }
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                value={selectedValues}
                onChange={handleChange}
                sx={{
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        paddingTop: multiple && selectedValues.length > 2 ? "5px !important" : "0px",
                    },
                    minWidth: minWidth,
                }}
                {...(multiple
                    ? {
                        renderTags: (value, getTagProps) =>
                            value?.filter(option => option != null).map((option, index) => {
                                const imageSrc = ImageUrl(option);
                                const { key, ...tagProps } = getTagProps({ index });
                                return (
                                    <Chip
                                        key={key}
                                        avatar={
                                            imageSrc ? (
                                                <SafeAvatar src={imageSrc} alt={option?.firstname || ''} sx={chipAvatarSx} />
                                            ) : (
                                                <Avatar
                                                    sx={{
                                                        textTransform: "capitalize",
                                                        ...chipAvatarSx,
                                                        ...getAvatarColors(option?.firstname || ''),
                                                    }}
                                                >
                                                    {getInitials(option?.firstname, option?.lastname)}
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
                                                {`${option?.firstname || ''} ${option?.lastname || ''}`}
                                            </Box>
                                        }
                                        {...tagProps}
                                        sx={{
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            textTransform: "capitalize",
                                            mr: 0.5,
                                        }}
                                        {...commonTextFieldProps}
                                    />
                                );
                            }),
                    }
                    : {})}
                renderOption={(props, option) => {
                    const imageSrc = ImageUrl(option);
                    return (
                        <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <SafeAvatar
                                src={imageSrc}
                                alt={option.firstname}
                                sx={{
                                    width: 25,
                                    height: 25,
                                    marginRight: 1,
                                    fontSize: "14px",
                                    textTransform: "capitalize",
                                    ...getAvatarColors(option?.firstname),
                                }}
                            >
                                {!imageSrc && getInitials(option.firstname, option.lastname)}
                            </SafeAvatar>
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
                        placeholder={
                            multiple
                                ? selectedValues.length === 0
                                    ? placeholder
                                    : ""
                                : !selectedValues || !selectedValues.firstname
                                    ? placeholder
                                    : ""
                        }
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

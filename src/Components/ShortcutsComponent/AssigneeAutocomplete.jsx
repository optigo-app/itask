import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip, Box, Typography, Avatar } from "@mui/material";
import { commonTextFieldProps, getRandomAvatarColor, ImageUrl } from "../../Utils/globalfun";

const MultiSelectChipWithLimit = ({
    options,
    label,
    placeholder = "Select assignees",
    limitTags = 2,
    onChange,
    value
}) => {
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

    return (
        <Box className="form-group">
            <Typography variant="subtitle1" className="form-label">{label}</Typography>
            <Autocomplete
                multiple
                fullWidth
                options={options}
                getOptionLabel={(option) => option.firstname + " " + option.lastname}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedValues}
                onChange={handleChange}
                limitTags={limitTags}
                sx={{
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        paddingTop: selectedValues.length > 2 ? '5px !important' : '0px',
                    },
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                        const imageSrc = ImageUrl(option);
                        return (
                            <Chip
                                key={option.id}
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
                                // {...getTagProps({ index })}
                                sx={{ borderRadius: "8px", fontSize: "14px", textTransform: "capitalize" }}
                                {...commonTextFieldProps}
                            />
                        );
                    })
                }
                renderOption={(props, option) => {
                    const imageSrc = ImageUrl(option);
                    return (
                        <li {...props} key={option.id}>
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
                            {option.firstname} {option.lastname}
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
                    />
                )}
            />
        </Box>
    );
};

export default MultiSelectChipWithLimit;

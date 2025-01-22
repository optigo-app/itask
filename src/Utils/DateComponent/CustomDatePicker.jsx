import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Typography, Box } from "@mui/material";
import dayjs from "dayjs";

const CustomDatePicker = ({
    label,
    name,
    value,
    styleprops,
    onChange,
    customProps = {},
    sx = {},
    textFieldProps = {},
}) => {
    const customDatePickerProps = {
        slotProps: {
            popper: {
                sx: {
                    '& .MuiDateCalendar-root': {
                        borderRadius: '8px',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiButtonBase-root, .MuiPickersCalendarHeader-label, .MuiPickersYear-yearButton': {
                        color: '#444050',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiPickersDay-root, .MuiPickersYear-yearButton': {
                        '&:hover': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                        },
                    },
                    '& .MuiPickersDay-root.Mui-selected, .Mui-selected ': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                    '& .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton:hover': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                },
            },
        },
    };

    return (
        <Box className="form-group">
            <Typography className="form-label" variant="subtitle1">
                {label}
            </Typography>
            <DatePicker
                name={name}
                value={value ? dayjs(value) : null}
                onChange={onChange}
                {...customDatePickerProps}
                {...customProps}
                {...styleprops}
                sx={{ minWidth: 400, ...sx }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        fullWidth
                        className="textfieldsClass"
                        sx={{ padding: "0" }}
                        {...textFieldProps}
                    />
                )}
            />
        </Box>
    );
};

export default CustomDatePicker;

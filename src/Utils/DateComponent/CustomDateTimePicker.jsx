import React from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField, Typography, Box } from "@mui/material";
import dayjs from "dayjs";

const CustomDateTimePicker = ({
    label,
    name,
    value,
    width,
    styleprops,
    onChange,
    customProps = {},
    sx = {},
    textFieldProps = {},
}) => {
    const customDateTimePickerProps = {
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
                    '& .MuiPickersDay-root, .MuiPickersYear-yearButton, .MuiMultiSectionDigitalClockSection-item': {
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
                    '& .MuiMultiSectionDigitalClock-root': {
                        fontFamily: '"Public Sans", sans-serif',
                        backgroundColor: '#f9f9f9',
                    },
                    '& .MuiMultiSectionDigitalClockSection-item': {
                        width: '30px',
                        height: '30px',
                        borderRadius: "50%",
                        fontSize: '13px'
                    },
                    '& .MuiMultiSectionDigitalClockSection-item.Mui-selected': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                    '& .MuiClockPicker-pin': {
                        backgroundColor: '#7367f0',
                    },
                    '& .MuiClockPicker-arrowSwitcher-button': {
                        color: '#444050',
                        '&:hover': {
                            backgroundColor: '#e6e6e6',
                        },
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
            <DateTimePicker
                name={name}
                value={value ? dayjs(value) : null}
                onChange={onChange}
                {...customDateTimePickerProps}
                {...customProps}
                {...styleprops}
                sx={{ minWidth: width, ...sx }}
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

export default CustomDateTimePicker;

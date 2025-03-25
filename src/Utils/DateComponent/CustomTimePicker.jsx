import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { TextField, Typography, Box } from "@mui/material";
import dayjs from "dayjs";

const CustomTimePicker = ({
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
    const customTimePickerProps = {
        slotProps: {
            popper: {
                sx: {
                    '& .MuiPickersLayout-root': {
                        borderRadius: '8px',
                        fontFamily: '"Public Sans", sans-serif',
                        '& .Mui-selected': {
                            backgroundColor: '#7367f0 !important',
                            color: '#fff !important',
                            fontFamily: '"Public Sans", sans-serif',
                        },
                        '& .MuiMultiSectionDigitalClockSection-item': {
                            fontFamily: '"Public Sans", sans-serif',
                            fontSize: '14px',
                        },
                        '& .MuiDialogActions-root': {
                            '& .MuiButton-root': {
                                fontFamily: '"Public Sans", sans-serif',
                                backgroundColor: '#7367f0',
                                color: '#fff',
                            }
                        }
                    }
                },

            },
        },
    };

    return (
        <Box className="form-group">
            <Typography className="form-label" variant="subtitle1">
                {label}
            </Typography>
            <TimePicker
                name={name}
                value={value ? dayjs(value) : null}
                onChange={onChange}
                ampm={true}
                format="hh:mm A"
                {...customTimePickerProps}
                {...customProps}
                {...styleprops}
                sx={{ minWidth: width, ...sx }}
                textField={(params) => (
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

export default CustomTimePicker;
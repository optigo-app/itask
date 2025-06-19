import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { customDatePickerStyles } from '../../../Utils/globalfun';
import dayjs from 'dayjs';

const MenuDatePicker = ({ open, anchorEl, handleClose, value, onChange }) => {
    console.log('value: ', value);
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
                sx: {
                    p: 0,
                    m: 0,
                    borderRadius: '8px',
                    boxShadow: ''
                }
            }}
            MenuListProps={{
                disablePadding: true,
            }}
        >
            <MenuItem
                disableRipple
                disableGutters
                sx={{ m: 0, p: 0 }}
            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        value={value?.DeadLineDate ? dayjs(value.DeadLineDate) : null}
                        onChange={onChange}
                        orientation="portrait"
                        sx={customDatePickerStyles}
                        slotProps={{
                            toolbar: { hidden: true },
                            actionBar: { actions: [] }
                        }}
                        slots={{
                            actionBar: () => null,
                        }}
                    />
                </LocalizationProvider>
            </MenuItem>
        </Menu>
    );
};

export default MenuDatePicker;

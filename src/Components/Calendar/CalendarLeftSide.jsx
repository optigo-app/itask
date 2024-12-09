import React, { useState } from 'react';
import { Box, Button, Divider, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { Plus } from 'lucide-react';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Padding } from '@mui/icons-material';

const CalendarLeftSide = () => {
    const calendarsColor = {
        Personal: 'error',
        Business: 'primary',
        Family: 'warning',
        Holiday: 'success',
        ETC: 'info',
    };

    const [selectedCalendars, setSelectedCalendars] = useState(['Personal', 'Business']);

    const handleCalendarChange = (calendar) => {
        setSelectedCalendars((prev) =>
            prev.includes(calendar)
                ? prev.filter((item) => item !== calendar)
                : [...prev, calendar]
        );
    };

    const handleViewAllToggle = () => {
        if (selectedCalendars.length === Object.keys(calendarsColor).length) {
            setSelectedCalendars([]);
        } else {
            setSelectedCalendars(Object.keys(calendarsColor));
        }
    };

    const customDatePickerStyles = {
        '& .MuiDatePickerToolbar-root': {
            padding: '10px !important',
        },
        '& .MuiPickersToolbar-content': {
            '& .MuiTypography-root': {
                fontSize: '24px'
            },
        },
        '& .MuiDateCalendar-root': {
            borderRadius: '8px',
            fontFamily: '"Public Sans", sans-serif',
            color: '#444050',
            // margin:'0'
            maxHeight: '300px'
        },
        '& .MuiPickersYear-root': {
            '& .MuiPickersYear-yearButton': {
                fontFamily: '"Public Sans", sans-serif',
                color: '#444050',
                '&:hover': {
                    backgroundColor: '#7367f0',
                    color: '#fff',
                    borderRadius: '50px',
                },
            },
        },
        '& .css-6mw38q-MuiTypography-root': {
            display: 'none',
        },
        '& .MuiPickersCalendarHeader-label': {
            fontFamily: '"Public Sans", sans-serif',
            color: "#444050",
        },
        '& .MuiPickersDay-root': {
            fontFamily: '"Public Sans", sans-serif',
            color: '#444050',
            '&:hover': {
                backgroundColor: '#7367f0',
                color: '#fff',
            },
        },
        '& .MuiPickersDay-root.Mui-selected': {
            backgroundColor: '#7367f0',
            color: '#fff',
        },
        '& .MuiPickersDay-root.Mui-selected:hover': {
            backgroundColor: '#7367f0',
            color: '#fff',
        },
    };
    const renderFilters = Object.entries(calendarsColor).length
        ? Object.entries(calendarsColor).map(([key, value]) => {
            return (
                <FormControlLabel
                    key={key}
                    label={key}
                    sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary', fontSize: '15px' } }}
                    control={
                        <Checkbox
                            color={value}
                            checked={selectedCalendars.includes(key)}
                            onChange={() => handleCalendarChange(key)}
                        />
                    }
                />
            );
        })
        : null;

    return (
        <div className="calendarLeftMain">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                <Button fullWidth variant="contained" className="buttonClassname" sx={{ width: '230px', borderRadius: '8px', textTransform: 'capitalize' }}>
                    <Plus style={{ marginRight: '5px', opacity: '.9' }} size={20} />
                    Add Event
                </Button>
            </Box>
            <Divider sx={{ width: '100%', m: '0 !important' }} />
            <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        defaultValue={dayjs('2022-04-17')}
                        sx={customDatePickerStyles}
                        slots={{
                            actionBar: () => null,
                        }}
                    />
                </LocalizationProvider>
            </div>
            <Divider sx={{ width: '100%', m: '0 !important' }} />
            <Box sx={{ padding: '20px 60px', width: '100%', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '15px' }}>
                    Filters
                </Typography>
                <FormControlLabel
                    label="View All"
                    sx={{ '& .MuiFormControlLabel-label': { color: 'text.secondary' } }}
                    control={
                        <Checkbox
                            color="default"
                            checked={selectedCalendars.length === Object.keys(calendarsColor).length}
                            onChange={handleViewAllToggle}
                        />
                    }
                />
                {renderFilters}
            </Box>
        </div>
    );
};

export default CalendarLeftSide;

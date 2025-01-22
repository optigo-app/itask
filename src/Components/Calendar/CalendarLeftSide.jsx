import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { Plus } from 'lucide-react';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useSetRecoilState } from 'recoil';
import { calendarM, CalEventsFilter, CalformData } from '../../Recoil/atom';
import CalendarForm from './SideBar/CalendarForm';

const CalendarLeftSide = () => {

    const calendarsColor = {
        Personal: 'error',
        Business: 'primary',
        Family: 'warning',
        Holiday: 'success',
        ETC: 'info',
    };

    const [selectedCalendars, setSelectedCalendars] = useState(['Personal', 'Business', 'Family', 'Holiday', 'ETC']);
    const setSelectedCaleFilters = useSetRecoilState(CalEventsFilter);
    const setSelectedMon = useSetRecoilState(calendarM);
    const setCalFormData = useSetRecoilState(CalformData)
    const [caledrawerOpen, setCaledrawerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    useEffect(() => {
        setSelectedCaleFilters(selectedCalendars)
    }, []);

    const handleCalendarChange = (calendar) => {
        setSelectedCalendars((prev) =>
            prev.includes(calendar)
                ? prev.filter((item) => item !== calendar)
                : [...prev, calendar]
        );
        setSelectedCaleFilters(prev =>
            prev.includes(calendar) ?
                prev.filter(item => item !== calendar)
                : [...prev, calendar])
    };

    const handleViewAllToggle = () => {
        if (selectedCalendars.length === Object.keys(calendarsColor).length) {
            setSelectedCalendars([]);
            setSelectedCaleFilters([])
        } else {
            setSelectedCalendars(Object.keys(calendarsColor));
            setSelectedCaleFilters(Object.keys(calendarsColor))
        }
    };

    const customDatePickerStyles = {
        '& .MuiPickersLayout-root': {
            minWidth: '300px',
            width: '300px',
            margin: '0 auto',
        },
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
            backgroundColor: '#7367f0 !important',
            color: '#fff !important',
        },
        '& .MuiPickersDay-root.Mui-selected:hover': {
            backgroundColor: '#7367f0',
            color: '#fff',
        },
        '& .MuiPickersYear-yearButton.Mui-selected': {
            backgroundColor: '#7367f0 !important',
            color: '#fff !important',
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
                            checked={selectedCalendars?.includes(key)}
                            onChange={() => handleCalendarChange(key)}
                            sx={{
                                '& .MuiSvgIcon-root': {
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    transition: 'box-shadow 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                                    },
                                },
                            }}
                        />
                    }
                />
            );
        })
        : null;

    const handleAddEvent = (formValues) => {
        setCaledrawerOpen(true);
        const updatedFormValues = {
            ...formValues,
            start: selectedDate
        };
        console.log('updatedFormValues: ', updatedFormValues);
        setCalFormData(updatedFormValues);
    };

    const handleDrawerToggle = () => {
        setCaledrawerOpen(!caledrawerOpen);
    };

    const handleCaleFormSubmit = async (formValues) => {
        const updatedFormValues = {
            ...formValues,
            start: selectedDate
        };
        setCalFormData(updatedFormValues);
        const existingData = JSON.parse(localStorage.getItem('calformData')) || [];
        const existingEventIndex = existingData.findIndex(event => event.id === updatedFormValues.id);
        let updatedData;
        if (existingEventIndex !== -1) {
            updatedData = existingData.map((event, index) =>
                index === existingEventIndex ? updatedFormValues : event
            );
        } else {
            updatedData = [...existingData, updatedFormValues];
        }
        localStorage.setItem('calformData', JSON.stringify(updatedData));
    };

    const calendarMonthChange = (date) => {
        setSelectedDate(date);
        setSelectedMon(date);
    };

    return (
        <div className="calendarLeftMain">
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    marginBottom: '20px',
                    width: '100%'
                }}>
                <Button
                    fullWidth
                    variant="contained"
                    className="buttonClassname"
                    sx={{
                        width: '230px',
                        borderRadius: '8px',
                        textTransform: 'capitalize'
                    }}
                    onClick={handleAddEvent}
                >
                    <Plus style={{ marginRight: '5px', opacity: '.9' }} size={20} />
                    Add Event
                </Button>
            </Box>
            <Divider sx={{ width: '100%', m: '0 !important' }} />
            <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <StaticDatePicker
                        defaultValue={dayjs()}
                        sx={customDatePickerStyles}
                        slots={{
                            actionBar: () => null,
                        }}
                        onChange={calendarMonthChange}
                    />
                </LocalizationProvider>
            </div>
            <Divider sx={{ width: '100%', m: '0 !important' }} />
            <Box sx={{ padding: '20px 60px', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.disabled', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '15px' }}>
                    Filters
                </Typography>
                <FormControlLabel
                    label="View All"
                    sx={{ '& .MuiButtonBase-root': { color: 'red' } }}
                    control={
                        <Checkbox
                            color="default"
                            checked={selectedCalendars.length === Object.keys(calendarsColor).length}
                            onChange={handleViewAllToggle}
                            sx={{
                                '& .MuiSvgIcon-root': {
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                    borderRadius: '8px',
                                    transition: 'box-shadow 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
                                    },
                                },
                            }}
                        />
                    }
                />
                {renderFilters}
            </Box>
            <CalendarForm
                open={caledrawerOpen}
                onClose={handleDrawerToggle}
                onSubmit={handleCaleFormSubmit}
            />
        </div>
    );
};

export default CalendarLeftSide;

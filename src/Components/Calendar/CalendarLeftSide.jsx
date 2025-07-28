import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Typography, Checkbox, FormControlLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Plus } from 'lucide-react';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useSetRecoilState } from 'recoil';
import { calendarM, CalEventsFilter, CalformData, formData, openFormDrawer, rootSubrootflag } from '../../Recoil/atom';
import { customDatePickerStyles } from '../../Utils/globalfun';
import TasklistForCal from './TasklistForCal';

const CalendarLeftSide = ({ calendarsColor }) => {
   
    const [selectedCalendars, setSelectedCalendars] = useState([]);
    const setSelectedCaleFilters = useSetRecoilState(CalEventsFilter);
    const setSelectedMon = useSetRecoilState(calendarM);
    const setCalFormData = useSetRecoilState(CalformData)
    const setFormDrawerOpen = useSetRecoilState(openFormDrawer);
    const setFormDataValue = useSetRecoilState(formData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [caledrawerOpen, setCaledrawerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [view, setView] = useState("filter");

    const handleChange = (event, newView) => {
        if (newView !== null) {
            setView(newView);
        }
    }

    useEffect(() => {
        setSelectedCalendars(Object.keys(calendarsColor));
        setSelectedCaleFilters(Object.keys(calendarsColor));
    }, [calendarsColor, setSelectedCaleFilters]);

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
            setSelectedCaleFilters([]);
        } else {
            setSelectedCalendars(Object.keys(calendarsColor));
            setSelectedCaleFilters(Object.keys(calendarsColor));
        }
    };

    const renderFilters = Object?.entries(calendarsColor)?.length
        ? Object?.entries(calendarsColor)?.map(([key, value]) => {
            return (
                <FormControlLabel
                    key={key}
                    label={key}
                    sx={{ '& .MuiFormControlLabel-label': { textTransform: 'capitalize', color: '#7D7f85', fontSize: '15px' } }}
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
        // setCaledrawerOpen(true);
        setFormDrawerOpen(true);
        const updatedFormValues = {
            ...formValues,
            start: selectedDate
        };
        setCalFormData(updatedFormValues);
        setFormDataValue(updatedFormValues);
        setRootSubroot({
            Task: 'meeting'
        });
    };

    const handleDrawerToggle = () => {
        setCaledrawerOpen(!caledrawerOpen);
    };

    const calendarMonthChange = (date) => {
        setSelectedDate(date);
        setSelectedMon(date);
    };

    return (
        <div className="calendarLeftMain">
            <Box className="cal_leftSidetgBox">
                <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleChange}
                    aria-label="toggle filter or task list"
                    className="toggle-group"
                    size='small'
                    sx={{ borderRadius: '8px' }}
                >
                    <ToggleButton value="filter" aria-label="filter" className='toggle-button'>
                        Event
                    </ToggleButton>
                    <ToggleButton value="tasklist" aria-label="task list" className='toggle-button'>
                        Task List
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            <Divider sx={{ width: '100%', m: '0 !important' }} />
            {view === 'filter' ? (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative',
                            marginBlock: '20px',
                            width: '100%'
                        }}>
                        <Button
                            fullWidth
                            className="buttonClassname"
                            sx={{
                                width: '220px',
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
                                    checked={selectedCalendars?.length === Object.keys(calendarsColor).length}
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
                    {/* <CalendarForm
                        open={caledrawerOpen}
                        onClose={handleDrawerToggle}
                        onSubmit={handleCaleFormSubmit}
                    /> */}
                </>
            ) :
                <TasklistForCal calendarsColor={calendarsColor} />
            }
        </div >
    );
};

export default CalendarLeftSide;

import React, { useEffect, useRef, useState } from 'react';
import "../../../Pages/Reports/CalendarReport/CalendarReport.scss";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { Calendar as CalendarIcon, List } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { FullSidebar } from '../../../Recoil/atom';

const ReadOnlyCalendar = ({ calendarEvents, calendarsColor, isLoading, selectedEmployee, setSideDrawer }) => {
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const lastScrollTime = useRef(0);
     const isFullSidebar = useRecoilValue(FullSidebar);

    useEffect(() => {
        if (calendarRef?.current) {
            setCalendarApi(calendarRef?.current?.getApi());
        }
    }, []);

    // Smooth scroll to 9:15 AM
    const smoothScrollToTime = (timeString = '09:15:00') => {
        const now = Date.now();
        if (now - lastScrollTime.current < 1000) {
            return;
        }
        if (calendarApi) {
            lastScrollTime.current = now;
            setTimeout(() => {
                calendarApi.scrollToTime(timeString);
            }, 200);
        }
    };

    useEffect(() => {
        if (calendarApi) {
            smoothScrollToTime();
        }
    }, [calendarApi]);

    // Scroll to 9:15 AM when employee changes
    useEffect(() => {
        if (calendarApi && selectedEmployee) {
            smoothScrollToTime();
        }
    }, [calendarApi, selectedEmployee]);

    const calendarOptions = {
        firstDay: 1,
        events: calendarEvents?.map((event) => ({
            id: event?.meetingid?.toString(),
            title: event?.meetingtitle || '',
            start: event?.StartDate,
            end: event?.EndDate,
            isAllDay: event?.isAllDay ? 1 : 0,
            ismilestone: event?.ismilestone,
            descr: event?.Desc,
            category: event?.category || '',
            workcategoryid: event?.workcategoryid,
            statusid: event?.statusid,
            status: event?.status,
            priorityid: event?.priorityid,
            priority: event?.priority,
            estimate_hrs: event?.estimate_hrs || 0,
            estimate1_hrs: event?.estimate1_hrs || 0,
            estimate2_hrs: event?.estimate2_hrs || 0,
            workinghr: event?.workinghr || 0,
            DeadLineDate: event?.DeadLineDate,
            extendedProps: {
                guests: event?.guests,
                estimate: 1,
                prModule: {
                    taskid: event?.taskid,
                    projectid: event?.projectid,
                    taskname: event?.taskname,
                    projectname: event?.ProjectName,
                    taskPr: event?.ProjectName,
                },
                taskid: event?.taskid,
                parentid: event?.parentid,
                projectid: event?.projectid,
                workcategoryid: event?.workcategoryid,
                category: event?.category || '',
                statusid: event?.statusid,
                status: event?.status,
                priorityid: event?.priorityid,
                priority: event?.priority,
                estimate_hrs: event?.estimate_hrs || 0,
                estimate1_hrs: event?.estimate1_hrs || 0,
                estimate2_hrs: event?.estimate2_hrs || 0,
                DeadLineDate: event?.DeadLineDate,
                descr: event?.Desc,
                ismilestone: event?.ismilestone,
            },
        })),
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
        initialView: 'timeGridWeek',
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        slotDuration: '00:15:00',
        slotLabelInterval: '00:15:00',
        headerToolbar: {
            start: 'employeeSidebarToggle,prev,next title',
            center: '',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        },
        customButtons: {
            employeeSidebarToggle: {
                text: '☰',
                click() {
                    setSideDrawer(prev => !prev);
                }
            }
        },
        views: {
            week: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
            },
        },
        // Make calendar read-only
        editable: false,
        droppable: false,
        eventResizableFromStart: false,
        resizable: false,
        dragScroll: false,
        selectable: false,
        selectMirror: false,
        dayMaxEvents: 4,
        moreLinkClick: 'popover',
        navLinks: false,
        weekNumbers: true,
        eventClassNames({ event }) {
            const category = event.extendedProps.category || 'ETC';
            const colorClass = calendarsColor[category] || 'primary';
            return [`bg-${colorClass}`];
        },
        dayHeaderContent(arg) {
            const calendarApi = arg.view.calendar;
            const currentView = arg.view.type;

            const dayEvents = calendarApi.getEvents().filter((event) => {
                const eventDate = new Date(event.start).toDateString();
                const headerDate = arg.date.toDateString();
                return eventDate === headerDate;
            });

            const totalHours = dayEvents.reduce((sum, event) => {
                return sum + (event.extendedProps?.estimate_hrs || 0);
            }, 0);

            const formatTotalHours = (hours) => {
                if (hours === 0) return '0 hrs';
                const unit = hours <= 1 ? 'hr' : 'hrs';
                return `${hours} ${unit}`;
            };

            const formatForView = (date, viewType) => {
                if (viewType === 'dayGridMonth') {
                    return date.toLocaleDateString('en-US', { weekday: 'long' });
                } else {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    return `${dayName} ${day}-${month}`;
                }
            };

            const formattedDate = formatForView(arg.date, currentView);
            const totalText = formatTotalHours(totalHours);

            if (currentView === 'dayGridMonth') {
                return {
                    html: `
                        <div class="calendar-day-header">
                            <div class="date-text">${formattedDate}</div>
                        </div>
                    `,
                };
            }

            return {
                html: `
                    <div class="calendar-day-header">
                        <div class="date-text">${formattedDate}</div>
                        <div class="estimate-text">(${totalText})</div>
                    </div>
                `,
            };
        },
        eventContent(arg) {
            const { event } = arg;
            const currentView = arg.view.type;
            const estimateHrs = event.extendedProps?.estimate_hrs || 0;

            const formatEstimate = (hours) => {
                if (hours === 0) return '';
                const unit = hours <= 1 ? 'hr' : 'hrs';
                return `(${hours} ${unit})`;
            };

            const estimateText = formatEstimate(estimateHrs);

            if (currentView === 'dayGridMonth') {
                return {
                    html: `
                        <div class="fc-event-main-frame calendar-event-container month-event">
                            <div class="fc-event-content">
                                <span class="fc-event-title">${event.title || ''}</span>
                                ${estimateText ? `<span class="fc-event-estimate">${estimateText}</span>` : ''}
                            </div>
                            <style>
                                .month-event {
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    align-items: center;
                                    padding: 0;
                                }
                                .month-event .fc-event-content {
                                    width: 100%;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    overflow: hidden;
                                }
                                .month-event .fc-event-title {
                                    flex: 1;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    font-size: inherit;
                                }
                                .month-event .fc-event-estimate {
                                    flex-shrink: 0;
                                    font-size: 0.65em;
                                    opacity: 0.8;
                                }
                            </style>
                        </div>
                    `,
                };
            }

            return {
                html: `
                    <div class="fc-event-main-frame calendar-event-container">
                        <div class="fc-event-time">${arg.timeText}</div>
                        <div class="fc-event-title-container">
                            <div class="fc-event-title fc-sticky">
                                ${event.title || ''} ${estimateText}
                            </div>
                        </div>
                    </div>
                `,
            };
        },
        eventClick() {
            return false;
        },
        dateClick() {
            return false;
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [isFullSidebar]);

    if (!selectedEmployee) {
        return (
            <Box className="calendar-report-container" sx={{ height: '100%', position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 10,
                    }}
                    className="employee-toggle"
                >
                    <IconButton
                        onClick={() => setSideDrawer(prev => !prev)}
                        className="employee-toggle-btn"
                        sx={{
                            backgroundColor: 'transparent',
                            color: '#7367f0',
                            '&:hover': {
                                backgroundColor: 'rgba(115, 103, 240, 0.1)',
                                color: '#5a52d5',
                            },
                        }}
                    >
                        <List size={20} />
                    </IconButton>
                </Box>

                {/* No employee selected content */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#7d7f85',
                    }}
                >
                    <CalendarIcon size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
                        No Employee Selected
                    </Typography>
                    <Typography variant="body2">
                        Please select an employee from the list to view their calendar
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                    Loading calendar data...
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="readOnlyCalendar" sx={{ height: '100%', padding: '10px' }}>
            {/* {selectedEmployee && (
                <Box
                    sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: '#f5f5f7',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CalendarIcon size={20} style={{ color: '#7367f0' }} />
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {selectedEmployee.firstname} {selectedEmployee.lastname}'s Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedEmployee.department || 'No Department'} • Read-only view
                        </Typography>
                    </Box>
                </Box>
            )} */}
            <FullCalendar ref={calendarRef} {...calendarOptions} />
        </Box>
    );
};

export default ReadOnlyCalendar;

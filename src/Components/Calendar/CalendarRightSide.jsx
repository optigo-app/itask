import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarData, calendarM, calendarSideBarOpen, CalEventsFilter, CalformData, FullSidebar, rootSubrootflag } from '../../Recoil/atom';
import { Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider } from '@mui/material';
import { AddMeetingApi } from '../../Api/MeetingApi/AddMeetingApi';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import { PERMISSIONS } from '../Auth/Role/permissions';
import { toast } from 'react-toastify';

const Calendar = ({
    isLoding,
    assigneeData,
    selectedAssignee,
    hasAccess,
    calendarsColor,
    handleCaleFormSubmit,
    handleAssigneeChange,
    setFormDrawerOpen,
    setFormDataValue,
}) => {
    const isFullSidebar = useRecoilValue(FullSidebar);
    const setSidebarToggle = useSetRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const lastScrollTime = useRef(0);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const selectedEventfilter = useRecoilValue(CalEventsFilter)
    const [calEvData, setCalEvData] = useRecoilState(calendarData);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const [duplicateDialog, setDuplicateDialog] = useState({ open: false, event: null });


    // Smooth scroll to 9:15 AM function with throttling
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
        if (calendarRef?.current) {
            setCalendarApi(calendarRef?.current?.getApi());
        }
    }, []);

    useEffect(() => {
        if (calendarApi) {
            smoothScrollToTime();
        }
    }, [calendarApi]);

    // Handle date changes
    useEffect(() => {
        if (calendarApi && date) {
            const validDate = new Date(date);
            if (!isNaN(validDate?.getTime())) {
                calendarApi.gotoDate(validDate);
                setTimeout(() => {
                    smoothScrollToTime();
                }, 500);
            } else {
                console.error('Invalid date:', date);
            }
        }
    }, [date, calendarApi]);


    const handleDuplicate = (event) => {
        setDuplicateDialog({ open: true, event });
    };

    const filterEvents = (events, selectedCalendars) => {
        return events?.filter(event =>
            !event?.category || selectedCalendars?.includes(event.category)
        ) || [];
    };

    const filteredEvents = filterEvents(calEvData, selectedEventfilter);
    // const filteredEvents = calEvData

    useEffect(() => {
        if (hasAccess(PERMISSIONS.CALENDAR_A_DROPDOWN)) {
            const toolbarChunks = document.querySelectorAll('.fc-header-toolbar .fc-toolbar-chunk');
            if (toolbarChunks.length >= 2) {
                const targetDiv = toolbarChunks[1];
                targetDiv.innerHTML = '';
                const container = document.createElement('div');
                targetDiv.appendChild(container);
                const root = ReactDOM.createRoot(container);
                root.render(
                    <Box className="meetingAssigneBox" sx={{ minWidth: 280 }}>
                        <DepartmentAssigneeAutocomplete
                            name="assignee"
                            minWidth={200}
                            value={selectedAssignee}
                            options={assigneeData}
                            label="Assignees"
                            placeholder="Select assignees"
                            limitTags={2}
                            onChange={handleAssigneeChange}
                            multiple={false}
                        />
                    </Box>
                );
            }
        }
    }, []);

    const mapEventDetails = (event) => {
        const start = event?.start ?? event?.StartDate;
        const end = event?.end ?? event?.EndDate ?? start;
        return {
            meetingid: event?.id ?? event?.meetingid,
            title: event?.title ?? event?.meetingtitle ?? '',
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
            isAllDay: event?.allDay ? 1 : (event?.isAllDay ? 1 : 0),
            ismilestone: event?.ismilestone,
            descr: event?.extendedProps?.descr ?? event?.Desc ?? '',
            category: event?.extendedProps?.category ?? event?.category ?? '',
            workcategoryid: event?.extendedProps?.workcategoryid ?? event?.workcategoryid,
            statusid: event?.extendedProps?.statusid ?? event?.statusid,
            status: event?.extendedProps?.status ?? event?.status,
            priorityid: event?.extendedProps?.priorityid ?? event?.priorityid,
            priority: event?.extendedProps?.priority ?? event?.priority,
            estimate_hrs: event?.extendedProps?.estimate_hrs ?? event?.estimate_hrs ?? 0,
            estimate1_hrs: event?.extendedProps?.estimate1_hrs ?? event?.estimate1_hrs ?? 0,
            estimate2_hrs: event?.extendedProps?.estimate2_hrs ?? event?.estimate2_hrs ?? 0,
            workinghr: event?.extendedProps?.workinghr ?? event?.workinghr ?? 0,
            DeadLineDate: event?.extendedProps?.DeadLineDate ?? event?.DeadLineDate,
            taskid: event?.extendedProps?.taskid ?? event?.taskid,
            parentid: event?.extendedProps?.parentid ?? event?.parentid,
            projectid: event?.extendedProps?.projectid ?? event?.projectid,
            prModule: event?.extendedProps?.prModule ?? {
                taskid: event?.taskid,
                parentid: event?.parentid,
                projectid: event?.projectid,
                taskname: event?.taskname,
                projectname: event?.ProjectName,
                taskPr: event?.ProjectName
            },
            guests: event?.extendedProps?.guests ?? event?.guests ?? [],
            assigneids: event?.extendedProps?.guests?.map(u => u.id)?.join(',') ?? '',
            estimate: event?.extendedProps?.estimate ?? (event?.extendedProps?.estimate_hrs || 1),
            description: event?.extendedProps?.description ?? event?.Desc ?? '',
        };
    };
    const calendarOptions = {
        firstDay: 1,
        events: filteredEvents?.map(event => ({
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
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
        initialView: 'timeGridWeek',
        slotMinTime: "07:00:00",
        slotMaxTime: "22:00:00",
        slotDuration: "00:15:00",
        slotLabelInterval: "00:15:00",
        headerToolbar: {
            start: 'sidebarToggle, prev, next, title',
            center: '',
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        },
        views: {
            week: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
            },
        },
        editable: true,
        droppable: true,
        eventResizableFromStart: true,
        resizable: true,
        dragScroll: true,
        dayMaxEvents: false,
        navLinks: true,
        weekNumbers: true,
        customButtons: {
            sidebarToggle: {
                icon: 'bi bi-list',
                click() {
                    setSidebarToggle(prev => !prev);
                }
            }
        },
        eventClassNames({ event }) {
            const category = event.extendedProps.category || 'ETC';
            const colorClass = calendarsColor[category] || 'primary';
            return [`bg-${colorClass}`];
        },

        dayHeaderContent(arg) {
            const calendarApi = arg.view.calendar;
            const dayEvents = calendarApi.getEvents().filter(event => {
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

            const formatDate = (date) => {
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const day = date.getDate();
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                return `${dayName} ${day}-${month}`;
            };

            const formattedDate = formatDate(arg.date);
            const totalText = formatTotalHours(totalHours);

            return {
                html: `
                    <div class="calendar-day-header" style="text-align: center; font-weight: 600; font-size: 15px;">
                        <div class="date-text">${formattedDate}</div>
                        <div class="estimate-text">(${totalText})</div>
                    </div>
                    <style>
                        .calendar-day-header {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 2px;
                        }
                        
                        @media (min-width: 1441px) {
                            .calendar-day-header {
                                flex-direction: row;
                                justify-content: center;
                                gap: 4px;
                            }
                        }
                        
                        .date-text {
                            white-space: nowrap;
                        }
                        
                        .estimate-text {
                            font-size: 13px;
                            opacity: 0.8;
                        }
                    </style>
                `
            };
        },

        eventContent(arg) {
            const { event } = arg;
            const estimateHrs = event.extendedProps?.estimate_hrs || 0;
            const formatEstimate = (hours) => {
                if (hours === 0) return '';
                const unit = hours <= 1 ? 'hr' : 'hrs';
                return `(${hours} ${unit})`;
            };

            const estimateText = formatEstimate(estimateHrs);
            
            return {
                html: `
                    <div class="fc-event-main-frame calendar-event-container">
                        <div class="fc-event-time">${arg.timeText}</div>
                        <div class="fc-event-title-container">
                            <div class="fc-event-title fc-sticky">
                                ${event.title || ''} ${estimateText}
                            </div>
                        </div>
                        <button class="duplicate-btn" data-event-id="${event.id}" title="Duplicate Event">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <style>
                            .calendar-event-container {
                                position: relative;
                            }
                            .duplicate-btn {
                                position: absolute;
                                top: 2px;
                                right: 2px;
                                width: 34px;
                                height: 34px;
                                border-radius: 50%;
                                border: 1px solid #ccc;
                                background: rgba(255, 255, 255, 0.9);
                                color: #666;
                                cursor: pointer;
                                display: none;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                                transition: all 0.2s ease;
                                z-index: 10;
                            }
                            .calendar-event-container:hover .duplicate-btn {
                                display: flex;
                            }
                            .duplicate-btn:hover {
                                background: #7367f0;
                                color: white;
                                transform: scale(1.1);
                                box-shadow: 0 4px 8px rgba(115, 103, 240, 0.3);
                            }
                        </style>
                    </div>
                `
            };
        },

        eventDidMount(info) {
            const duplicateBtn = info.el.querySelector('.duplicate-btn');
            if (duplicateBtn) {
                duplicateBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDuplicate(info.event);
                });
            }
            info.el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, true);
            
            info.el.addEventListener('mousedown', (e) => {
                if (e.button === 2) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true);
        },
        
        eventAllow(dropInfo, draggedEvent) {
            return !draggedEvent.extendedProps?.isMeeting;
        },
        

        dateClick(info) {
            const startDate = new Date(info.dateStr);
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
            
            const eventDetails = {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                estimate_hrs: 1, // Default 1 hour estimate
            };
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            setRootSubroot({ Task: "meeting" });
            setFormDrawerOpen(true);
        },

        eventClick({ event }) {
            const eventDetails = mapEventDetails(event);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            setRootSubroot({ Task: "meeting" });
            setFormDrawerOpen(true);
        },

        eventDrop({ event }) {
            if (event.extendedProps?.isMeeting) return;

            const eventDetails = mapEventDetails(event);
            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? { ...ev, StartDate: eventDetails?.start, EndDate: eventDetails?.end }
                    : ev
            );

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails);
        },

        eventResize({ event }) {
            if (event.extendedProps?.isMeeting) return;
            const start = event.start;
            const end = event.end ?? start;
            const diffInMs = end.getTime() - start.getTime();
            const diffInHours = diffInMs / (1000 * 60 * 60);
            const eventDetails = {
                ...mapEventDetails(event),
                estimate_hrs: diffInHours || 1,
            };
            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? {
                        ...ev,
                        StartDate: eventDetails.start,
                        EndDate: eventDetails.end,
                        estimate_hrs: eventDetails.estimate_hrs,
                    }
                    : ev
            );
            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails);
        },
        eventReceive({ event }) {
            if (!event?.title) return;
            const eventDetails = mapEventDetails(event);
            const startDate = new Date(eventDetails.start);
            const estimateHours = eventDetails.estimate_hrs || eventDetails.estimate || 1;
            const endDate = new Date(startDate.getTime() + estimateHours * 60 * 60 * 1000);
            eventDetails.end = endDate.toISOString();
            eventDetails.estimate_hrs = estimateHours;
            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? { 
                        ...ev, 
                        StartDate: eventDetails.start, 
                        EndDate: eventDetails.end,
                        estimate_hrs: estimateHours
                    }
                    : ev
            );

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails);
        },
    };

    const handleDuplicateEdit = () => {
        const { event } = duplicateDialog;
        const eventDetails = mapEventDetails(event);

        setCalFormData(eventDetails);
        setFormDataValue(eventDetails);
        setRootSubroot({ Task: "meeting" });
        setFormDrawerOpen(true);
        setDuplicateDialog({ open: false, event: null });
    };

    const handleDuplicateRepeat = async () => {
        const { event } = duplicateDialog;
        const eventDetails = mapEventDetails(event);
        
        const duplicatedEvent = {
            ...eventDetails,
            meetingid: "",
            title: eventDetails.title,
            entrydate: new Date().toISOString(),
            repeatflag: "repeat",
        };

        try {
            await handleCaleFormSubmit(duplicatedEvent);
            setDuplicateDialog({ open: false, event: null });
            toast.success("Event repeated successfully");
        } catch (error) {
            console.error("Error repeating event:", error);
            toast.error("Error repeating event");
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
            }
        }, 500); 

        return () => clearTimeout(timer);
    }, [isFullSidebar]);

    return (
        <>
            <FullCalendar ref={calendarRef} {...calendarOptions} />
            
            {/* Duplicate Dialog */}
            <Dialog
                open={duplicateDialog.open}
                onClose={() => setDuplicateDialog({ open: false, event: null })}
                aria-labelledby="duplicate-dialog-title"
                aria-describedby="duplicate-dialog-description"
                className='DRM'
            >
                <DialogTitle id="duplicate-dialog-title" className='alert-TitleCl'>
                    Duplicate Event
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="duplicate-dialog-description" className='alert-titleContent'>
                        How would you like to duplicate this event?
                    </DialogContentText>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button 
                        className='for_DialogBtn' 
                        onClick={handleDuplicateEdit} 
                        autoFocus 
                        fullWidth
                    >
                        Edit
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Button 
                        className='for_DialogBtn' 
                        onClick={handleDuplicateRepeat} 
                        autoFocus 
                        fullWidth
                    >
                        Repeat
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Calendar;

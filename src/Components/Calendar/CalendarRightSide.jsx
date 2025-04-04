import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarData, calendarM, calendarSideBarOpen, CalEventsFilter, CalformData } from '../../Recoil/atom';
import CalendarForm from './SideBar/CalendarForm';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';

const Calendar = ({ isLoding, calendarsColor, handleCaleFormSubmit }) => {
    const setSidebarToggle = useSetRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const selectedEventfilter = useRecoilValue(CalEventsFilter)
    const [caledrawerOpen, setCaledrawerOpen] = useState(false);
    const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);
    const [formData, setFormData] = useState();
    const [calEvData, setCalEvData] = useRecoilState(calendarData);
    console.log('calEvData: ', calEvData);

    const handleDrawerToggle = () => {
        setCaledrawerOpen(!caledrawerOpen);
    };

    useEffect(() => {
        if (calendarRef?.current) {
            setCalendarApi(calendarRef?.current?.getApi());
        }
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (calendarApi && date) {
                const validDate = new Date(date);
                if (!isNaN(validDate?.getTime())) {
                    calendarApi.gotoDate(validDate);
                } else {
                    console.error('Invalid date:', date);
                }
            }
        }, 500);
    }, [date, calendarApi]);

    // const filterEvents = (events, selectedCalendars) => {
    //     return events && events?.filter((event) => selectedCalendars?.includes(event?.category));
    // };

    // const filteredEvents = filterEvents(calEvData, selectedEventfilter);
    const filteredEvents = calEvData
    console.log('filteredEvents: ', filteredEvents);


    const calendarOptions = {
        events: filteredEvents.map(event => {
            console.log('event: ', event);
            return {
                id: event.meetingid.toString(),
                title: event.meetingtitle || 'Untitled Event',
                start: event.StartDate,
                end: event.EndDate,
                allDay: event.isAllDay ? 1 : 0,
                description: event.Desc,
                category: event?.category,
                extendedProps: {
                    guests: event?.guests,
                    estimate: 1,
                    prModule: {
                        taskid: event?.taskid,
                        projectid: event?.projectid,
                        taskname: event?.taskname,
                        projectname: event?.ProjectName,
                        taskPr: event?.ProjectName
                    },
                    taskid: event?.taskid,
                    projectid: event?.projectid,
                },
            };
        }),
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
        initialView: 'dayGridMonth',
        slotMinTime: "07:00:00",  // Start from 7 AM
        slotMaxTime: "22:00:00",
        slotDuration: "00:30:00",
        headerToolbar: {
            start: 'sidebarToggle, prev, next, title',
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
        dayMaxEvents: 2,
        navLinks: true,
        eventClassNames({ event }) {
            const category = event.extendedProps.category || 'ETC';
            console.log('category: ', category);
            const colorClass = calendarsColor[category] || 'primary';
            return [`bg-${colorClass}`];
        },
        eventAllow: function (dropInfo, draggedEvent) {
            return !draggedEvent.extendedProps?.isMeeting;
        },
        eventClick({ event: clickedEvent }) {
            const startDate = clickedEvent?.start;
            const endDate = clickedEvent?.end ?? startDate;
            const eventDetails = {
                id: clickedEvent?.id,
                title: clickedEvent?.title,
                start: startDate?.toISOString(),
                end: endDate?.toISOString(),
                taskid: clickedEvent?.extendedProps?.taskid,
                projectid: clickedEvent?.extendedProps?.projectid,
                description: clickedEvent?.extendedProps?.description,
                prModule: clickedEvent?.extendedProps?.prModule,
                guests: clickedEvent?.extendedProps?.guests,
                category: clickedEvent?.extendedProps?.category,
                estimate: clickedEvent?.extendedProps?.estimate || 1,
                allDay: clickedEvent?.allDay ? 1 : 0,
            };
            setCalFormData(eventDetails);
            setCaledrawerOpen(true);
        },
        customButtons: {
            sidebarToggle: {
                icon: 'bi bi-list',
                click() {
                    setSidebarToggle(prevState => !prevState);
                },
            },
        },
        dateClick(info) {
            const eventDetails = {
                start: info.dateStr,
            };
            setCalFormData(eventDetails);
            setCaledrawerOpen(true);
        },
        eventDrop({ event: droppedEvent }) {
            console.log('droppedEvent: ', droppedEvent);
            if (droppedEvent.extendedProps?.isMeeting) return;
            const startDate = droppedEvent?.start;
            const endDate = droppedEvent?.end ?? startDate;
            const updatedEvent = {
                id: droppedEvent.id,
                title: droppedEvent.title,
                start: startDate?.toISOString(),
                end: endDate?.toISOString(),
                taskid: droppedEvent.extendedProps?.taskid,
                projectid: droppedEvent.extendedProps?.projectid,
                prModule: droppedEvent.extendedProps?.prModule,
                guests: droppedEvent.extendedProps?.guests,
                assigneids: droppedEvent.extendedProps?.guests?.map(user => user.id)?.join(","),
                description: droppedEvent.extendedProps.description,
                category: droppedEvent.extendedProps.category,
                guests: droppedEvent.extendedProps.guests,
                estimate: droppedEvent.extendedProps.estimate || 1,
                allDay: droppedEvent.allDay ? 1 : 0,
            };

            const data = calEvData?.map(event => {
                if (event?.meetingid == updatedEvent?.id) {
                    return {
                        ...event,
                        StartDate: updatedEvent?.start,
                        EndDate: updatedEvent?.end,
                    };
                } else {
                    return event;
                }
            });
            setCalEvData(data);
            setCalFormData(updatedEvent);
            handleCaleFormSubmit(updatedEvent);
        },
        eventReceive({ event: receivedEvent }) {
            console.log('receivedEvent: ', receivedEvent);
            const estimate = receivedEvent?.extendedProps?.estimate || 1;

            const startDate = receivedEvent?.start ? new Date(receivedEvent.start) : new Date();
            const endDate = new Date(startDate.getTime() + estimate * 60 * 60 * 1000);

            const newEvent = {
                id: receivedEvent?.id,
                title: receivedEvent?.title || "Untitled Event",
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                taskid: receivedEvent?.extendedProps?.taskid || 0,
                projectid: receivedEvent?.extendedProps?.projectid || 0,
                prModule: receivedEvent?.extendedProps?.prModule || {},
                guests: receivedEvent?.extendedProps?.guests || [],
                assigneids: receivedEvent?.extendedProps?.guests?.map(user => user.id)?.join(","),
                description: receivedEvent?.extendedProps?.description || "",
                category: receivedEvent?.extendedProps?.category || "",
                guests: receivedEvent?.extendedProps?.guests || [],
                estimate: estimate,
                allDay: receivedEvent?.allDay ? 1 : 0,
            };

            const data = calEvData?.map(event => {
                if (event?.meetingid == newEvent?.id) {
                    return {
                        ...event,
                        StartDate: newEvent?.start,
                        EndDate: newEvent?.end,
                    };
                }
                else {
                    return event;
                }
            });
            setCalEvData(data);
            setCalFormData(newEvent);
            handleCaleFormSubmit(newEvent);
        },
        eventResize({ event: resizedEvent }) {
            if (resizedEvent.extendedProps?.isMeeting) return;
            const updatedEvent = {
                id: resizedEvent.id,
                title: resizedEvent.title,
                start: resizedEvent.start?.toISOString(),
                end: resizedEvent.end?.toISOString(),
                taskid: resizedEvent.extendedProps?.taskid,
                projectid: resizedEvent.extendedProps?.projectid,
                prModule: resizedEvent.extendedProps?.prModule,
                guests: resizedEvent.extendedProps?.guests,
                assigneids: resizedEvent.extendedProps?.guests?.map(user => user.id)?.join(","),
                description: resizedEvent.extendedProps?.description,
                category: resizedEvent.extendedProps?.category,
                guests: resizedEvent.extendedProps?.guests,
                estimate: resizedEvent.extendedProps?.estimate || 1,
                allDay: resizedEvent.allDay ? 1 : 0,
            };
            const data = calEvData?.map(event => {
                if (event?.meetingid == updatedEvent?.id) {
                    return {
                        ...event,
                        StartDate: updatedEvent?.start,
                        EndDate: updatedEvent?.end,
                    };
                } else {
                    return event;
                }
            });
            setCalEvData(data);
            setCalFormData(updatedEvent);
            handleCaleFormSubmit(updatedEvent);
        }
    };


    const handleRemove = (formValue) => {
        setFormData(formValue)

        setCnfDialogOpen(true);
    };

    const handleConfirmRemoveAll = () => {
        const updatedData = filteredEvents?.filter(event => event?.id !== formData?.id);
        setCalFormData(updatedData)
        localStorage.setItem('calformData', JSON?.stringify(updatedData));
        setCnfDialogOpen(false);
        setCaledrawerOpen(false);
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    return (
        <>
            <FullCalendar {...calendarOptions} />
            <CalendarForm
                open={caledrawerOpen}
                onClose={handleDrawerToggle}
                onSubmit={handleCaleFormSubmit}
                onRemove={handleRemove}
            />
            <ConfirmationDialog
                open={opencnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this Event?"
            />
        </>
    );
};

export default Calendar;

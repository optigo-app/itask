import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarM, calendarSideBarOpen, CalEventsFilter, CalformData } from '../../Recoil/atom';
import CalendarForm from './SideBar/CalendarForm';
import ConfirmationDialog from '../../Utils/ConfirmationDialog/ConfirmationDialog';

const Calendar = () => {
    const setSidebarToggle = useSetRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const calFormData = useRecoilValue(CalformData);
    const selectedEventfilter = useRecoilValue(CalEventsFilter)
    const [caledrawerOpen, setCaledrawerOpen] = useState(false);
    const [opencnfDialogOpen, setCnfDialogOpen] = useState(false);
    const [formData, setFormData] = useState();
    const [calEvData, setCalEvData] = useState([]);

    const handleDrawerToggle = () => {
        setCaledrawerOpen(!caledrawerOpen);
    };

    const handleCaleFormSubmit = async (formValues) => {
        setCalFormData(formValues);
        const existingData = JSON?.parse(localStorage?.getItem('calformData')) || [];
        const existingEventIndex = existingData?.findIndex(event => event?.id === formValues?.id);
        let updatedData;
        if (existingEventIndex !== -1) {
            updatedData = existingData?.map((event, index) =>
                index === existingEventIndex ? formValues : event
            );
        } else {
            updatedData = [...existingData, formValues];
        }
        localStorage.setItem('calformData', JSON?.stringify(updatedData));
    };

    // for set events
    useEffect(() => {
        const storedData = localStorage.getItem('calformData');
        if (storedData) {
            setCalEvData(JSON?.parse(storedData));
        }
    }, [calFormData]);

    // for get events Data
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

    const filterEvents = (events, selectedCalendars) => {
        return events && events?.filter((event) => selectedCalendars?.includes(event?.category));
    };

    // filter fun according to events
    const filteredEvents = filterEvents(calEvData, selectedEventfilter);

    // calendar colors
    const calendarsColor = {
        Personal: 'error',
        Business: 'primary',
        Family: 'warning',
        Holiday: 'success',
        ETC: 'info',
    };

    // calendar options
    const calendarOptions = {
        events: filteredEvents,
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
        initialView: 'dayGridMonth',
        slotMinTime: "07:00:00", // Start from 9 AM
        slotMaxTime: "22:00:00", // End at 9 PM
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
            const colorClass = calendarsColor[category] || 'info';
            return [`bg-${colorClass}`];
        },
        // eventContent: function (arg) {
        //     const time = arg?.timeText ? `<div style="font-weight: bold;">${arg?.timeText}</div>` : "";
        //     const title = `<div>${arg.event.title}</div>`;
        //     return { html: `${time ? time + "&nbsp;" : ""}${title}` };
        // },
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
                location: clickedEvent?.extendedProps?.location,
                description: clickedEvent?.extendedProps?.description,
                guests: clickedEvent?.extendedProps?.guests,
                eventUrl: clickedEvent?.extendedProps?.eventUrl,
                category: clickedEvent?.extendedProps?.category,
                estimate: clickedEvent?.extendedProps?.estimate || 1,
                allDay: clickedEvent?.allDay,
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
            if (droppedEvent.extendedProps?.isMeeting) return;
            const startDate = droppedEvent?.start;
            const endDate = droppedEvent?.end ?? startDate;
            const updatedEvent = {
                id: droppedEvent.id,
                title: droppedEvent.title,
                start: startDate?.toISOString(),
                end: endDate?.toISOString(),
                location: droppedEvent.extendedProps.location,
                description: droppedEvent.extendedProps.description,
                category: droppedEvent.extendedProps.category,
                guests: droppedEvent.extendedProps.guests,
                eventUrl: droppedEvent.extendedProps.eventUrl,
                estimate: droppedEvent.extendedProps.estimate || 1,
                allDay: droppedEvent.allDay,
            };
            // Update the event in local storage
            const updatedEvents = filteredEvents?.map(event =>
                event.id === updatedEvent?.id ? updatedEvent : event
            );
            localStorage.setItem('calformData', JSON.stringify(updatedEvents));
        },
        eventReceive({ event: receivedEvent }) {
            const randomId = Math.random().toString(36).substring(2, 10);
            const estimate = receivedEvent?.extendedProps?.estimate || 1;

            const startDate = receivedEvent?.start ? new Date(receivedEvent.start) : new Date();
            const endDate = new Date(startDate.getTime() + estimate * 60 * 60 * 1000);

            const newEvent = {
                id: randomId,
                title: receivedEvent?.title || "Untitled Event",
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                location: receivedEvent?.extendedProps?.location || "",
                description: receivedEvent?.extendedProps?.description || "",
                category: receivedEvent?.extendedProps?.category || "",
                guests: receivedEvent?.extendedProps?.guests || [],
                eventUrl: receivedEvent?.extendedProps?.eventUrl || "",
                estimate: estimate,
                allDay: receivedEvent?.allDay ?? false,
            };

            const existingData = JSON?.parse(localStorage.getItem('calformData')) || [];
            const isDuplicate = existingData?.some(event =>
                event.title === newEvent.title && event.start === newEvent.start
            );

            if (!isDuplicate) {
                const updatedData = [...existingData, newEvent];
                localStorage.setItem('calformData', JSON?.stringify(updatedData));
                setCalEvData(updatedData);
            } else {
                console.log("Duplicate event detected, not adding.");
            }
        },
        eventResize({ event: resizedEvent, revert }) {
            if (resizedEvent.extendedProps?.isMeeting) return;

            const startDate = resizedEvent.start;
            const endDate = resizedEvent.end ?? startDate;
            let estimate = resizedEvent.extendedProps?.estimate || 1;
            const estimatedEndTime = new Date(startDate.getTime() + estimate * 60 * 60 * 1000);

            if (endDate > estimatedEndTime) {
                console.log("Resizing beyond the estimated time is not allowed.");
                revert();
                return;
            }

            // Update event data
            const updatedEvent = {
                id: resizedEvent.id,
                title: resizedEvent.title,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                estimate,
                location: resizedEvent.extendedProps?.location,
                description: resizedEvent.extendedProps?.description,
                category: resizedEvent.extendedProps?.category,
                guests: resizedEvent.extendedProps?.guests,
                eventUrl: resizedEvent.extendedProps?.eventUrl,
                allDay: resizedEvent.allDay,
            };

            // Update the event in local storage
            const updatedEvents = filteredEvents.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            );
            localStorage.setItem("calformData", JSON.stringify(updatedEvents));
        }
    };

    // remove event
    const handleRemove = (formValue) => {
        setFormData(formValue)

        setCnfDialogOpen(true);
    };

    // cnf remove event
    const handleConfirmRemoveAll = () => {
        const updatedData = filteredEvents?.filter(event => event?.id !== formData?.id);
        setCalFormData(updatedData)
        localStorage.setItem('calformData', JSON?.stringify(updatedData));
        setCnfDialogOpen(false);
        setCaledrawerOpen(false);
    };

    // close remove dialog
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

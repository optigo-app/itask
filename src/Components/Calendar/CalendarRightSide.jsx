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
        const existingData = JSON.parse(localStorage.getItem('calformData')) || [];
        const existingEventIndex = existingData.findIndex(event => event.id === formValues.id);
        let updatedData;
        if (existingEventIndex !== -1) {
            updatedData = existingData.map((event, index) =>
                index === existingEventIndex ? formValues : event
            );
        } else {
            updatedData = [...existingData, formValues];
        }
        localStorage.setItem('calformData', JSON.stringify(updatedData));
    };

    // for set events
    useEffect(() => {
        const storedData = localStorage.getItem('calformData');
        if (storedData) {
            setCalEvData(JSON.parse(storedData));
        }
    }, [calFormData]);

    // for get events Data
    useEffect(() => {
        if (calendarRef?.current) {
            setCalendarApi(calendarRef?.current?.getApi());
        }
    }, []);

    useEffect(() => {
        if (calendarApi && date) {
            const validDate = new Date(date);
            if (!isNaN(validDate.getTime())) {
                calendarApi.gotoDate(validDate);
            } else {
                console.error('Invalid date:', date);
            }
        }
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
                allDay: droppedEvent.allDay,
            };
            // Update the event in local storage
            const updatedEvents = filteredEvents?.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            );
            localStorage.setItem('calformData', JSON.stringify(updatedEvents));
        },
        eventResize({ event: resizedEvent }) {
            const startDate = resizedEvent?.start;
            const endDate = resizedEvent?.end ?? startDate;
            const updatedEvent = {
                id: resizedEvent.id,
                title: resizedEvent.title,
                start: startDate?.toISOString(),
                end: endDate?.toISOString(),
                location: resizedEvent.extendedProps.location,
                description: resizedEvent.extendedProps.description,
                category: resizedEvent.extendedProps.category,
                guests: resizedEvent.extendedProps.guests,
                eventUrl: resizedEvent.extendedProps.eventUrl,
                allDay: resizedEvent.allDay,
            };
            // Update the event in local storage
            const updatedEvents = filteredEvents?.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            );
            localStorage.setItem('calformData', JSON.stringify(updatedEvents));
        },
        ref: calendarRef,
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
        localStorage.setItem('calformData', JSON.stringify(updatedData));
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

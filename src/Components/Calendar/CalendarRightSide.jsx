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

const Calendar = () => {
    const [sidebarToggle, setSidebarToggle] = useRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const selectedEventfileter = useRecoilValue(CalEventsFilter)
    console.log('selectedEventfileter: ', selectedEventfileter);
    const [caledrawerOpen, setCaledrawerOpen] = useState(false);

    const events = [
        {
            "title": "Personal Event 1",
            "start": "2025-01-17",
            "end": "2025-01-17T23:59:59",
            "category": "Personal",
            "eventUrl": "https://example.com/event1",
            "guests": ["John Doe", "Jane Smith"],
            "location": "John's House",
            "description": "A fun family gathering to celebrate the holidays."
        },
        {
            "title": "Personal Event 2",
            "start": "2025-01-18T10:00:00",
            "end": "2025-01-18T12:00:00",
            "category": "Personal",
            "eventUrl": "https://example.com/event2",
            "guests": ["Alice Brown", "Charlie Davis"],
            "location": "Alice's House",
            "description": "A birthday party for Alice."
        },
        {
            "title": "Personal Event 3",
            "start": "2025-01-19T15:00:00",
            "end": "2025-01-19T17:00:00",
            "category": "Personal",
            "eventUrl": "https://example.com/event3",
            "guests": ["Eve Harris", "Tom Jackson"],
            "location": "Eve's House",
            "description": "A casual dinner to catch up."
        },
        {
            "title": "Personal Event 4",
            "start": "2025-01-20T20:00:00",
            "end": "2025-01-20T22:00:00",
            "category": "Personal",
            "eventUrl": "https://example.com/event4",
            "guests": ["Luke Martin", "Olivia White"],
            "location": "Olivia's House",
            "description": "A movie night with friends."
        },
        {
            "title": "Business Event 1",
            "start": "2025-01-17",
            "end": "2025-01-17T23:59:59",
            "category": "Business",
            "eventUrl": "https://example.com/business-event1",
            "guests": ["Sam Green", "David Lee"],
            "location": "Office",
            "description": "Year-end business review meeting."
        },
        {
            "title": "Business Event 2",
            "start": "2025-01-18T10:00:00",
            "end": "2025-01-18T12:00:00",
            "category": "Business",
            "eventUrl": "https://example.com/business-event2",
            "guests": ["Emma Taylor", "William Hall"],
            "location": "Conference Room A",
            "description": "Team strategy meeting."
        },
        {
            "title": "Business Event 3",
            "start": "2025-01-19T15:00:00",
            "end": "2025-01-19T17:00:00",
            "category": "Business",
            "eventUrl": "https://example.com/business-event3",
            "guests": ["Sophia Clark", "Michael Lewis"],
            "location": "Office",
            "description": "Client presentation."
        },
        {
            "title": "Business Event 4",
            "start": "2025-01-20T20:00:00",
            "end": "2025-01-20T22:00:00",
            "category": "Business",
            "eventUrl": "https://example.com/business-event4",
            "guests": ["Daniel Scott", "Emily King"],
            "location": "Board Room",
            "description": "Board meeting."
        },
        {
            "title": "Family Event 1",
            "start": "2025-01-18T10:00:00",
            "end": "2025-01-17T23:59:59",
            "category": "Family",
            "eventUrl": "https://example.com/family-event1",
            "guests": ["Lucas Adams", "Ava Carter"],
            "location": "Family Home",
            "description": "Holiday dinner with family."
        },
        {
            "title": "Family Event 2",
            "start": "2025-01-18T10:00:00",
            "end": "2025-01-18T12:00:00",
            "category": "Family",
            "eventUrl": "https://example.com/family-event2",
            "guests": ["Grace Martinez", "James Anderson"],
            "location": "Grandparents' House",
            "description": "Christmas gift exchange."
        },
        {
            "title": "Family Event 2",
            "start": "2025-01-05T10:00:00",
            "end": "2025-01-05T12:00:00",
            "category": "ETC",
            "eventUrl": "https://example.com/family-event2",
            "guests": ["Grace Martinez", "James Anderson"],
            "location": "Grandparents' House",
            "description": "Christmas gift exchange."
        },
        {
            "title": "Family Event 2",
            "start": "2025-01-07T10:00:00",
            "end": "2025-01-07T12:00:00",
            "category": "Holiday",
            "eventUrl": "https://example.com/family-event2",
            "guests": ["Grace Martinez", "James Anderson"],
            "location": "Grandparents' House",
            "description": "Christmas gift exchange."
        },
        {
            "title": "Family Event 2",
            "start": "2025-01-18T10:00:00",
            "end": "2025-01-18T12:00:00",
            "category": "Family",
            "eventUrl": "https://example.com/family-event2",
            "guests": ["Grace Martinez", "James Anderson"],
            "location": "Grandparents' House",
            "description": "Christmas gift exchange."
        },
    ];

    const handleDrawerToggle = () => {
        setCaledrawerOpen(!caledrawerOpen);
    };

    const handleCaleFormSubmit = async (formValues) => {
        console.log('formValues: ', formValues);
        setCalFormData(formValues)
        localStorage.setItem('calformData', JSON.stringify(formValues))
    };

    const eventss = JSON.parse(localStorage?.getItem('calformData')) ?? {}

    let data = [...events, eventss];

    const filterEvents = (events, selectedCalendars) => {
        return events.filter((event) => selectedCalendars.includes(event.category));
    };

    const filteredEvents = filterEvents(data, selectedEventfileter);
    console.log('filteredEvents: ', filteredEvents);
    console.log('data: ', data);

    const calendarsColor = {
        Personal: 'error',
        Business: 'primary',
        Family: 'warning',
        Holiday: 'success',
        ETC: 'info',
    };

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
                title: clickedEvent?.title,
                start: startDate?.toISOString(),
                end: endDate?.toISOString(),
                location: clickedEvent?.extendedProps?.location,
                description: clickedEvent?.extendedProps?.description,
                guests: clickedEvent?.extendedProps?.guests?.map(guest => guest.label)?.join(', '),
                eventUrl: clickedEvent?.extendedProps?.eventUrl,
                category: clickedEvent?.extendedProps?.category
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
            };

            // Update the event in local storage
            const updatedEvents = data?.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            );

            console.log('Event updated: ', updatedEvent);
            alert(`Event updated to: ${updatedEvent.start}`);
        },
        eventResize({ event: resizedEvent }) {
            alert(`Event resized to: ${resizedEvent.start.toString()} - ${resizedEvent.end.toString()}`);
        },
        ref: calendarRef,
    };

    return (
        <>
            <FullCalendar {...calendarOptions} />
            <CalendarForm
                open={caledrawerOpen}
                onClose={handleDrawerToggle}
                onSubmit={handleCaleFormSubmit}
            // isLoading={isLoading}
            // masterData={masterData}
            // priorityData={priorityData}
            // projectData={projectData}
            // statusData={statusData}
            />
        </>
    );
};

export default Calendar;

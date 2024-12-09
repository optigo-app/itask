import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState } from 'recoil';
import { calendarSideBarOpen } from '../../Recoil/atom';

const Calendar = () => {
    const [sidebarToggle, setSidebarToggle] = useRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);

    const events = [
        { "title": "Personal Event 1", "start": "2024-11-17", "category": "Personal" },
        { "title": "Personal Event 2", "start": "2024-11-18T10:00:00", "category": "Personal" },
        { "title": "Personal Event 3", "start": "2024-11-19T15:00:00", "category": "Personal" },
        { "title": "Personal Event 4", "start": "2024-11-20T20:00:00", "category": "Personal" },
        { "title": "Business Event 1", "start": "2024-11-17", "category": "Business" },
        { "title": "Business Event 2", "start": "2024-11-18T10:00:00", "category": "Business" },
        { "title": "Business Event 3", "start": "2024-11-19T15:00:00", "category": "Business" },
        { "title": "Business Event 4", "start": "2024-11-20T20:00:00", "category": "Business" },
        { "title": "Family Event 1", "start": "2024-11-17", "category": "Family" },
        { "title": "Family Event 2", "start": "2024-11-18T10:00:00", "category": "Family" },
        { "title": "Family Event 3", "start": "2024-11-19T15:00:00", "category": "Family" },
        { "title": "Family Event 4", "start": "2024-11-20T20:00:00", "category": "Family" },
        { "title": "Holiday Event 1", "start": "2024-11-17", "category": "Holiday" },
        { "title": "Holiday Event 2", "start": "2024-11-18T10:00:00", "category": "Holiday" },
        { "title": "Holiday Event 3", "start": "2024-11-19T15:00:00", "category": "Holiday" },
        { "title": "Holiday Event 4", "start": "2024-11-20T20:00:00", "category": "Holiday" },
        { "title": "ETC Event 1", "start": "2024-11-17", "category": "ETC" },
        { "title": "ETC Event 2", "start": "2024-11-18T10:00:00", "category": "ETC" },
        { "title": "ETC Event 3", "start": "2024-11-19T15:00:00", "category": "ETC" },
        { "title": "ETC Event 4", "start": "2024-11-20T20:00:00", "category": "ETC" },
        { "title": "Dart Game?", "start": "2024-11-17", "category": "Personal" },
        { "title": "Dinner", "start": "2024-11-17T19:00:00", "category": "Family" },
        { "title": "Dinner", "start": "2024-11-17T19:00:00", "category": "Family" },
        { "title": "Dinner", "start": "2024-11-17T19:00:00", "category": "Family" },
        { "title": "Dinner", "start": "2024-11-17T19:00:00", "category": "Family" },
        { "title": "Doctor's Appointment", "start": "2024-11-19", "category": "Personal" },
        { "title": "Family Trip", "start": "2024-11-21", "end": "2024-11-22", "category": "Family" },
        { "title": "Family Trip", "start": "2024-11-22", "end": "2024-11-22", "category": "Holiday" },
        { "title": "Monthly Meeting", "start": "2024-11-01", "category": "Business" }
    ];

    const calendarsColor = {
        Personal: 'error',
        Business: 'primary',
        Family: 'warning',
        Holiday: 'success',
        ETC: 'info',
    };

    useEffect(() => {
        if (calendarApi === null) {
            setCalendarApi(calendarRef.current?.getApi());
        }
    }, [calendarApi]);

    const calendarOptions = {
        events: events,
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
            alert(`You clicked on event: ${clickedEvent.title}`);
        },
        customButtons: {
            sidebarToggle: {
                icon: 'bi bi-list',
                click() {
                    // alert('Sidebar toggle clicked');
                    setSidebarToggle(true);
                },
            },
        },
        dateClick(info) {
            alert(`New event selected on: ${info.dateStr}`);
        },
        eventDrop({ event: droppedEvent }) {
            alert(`Event dropped to: ${droppedEvent.start.toString()}`);
        },
        eventResize({ event: resizedEvent }) {
            alert(`Event resized to: ${resizedEvent.start.toString()} - ${resizedEvent.end.toString()}`);
        },
        ref: calendarRef,
    };

    return <FullCalendar {...calendarOptions} />;
};

export default Calendar;

import React, { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import {
    Menu,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';
import { createRoot } from 'react-dom/client';

const DepartmentAssigneeAutocomplete = () => (
    <TextField
        placeholder="Select Department/Assignee"
        size="small"
        variant="outlined"
        sx={{ minWidth: 200 }}
    />
);

const CalendarWithMuiMenu = () => {
    const inputRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [events, setEvents] = useState([
        { id: uuidv4(), title: "Demo Event A", start: new Date("2025-06-03") },
        { id: uuidv4(), title: "Demo Event B", start: new Date("2025-06-05") },
        { id: uuidv4(), title: "Demo Event C", start: new Date("2025-06-10") }
    ]);

    const customToolbarRef = useRef(null);
    const calendarRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => {
          const el = document.querySelector(".fc-departmentSelector-button");
          if (el && el.parentNode) {
            const wrapper = document.createElement("div");
            wrapper.style.display = "inline-block";
            el.parentNode.replaceChild(wrapper, el);
            const root = createRoot(wrapper);
            root.render(<DepartmentAssigneeAutocomplete />);
            clearInterval(interval);
          }
        }, 100);
      
        return () => clearInterval(interval);
      }, []);
      

    const handleDayRightClick = (dateStr, event) => {
        event.preventDefault();
        setSelectedDate(dateStr);
        setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleSplit = () => {
        const days = parseInt(inputRef.current?.value);
        if (!days || days < 1) return alert("Enter valid number of days");
        if (!selectedDate) return alert("No selected date");

        const baseDate = new Date(selectedDate);
        baseDate.setHours(0, 0, 0, 0);

        const originalEvent = events.find(event => {
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === baseDate.getTime();
        });

        if (!originalEvent) return alert("Original event not found");

        const newEvents = [];

        for (let i = 0; i < days; i++) {
            const currentDate = new Date(baseDate);
            currentDate.setDate(baseDate.getDate() + i);

            newEvents.push({
                id: uuidv4(),
                title: `${originalEvent.title} (Split)`,
                start: currentDate.toISOString(),
                createdAt: new Date().toISOString(),
                color: "#1976d2",
            });
        }

        setEvents(prev => {
            const updatedEvents = prev.filter(event => {
                const eventDate = new Date(event.start);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() !== baseDate.getTime();
            });
            return [...updatedEvents, ...newEvents];
        });

        handleClose();
    };

    return (
        <div onClick={handleClose} style={{ padding: 20 }}>
            <div style={{ marginBottom: 10 }} ref={customToolbarRef}></div>

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                events={events}
                ref={calendarRef}
                headerToolbar={{
                    left: "prev,next today departmentSelector",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
                  }}
                views={{
                    listWeek: {
                        buttonText: 'list',
                    },
                }}
                dayCellDidMount={(info) => {
                    info.el.addEventListener("contextmenu", (e) => {
                        e.preventDefault();
                        const clickedDate = new Date(info.date);
                        clickedDate.setHours(0, 0, 0, 0);

                        const isEventOnDate = events.some(event => {
                            const eventStart = new Date(event.start);
                            eventStart.setHours(0, 0, 0, 0);
                            return clickedDate.getTime() === eventStart.getTime();
                        });

                        if (isEventOnDate) {
                            handleDayRightClick(info.date, e);
                        }
                    });
                }}
            />

            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: "8px !important",
                            padding: '10px',
                            boxShadow:
                                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                        },
                    },
                }}
            >
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Enter days"
                    inputRef={inputRef}
                    inputProps={{ inputMode: "decimal", pattern: "^\\d*$" }}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: 'end', gap: '10px' }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSplit}>Split</Button>
                </Box>
            </Menu>
        </div>
    );
};

export default CalendarWithMuiMenu;

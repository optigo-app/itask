import React, { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
    Menu,
    MenuItem,
    TextField,
    Button,
    ButtonGroup,
    Popover,
    Box,
} from "@mui/material";
import { v4 as uuidv4 } from 'uuid';

const CalendarWithMuiMenu = () => {
    const inputRef = useRef(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    console.log('selectedDate: ', selectedDate);
    const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
    const [events, setEvents] = useState([
        {
            id: uuidv4(),
            title: "Demo Event A",
            start: new Date("2025-06-03T00:00:00"),
        },
        {
            id: uuidv4(),
            title: "Demo Event B",
            start: new Date("2025-06-05T00:00:00"),
        },
        {
            id: uuidv4(),
            title: "Demo Event C",
            start: new Date("2025-06-10T00:00:00"),
        }
    ]);

    console.log('events: ', events);

    const handleDayRightClick = (dateStr, event) => {
        event.preventDefault();
        setSelectedDate(dateStr);
        setContextMenu({ mouseX: event.clientX - 2, mouseY: event.clientY - 4 });
    };

    const handleClose = () => {
        setContextMenu(null);
        setDropdownAnchorEl(null);
    };

    const handleSplit = async (type) => {
        debugger
        const days = parseInt(inputRef.current?.value);
        if (!days || days < 1) return alert("Enter valid number of days");
        if (!selectedDate) return alert("No selected date");

        const baseDate = new Date(selectedDate);
        baseDate.setHours(0, 0, 0, 0);

        // Find the original event on selectedDate
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
                title: `${originalEvent.title}`,
                start: currentDate.toISOString(),
                type,
                createdAt: new Date().toISOString(),
            });
        }

        // Remove the original event and add the new split ones
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
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                dayCellDidMount={(info) => {
                    debugger
                    info.el.addEventListener("contextmenu", (e) => {
                        e.preventDefault();

                        const clickedDate = new Date(info.date);
                        clickedDate.setHours(0, 0, 0, 0);

                        const isEventOnDate = events.some(event => {
                            const eventStart = new Date(event.start);
                            const eventEnd = event.end ? new Date(event.end) : eventStart;
                            eventStart.setHours(0, 0, 0, 0);
                            eventEnd.setHours(0, 0, 0, 0);

                            return clickedDate >= eventStart && clickedDate <= eventEnd;
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
                    className="textfieldsClass"
                    inputProps={{
                        inputMode: "decimal",
                        pattern: "^\\d*\\.?\\d{0,2}$"
                    }}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: 'end', gap: '10px' }}>
                    <Button className="secondaryBtnClassname">Cancel</Button>
                    <Button className="buttonClassname" onClick={() => handleSplit("Split")}>
                        Split
                    </Button>

                </Box>

            </Menu>
        </div>
    );
};

export default CalendarWithMuiMenu;

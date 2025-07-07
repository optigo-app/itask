import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
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
import MeetingDetail from '../Meeting/MeetingDetails';
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Menu, TextField } from '@mui/material';
import { AddMeetingApi } from '../../Api/MeetingApi/AddMeetingApi';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import { PERMISSIONS } from '../Auth/Role/permissions';
import { toast } from 'react-toastify';

const Calendar = ({ isLoding, assigneeData, selectedAssignee, hasAccess, calendarsColor, handleCaleFormSubmit, handleRemoveAMeeting, handleAssigneeChange }) => {
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
    const [meetingDetailModalOpen, setMeetingDetailModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const inputRef = useRef(null);

    const handleClose = () => {
        setContextMenu(null);
        setSelectedEvent(null);
    };

    const handleTaskModalClose = () => {
        setMeetingDetailModalOpen(false);
    };

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

    const handleSplit = async (type) => {
        const days = parseInt(inputRef.current?.value);
        if (!days || days < 1) return alert("Enter valid number of days");
        if (!selectedEvent) return alert("No selected date");
        const originalEvent = calEvData?.find(ev => ev.meetingid == selectedEvent.id);
        if (!originalEvent) return alert("Original event not found");
        const originalStart = new Date(originalEvent.StartDate);
        const originalEnd = new Date(originalEvent.EndDate);
        const totalDurationMs = originalEnd.getTime() - originalStart.getTime();
        const dailyDurationMs = Math.floor(totalDurationMs / days);
        const startHour = originalStart.getHours();
        const startMin = originalStart.getMinutes();
        const startSec = originalStart.getSeconds();
        const newEvents = [];
        for (let i = 0; i < days; i++) {
            const baseDate = new Date(originalStart);
            baseDate.setDate(originalStart.getDate() + i);
            baseDate.setHours(startHour, startMin, startSec, 0);
            const splitStart = new Date(baseDate);
            const splitEnd = new Date(splitStart.getTime() + dailyDurationMs);
            const idString = (originalEvent?.guests ?? []).map(user => user.id)?.join(",");
            const splitEvent = {
                meetingid: uuidv4(),
                meetingtitle: originalEvent.meetingtitle,
                category: originalEvent?.category,
                ProjectName: originalEvent?.ProjectName,
                projectid: originalEvent?.projectid,
                taskname: originalEvent?.taskname,
                taskid: originalEvent?.taskid,
                prModule: originalEvent?.prModule,
                StartDate: splitStart.toISOString(),
                EndDate: splitEnd.toISOString(),
                guests: originalEvent?.guests,
                Desc: originalEvent.Desc,
                isAllDay: originalEvent.isAllDay ? 1 : 0,
                assigneids: idString ?? "",
                type,
                entrydate: new Date().toISOString(),
            };
            const apiRes = await AddMeetingApi(splitEvent);
            if (apiRes?.rd?.[0]?.stat === 1) {
                newEvents.push(splitEvent);
            } else {
                toast.error(`Split failed at part ${i + 1}`);
                return;
            }
        }
        let formData = originalEvent
        handleRemoveAMeeting(formData);
        toast.success("Meeting split successfully");

        setCalEvData(prev => [
            ...prev.filter(ev => ev.meetingid !== selectedEvent.id),
            ...newEvents
        ]);

        handleClose();
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

    const calendarOptions = {
        events: filteredEvents?.map(event => {
            return {
                id: event?.meetingid?.toString(),
                title: event.meetingtitle || '',
                start: event.StartDate,
                end: event.EndDate,
                allDay: event.isAllDay ? 1 : 0,
                description: event.Desc,
                category: event?.category || 'primary',
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
        initialView: 'timeGridWeek',
        slotMinTime: "07:00:00",  // Start from 7 AM
        slotMaxTime: "22:00:00",
        slotDuration: "00:15:00",
        slotLabelInterval: "00:30:00",
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
        eventDidMount: function (info) {
            info.el.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                setSelectedEvent(info.event);
                setContextMenu({
                    mouseX: e.clientX - 2,
                    mouseY: e.clientY - 4,
                });
            });
        },
        eventClassNames({ event }) {
            const category = event.extendedProps.category || 'ETC';
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
                start: new Date(info.dateStr).toISOString(),
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
            if (receivedEvent?.title == "") return;
            const estimate = receivedEvent?.extendedProps?.estimate || 1;
            const startDate = receivedEvent?.start ? new Date(receivedEvent.start) : new Date();
            const endDate = new Date(startDate.getTime() + estimate * 60 * 60 * 1000);

            const newEvent = {
                id: receivedEvent?.id,
                title: receivedEvent?.title || "",
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                taskid: receivedEvent?.extendedProps?.taskid || 0,
                projectid: receivedEvent?.extendedProps?.projectid || 0,
                prModule: receivedEvent?.extendedProps?.prModule || {},
                guests: receivedEvent?.extendedProps?.guests || [],
                assigneids: receivedEvent?.extendedProps?.guests?.map(user => user.id)?.join(","),
                description: receivedEvent?.extendedProps?.description || "",
                category: receivedEvent?.extendedProps?.category || "",
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
        },
    };

    const handleRemove = (formValue) => {
        setFormData(formValue)
        setCnfDialogOpen(true);
    };

    const handleConfirmRemoveAll = () => {
        const updatedData = filteredEvents?.filter(event => event?.id !== formData?.id);
        setCalEvData(updatedData);
        handleRemoveAMeeting(formData);
        setCnfDialogOpen(false);
        setCaledrawerOpen(false);
    };

    const handleCloseDialog = () => {
        setCnfDialogOpen(false);
    };

    const handleMeetingDt = (meeting) => {
        setFormData(meeting);
        handleDrawerToggle();
        setMeetingDetailModalOpen(true);
    }

    const handleMeetingEdit = (meeting) => {
        setFormData(meeting);
        handleTaskModalClose();
        setCaledrawerOpen(true);
    }

    return (
        <>
            <FullCalendar {...calendarOptions} />
            <CalendarForm
                open={caledrawerOpen}
                onClose={handleDrawerToggle}
                onSubmit={handleCaleFormSubmit}
                onRemove={handleRemove}
                handleMeetingDt={handleMeetingDt}
            />
            <ConfirmationDialog
                open={opencnfDialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmRemoveAll}
                title="Confirm"
                content="Are you sure you want to remove this Event?"
            />
            < MeetingDetail
                open={meetingDetailModalOpen}
                onClose={handleTaskModalClose}
                taskData={formData}
                handleMeetingEdit={handleMeetingEdit}
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
                    onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                            e.preventDefault();
                            e.stopPropagation();
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSplit("Split");
                        }
                    }}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: "flex", justifyContent: 'end', gap: '10px' }}>
                    <Button className="secondaryBtnClassname" onClick={handleClose}>Cancel</Button>
                    <Button className="buttonClassname" onClick={() => handleSplit("Split")}>
                        Split
                    </Button>
                </Box>
            </Menu>

        </>
    );
};

export default Calendar;

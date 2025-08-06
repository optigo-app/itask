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
import { v4 as uuidv4 } from 'uuid';
import { Box, Button, Menu, TextField } from '@mui/material';
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
    handleRemoveAMeeting,
    handleAssigneeChange,
    setFormDrawerOpen,
    setFormDataValue,
}) => {
    const isFullSidebar = useRecoilValue(FullSidebar);
    const setSidebarToggle = useSetRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const selectedEventfilter = useRecoilValue(CalEventsFilter)
    const [calEvData, setCalEvData] = useRecoilState(calendarData);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const inputRef = useRef(null);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);

    const handleClose = () => {
        setContextMenu(null);
        setSelectedEvent(null);
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
            projectid: event?.extendedProps?.projectid ?? event?.projectid,
            prModule: event?.extendedProps?.prModule ?? {
                taskid: event?.taskid,
                projectid: event?.projectid,
                taskname: event?.taskname,
                projectname: event?.ProjectName,
                taskPr: event?.ProjectName
            },
            guests: event?.extendedProps?.guests ?? event?.guests ?? [],
            assigneids: event?.extendedProps?.guests?.map(u => u.id)?.join(',') ?? '',
            estimate: event?.extendedProps?.estimate ?? 1,
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

        eventAllow(dropInfo, draggedEvent) {
            return !draggedEvent.extendedProps?.isMeeting;
        },

        eventDidMount(info) {
            info.el.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                setSelectedEvent(info.event);
                setContextMenu({
                    mouseX: e.clientX - 2,
                    mouseY: e.clientY - 4,
                });
            });
        },

        dateClick(info) {
            const eventDetails = {
                start: new Date(info.dateStr).toISOString(),
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
            const endDate = new Date(startDate.getTime() + eventDetails.estimate * 60 * 60 * 1000);

            eventDetails.end = endDate.toISOString();

            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? { ...ev, StartDate: eventDetails.start, EndDate: eventDetails.end }
                    : ev
            );

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails);
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
            }
        }, 500); // match sidebar transition duration (0.3s)

        return () => clearTimeout(timer);
    }, [isFullSidebar]);

    return (
        <>
            <FullCalendar ref={calendarRef} {...calendarOptions} />
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

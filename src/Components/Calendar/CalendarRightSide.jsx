import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarData, calendarM, calendarSideBarOpen, CalEventsFilter, CalformData, FullSidebar, rootSubrootflag, TaskData } from '../../Recoil/atom';
import { EstimateCalApi } from '../../Api/TaskApi/EstimateCalApi';
import { buildAncestorSumSplitestimate } from '../../Utils/estimationUtils';
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
    const actualTaskDataValue = useRecoilValue(TaskData);
    const [duplicateDialog, setDuplicateDialog] = useState({ open: false, event: null });

    const findModuleRecursively = (tasks, targetId) => {
        if (!tasks) return null;
        for (const t of tasks) {
            if (String(t.taskid) === String(targetId)) return t.moduleid || t.projectid;
            if (t.subtasks?.length > 0) {
                const res = findModuleRecursively(t.subtasks, targetId);
                if (res) return res;
            }
        }
        return null;
    };

    const SNAP_MINUTES = 15;

    const getSnappedEndAndHours = (start, end) => {
        const safeStart = start instanceof Date ? start : new Date(start);
        const safeEnd = end instanceof Date ? end : new Date(end ?? start);
        const diffMs = safeEnd.getTime() - safeStart.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        const snappedMinutes = Math.max(
            SNAP_MINUTES,
            Math.round(diffMinutes / SNAP_MINUTES) * SNAP_MINUTES
        );
        const snappedEnd = new Date(safeStart.getTime() + snappedMinutes * 60 * 1000);
        return {
            snappedEnd,
            snappedHours: snappedMinutes / 60,
        };
    };

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
            workinghr: (event?.extendedProps?.workinghr || event?.workinghr) ?? 0,
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
        scrollTime: '09:15:00',
        scrollTimeReset: false,
        slotMinTime: "07:00:00",
        slotMaxTime: "22:00:00",
        slotDuration: "00:15:00",
        slotLabelInterval: "00:15:00",
        slotLaneClassNames: (arg) => {
            const d = arg?.date;
            if (!d) return [];
            const isCompanyStart = d.getHours() === 9 && d.getMinutes() === 15;
            return isCompanyStart ? ['company-start-slot'] : [];
        },
        slotLabelClassNames: (arg) => {
            const d = arg?.date;
            if (!d) return [];
            const isCompanyStart = d.getHours() === 9 && d.getMinutes() === 15;
            return isCompanyStart ? ['company-start-slot'] : [];
        },
        headerToolbar: {
            start: 'sidebarToggle, prev, next, title',
            center: '',
            end: 'timeGridWeek,timeGridDay,dayGridMonth,listMonth'
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
        dayMaxEvents: 4, // Limit events per day in month view to prevent overflow
        moreLinkClick: 'popover', // Show popover when clicking "more" link
        navLinks: true,
        weekNumbers: true, // Enable week numbers (controlled by CSS per view)
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
            const currentView = arg.view.type;

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

            const formatForView = (date, viewType) => {
                if (viewType === 'dayGridMonth') {
                    // Month view: show only day name
                    return date.toLocaleDateString('en-US', { weekday: 'long' });
                } else {
                    // Week/Day view: show day name with date
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    return `${dayName} ${day}-${month}`;
                }
            };

            const formattedDate = formatForView(arg.date, currentView);
            const totalText = formatTotalHours(totalHours);

            // For month view, don't show hours in header
            if (currentView === 'dayGridMonth') {
                return {
                    html: `
                        <div class="calendar-day-header">
                            <div class="date-text">${formattedDate}</div>
                        </div>
                    `
                };
            }

            // For week/day view, show hours
            return {
                html: `
                    <div class="calendar-day-header">
                        <div class="date-text">${formattedDate}</div>
                        <div class="estimate-text">(${totalText})</div>
                    </div>
                `
            };
        },

        eventContent(arg) {
            const { event } = arg;
            const currentView = arg.view.type;
            const estimateHrs = event.extendedProps?.estimate_hrs || 0;

            const formatEstimate = (hours) => {
                if (hours === 0) return '';
                const unit = hours <= 1 ? 'hr' : 'hrs';
                return `(${hours} ${unit})`;
            };

            const estimateText = formatEstimate(estimateHrs);

            // For month view, use simpler layout
            if (currentView === 'dayGridMonth') {
                return {
                    html: `
                        <div class="fc-event-main-frame calendar-event-container month-event">
                            <div class="fc-event-content">
                                <span class="fc-event-title">${event.title || ''}</span>
                                ${estimateText ? `<span class="fc-event-estimate">${estimateText}</span>` : ''}
                            </div>
                            <style>
                                .month-event {
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    align-items: center;
                                    padding: 0;
                                }
                                .month-event .fc-event-content {
                                    width: 100%;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    overflow: hidden;
                                }
                                .month-event .fc-event-title {
                                    flex: 1;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                    font-size: inherit;
                                }
                                .month-event .fc-event-estimate {
                                    flex-shrink: 0;
                                    font-size: 0.65em;
                                    opacity: 0.8;
                                }
                            </style>
                        </div>
                    `
                };
            }

            // For week/day view, use full layout with duplicate button
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
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
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
            const start = event.start;
            const end = event.end ?? start;
            const { snappedEnd, snappedHours } = getSnappedEndAndHours(start, end);
            event.setEnd(snappedEnd);

            const eventDetails = {
                ...mapEventDetails(event),
                start: start.toISOString(),
                end: snappedEnd.toISOString(),
                estimate_hrs: snappedHours || 1,
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

            // Save the meeting/task update
            handleCaleFormSubmit(eventDetails, { skipRefresh: true });

        },

        eventResize({ event }) {
            if (event.extendedProps?.isMeeting) return;
            const start = event.start;
            const end = event.end ?? start;
            const { snappedEnd, snappedHours } = getSnappedEndAndHours(start, end);
            event.setEnd(snappedEnd);
            const eventDetails = {
                ...mapEventDetails(event),
                end: snappedEnd.toISOString(),
                estimate_hrs: snappedHours || 1,
            };
            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? {
                        ...ev,
                        StartDate: eventDetails.start,
                        EndDate: eventDetails.end,
                        estimate_hrs: eventDetails.estimate_hrs
                    }
                    : ev
            );

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails, { skipRefresh: true, context: { end: eventDetails.end } });

            // Update parent task estimates in background (async, non-blocking)
            const parentId = eventDetails?.parentid;
            if (parentId && String(parentId) !== '0') {
                const foundModuleId = findModuleRecursively(actualTaskDataValue, parentId);
                const rootId = foundModuleId || eventDetails.moduleid || eventDetails.projectid || parentId;

                // Import dynamically to avoid circular dependencies
                import('../../Api/TaskApi/TaskDataFullApi').then(({ fetchTaskDataFullApi }) => {
                    import('../../Utils/globalfun').then(({ mapKeyValuePair }) => {
                        // Fetch fresh task data using treelist API
                        fetchTaskDataFullApi({ taskid: rootId })
                            .then(taskData => {
                                if (!taskData || !taskData.rd1) {
                                    console.warn('No task data returned from treelist API');
                                    return;
                                }

                                const labeledTasks = mapKeyValuePair(taskData);
                                console.log('labeledTasks', labeledTasks);
                                console.log('📅 Calendar Resize - Fetched task hierarchy:', {
                                    taskid: eventDetails?.taskid,
                                    parentid: parentId,
                                    newEstimate: snappedHours,
                                    fetchedTasks: labeledTasks?.length
                                });

                                // Calculate parent estimates using fresh data
                                const parentSumSplitestimate = buildAncestorSumSplitestimate(labeledTasks, {
                                    parentTaskId: parentId,
                                    childTaskId: eventDetails?.taskid,
                                    childValues: {
                                        estimate_hrs: eventDetails.estimate_hrs,
                                        estimate1_hrs: eventDetails.estimate1_hrs || 0,
                                        estimate2_hrs: eventDetails.estimate2_hrs || 0,
                                        workinghr: eventDetails.workinghr || 0,
                                    },
                                    isNewChild: false,
                                });

                                if (parentSumSplitestimate) {
                                    console.log('📊 Parent Sum Splitestimate:', parentSumSplitestimate);
                                    EstimateCalApi(parentSumSplitestimate)
                                        .catch((err) => console.error('Error updating parent estimate:', err));
                                }
                            })
                            .catch((err) => {
                                console.error('Error fetching task data for parent estimation:', err);
                            });
                    });
                });
            }
        },
        eventReceive({ event }) {
            if (!event?.title) return;
            const eventDetails = mapEventDetails(event);
            const startDate = new Date(eventDetails.start);
            const estimateHours = eventDetails.estimate_hrs || eventDetails.estimate || 1;
            const estimatedEnd = new Date(startDate.getTime() + estimateHours * 60 * 60 * 1000);
            const { snappedEnd, snappedHours } = getSnappedEndAndHours(startDate, estimatedEnd);
            event.setEnd(snappedEnd);
            eventDetails.end = snappedEnd.toISOString();
            eventDetails.estimate_hrs = snappedHours;
            const updatedData = calEvData?.map(ev =>
                ev?.meetingid == eventDetails?.meetingid
                    ? {
                        ...ev,
                        StartDate: eventDetails.start,
                        EndDate: eventDetails.end,
                        estimate_hrs: eventDetails.estimate_hrs
                    }
                    : ev
            );

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);

            // Save the meeting/task update
            handleCaleFormSubmit(eventDetails, { skipRefresh: true });

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
            statusid: "",
            workinghr: 0,
            duplicated: true,
        };

        const apiRes = await handleCaleFormSubmit(duplicatedEvent);
        if (apiRes && apiRes?.rd[0]?.stat == 1) {
            setDuplicateDialog({ open: false, event: null });
            toast.success("Event repeated successfully");

            // Call estimateTaskSave for new task
            const newTaskId = apiRes.rd[0].taskid;
            const parentId = duplicatedEvent?.parentid;
            if (parentId && String(parentId) !== '0') {
                const foundModuleId = findModuleRecursively(actualTaskDataValue, parentId);
                const rootId = foundModuleId || duplicatedEvent.moduleid || duplicatedEvent.projectid || parentId;

                import('../../Api/TaskApi/TaskDataFullApi').then(({ fetchTaskDataFullApi }) => {
                    import('../../Utils/globalfun').then(({ mapKeyValuePair }) => {
                        fetchTaskDataFullApi({ taskid: rootId })
                            .then(taskData => {
                                if (!taskData || !taskData.rd1) {
                                    console.warn('No task data returned from treelist API');
                                    return;
                                }

                                const labeledTasks = mapKeyValuePair(taskData);
                                const parentSumSplitestimate = buildAncestorSumSplitestimate(labeledTasks, {
                                    parentTaskId: parentId,
                                    childTaskId: newTaskId,
                                    childValues: {
                                        estimate_hrs: duplicatedEvent.estimate_hrs,
                                        estimate1_hrs: duplicatedEvent.estimate1_hrs || 0,
                                        estimate2_hrs: duplicatedEvent.estimate2_hrs || 0,
                                        workinghr: duplicatedEvent.workinghr || 0,
                                    },
                                    isNewChild: true,
                                });

                                if (parentSumSplitestimate) {
                                    EstimateCalApi(parentSumSplitestimate)
                                        .catch((err) => console.error('Error updating parent estimate:', err));
                                }
                            })
                            .catch((err) => {
                                console.error('Error fetching task data for parent estimation:', err);
                            });
                    });
                });
            }
        } else {
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

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
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import { PERMISSIONS } from '../Auth/Role/permissions';
import { toast } from 'react-toastify';
import { getDynamicStatusColor, statusColors, getUserProfileData, formatUTCDateTime, toAttendanceDateKey, mergeDateWithTime } from '../../Utils/globalfun';
import DailyReportAttendance from '../Reports/CalendarReport/DailyReportAttendance';
import { GetDailyReportApi } from '../../Api/TaskApi/GetDailyReportApi';
import DailyReportAttendanceList from '../Reports/CalendarReport/DailyReportAttendanceList';

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
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const actualTaskDataValue = useRecoilValue(TaskData);
    const [attendanceByDate, setAttendanceByDate] = useState({});
    const [assigneesByDate, setAssigneesByDate] = useState({});
    const [dailyReportRows, setDailyReportRows] = useState([]);
    const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    const [attendanceDialogRows, setAttendanceDialogRows] = useState([]);
    const [activeAssignee, setActiveAssignee] = useState(null);
    const [duplicateDialog, setDuplicateDialog] = useState({ open: false, event: null });

    const toDateKey = (date, useUTC = true) => {
        const d = date instanceof Date ? date : new Date(date);
        if (Number.isNaN(d.getTime())) return '';
        if (useUTC) {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        } else {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    };

    const sortAssigneesLoggedInFirst = (list) => {
        const loggedInId = getUserProfileData()?.id;
        const arr = Array.isArray(list) ? list : [];
        const seen = new Set();
        const uniq = [];
        for (const a of arr) {
            const id = a?.id;
            const key = id == null ? '' : String(id);
            if (!key || seen.has(key)) continue;
            seen.add(key);
            uniq.push(a);
        }
        if (!loggedInId) return uniq;
        const meIdx = uniq.findIndex((x) => String(x?.id) === String(loggedInId));
        if (meIdx <= 0) return uniq;
        const me = uniq[meIdx];
        return [me, ...uniq.slice(0, meIdx), ...uniq.slice(meIdx + 1)];
    };

    const hydrateAttendanceFromApi = async () => {
        try {
            const userProfile = getUserProfileData();
            const loggedInId = userProfile?.id;
            if (!loggedInId) return;

            const res = await GetDailyReportApi();
            const rows = res?.rd || [];
            const assigneeMaster = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
            const masterById = new Map(assigneeMaster.map((e) => [String(e?.id), e]));

            const byDateAssignees = new Map();
            rows.filter((r) => String(r?.GivenByEmpID) === String(loggedInId))
                .forEach((r) => {
                    const dk = toAttendanceDateKey(new Date(r?.entrydate));
                    const idStr = String(r?.TakenByEmpID);
                    const emp = masterById.get(idStr);
                    if (dk && emp) {
                        const list = byDateAssignees.get(dk) || [];
                        if (!list.some((x) => String(x?.id) === idStr)) list.push(emp);
                        byDateAssignees.set(dk, list);
                    }
                });

            const nextAssigneesByDate = {};
            byDateAssignees.forEach((list, dk) => {
                nextAssigneesByDate[dk] = sortAssigneesLoggedInFirst(list);
            });
            setAssigneesByDate(nextAssigneesByDate);

            const nextDailyReportRows = rows.filter((r) => String(r?.GivenByEmpID) === String(loggedInId))
                .map((r) => ({
                    ...r,
                    entrydate: formatUTCDateTime(r?.entrydate),
                    __dateKey: toAttendanceDateKey(new Date(r?.entrydate)),
                    __employee: masterById.get(String(r?.TakenByEmpID)) || null,
                }));
            setDailyReportRows(nextDailyReportRows);

            const nextAttendance = {};
            rows.filter(r => String(r.GivenByEmpID) === String(loggedInId)).forEach(r => {
                const dk = toAttendanceDateKey(new Date(r.entrydate));
                if (dk) {
                    nextAttendance[dk] = {
                        checked: r.isdone === 1 || String(r.isdone) === '1',
                        remark: r.remarks || ''
                    };
                }
            });
            setAttendanceByDate(nextAttendance);
        } catch (e) {
            console.error('Error fetching daily reports:', e);
        }
    };

    useEffect(() => {
        hydrateAttendanceFromApi();
    }, []);
    const processingEventRef = useRef(new Set());
    const [holidayDates, setHolidayDates] = useState([]);
    const [holidayData, setHolidayData] = useState([]);

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

    // Load holiday dates from session storage
    useEffect(() => {
        try {
            const holidayDataRaw = JSON.parse(sessionStorage.getItem('taskholidayData') || '[]');

            const holidays = holidayDataRaw
                .filter(holiday => holiday.isdelete !== 1 && holiday.holidaydate)
                .map(holiday => ({
                    date: holiday.holidaydate.split('T')[0],
                    labelname: holiday.labelname || 'Holiday'
                }));

            const dates = holidays.map(h => h.date);
            setHolidayDates(dates);
            setHolidayData(holidays);

        } catch (error) {
            console.error('Error loading holiday dates:', error);
            setHolidayDates([]);
            setHolidayData([]);
        }
    }, []);

    // Helper function to check if a date is a holiday
    const isHolidayDate = (date) => {
        const d = new Date(date);
        const dateStr =
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0");
        return holidayDates.includes(dateStr);
    };

    // Helper function to get holiday labelname for a date
    const getHolidayLabel = (date) => {
        const d = new Date(date);
        const dateStr =
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0");
        const holiday = holidayData.find(h => h.date === dateStr);
        return holiday?.labelname || '';
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
        return events?.filter(event => {
            // Filter by category
            const categoryMatch = !event?.category || selectedCalendars?.includes(event.category);

            // Filter by favorites if showFavoritesOnly is true
            const favoriteMatch = showFavoritesOnly ? Number(event?.isfavourite) === 1 : true;

            return categoryMatch && favoriteMatch;
        }) || [];
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
    }, []); // Remove showFavoritesOnly dependency

    const formatEstimate = (val) => {
        const num = Number(val ?? 0);
        return num % 1 === 0 ? num : Number(num.toFixed(2));
    };

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
        dayCellContent(arg) {
            const holidayLabel = getHolidayLabel(arg.date);
            if (holidayLabel) {
                return {
                    html: `
                        <div style="position:relative;width:100%;height:100%;">
                            <div class="fc-daygrid-day-top">
                                <span class="fc-daygrid-day-number">${arg.dayNumberText}</span>
                            </div>
                            <div class="holiday-label-overlay" style="position:absolute;top:18px;left:2px;right:2px;z-index:1;max-width:100%;box-sizing:border-box;">
                            </div>
                        </div>
                    `
                };
            }
            return arg.dayNumberText;
        },
        dayCellClassNames: (arg) => {
            return isHolidayDate(arg.date) ? ['holiday-date'] : [];
        },
        slotLaneClassNames: (arg) => {
            const d = arg?.date;
            if (!d) return [];
            const isCompanyStart = d.getHours() === 9 && d.getMinutes() === 15;
            const classes = isCompanyStart ? ['company-start-slot'] : [];
            if (isHolidayDate(d)) {
                classes.push('holiday-slot');
            }
            return classes;
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
            end: 'favoritesToggle | timeGridWeek,timeGridDay,dayGridMonth,listMonth'
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
        navLinks: false, // Changed from true to false to prevent header clicks from triggering view changes
        weekNumbers: true, // Enable week numbers (controlled by CSS per view)
        customButtons: {
            sidebarToggle: {
                icon: 'bi bi-list',
                click() {
                    setSidebarToggle(prev => !prev);
                }
            },
            favoritesToggle: {
                icon: showFavoritesOnly ? 'fc-icon-star-filled' : 'fc-icon-star-outline',
                hint: showFavoritesOnly ? 'Show all events' : 'Show favorite events only',
                className: 'fc-favoritesToggle-button',
                click() {
                    setShowFavoritesOnly(prev => !prev);
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
            const dateKey = toAttendanceDateKey(arg.date, false);

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
                    return date.toLocaleDateString('en-US', { weekday: 'long' });
                } else {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    return `${dayName} ${day}-${month}`;
                }
            };

            const formattedDate = formatForView(arg.date, currentView);
            const totalText = formatTotalHours(totalHours);
            const holidayLabel = getHolidayLabel(arg.date);
            const isHoliday = isHolidayDate(arg.date);

            if (currentView === 'dayGridMonth') {
                return {
                    html: `
                            <div class="calendar-day-header">
                                <div class="date-text">${formattedDate}</div>
                            </div>
                        `
                };
            }

            const attendance = attendanceByDate[dateKey] || {};
            const checked = !!attendance.checked;
            const isToday = dateKey === toDateKey(new Date());
            const assignees = sortAssigneesLoggedInFirst(assigneesByDate[dateKey] || []);

            return (
                <div className="calendar-day-header">
                    <div className="date-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span>{formattedDate}</span>
                        {holidayLabel && (
                            <span className="holiday-label-chip" style={{
                                fontSize: '12px',
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                display: 'inline-block',
                                border: '1px solid #fecaca',
                                whiteSpace: 'nowrap',
                            }}>
                                {holidayLabel}
                            </span>
                        )}
                    </div>
                    {!isHoliday && (
                        <div className="calendar-day-header-right-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="estimate-text">({totalText})</div>
                            <DailyReportAttendance
                                checked={checked}
                                isToday={isToday}
                                showCheckbox={true}
                                disabled={true}
                                assignees={assignees}
                                iconSize={20}
                                avatarSize={28}
                                buttonSize={28}
                                onAvatarClick={(all, clickedId) => {
                                    const dateRows = dailyReportRows.filter(r => r.__dateKey === dateKey);
                                    const picked = (all || []).find((a) => String(a?.id) === String(clickedId));
                                    if (!picked) return;
                                    setActiveAssignee(picked);
                                    setAttendanceDialogRows(dateRows);
                                    setAttendanceDialogOpen(true);
                                }}
                            />
                        </div>
                    )}
                </div>
            );
        },

        eventContent(arg) {
            const { event } = arg;
            const currentView = arg.view.type;
            const estimateHrs = event.extendedProps?.estimate_hrs || 0;
            const statusText = (event.extendedProps?.status || event.extendedProps?.statusid || '').toString();
            const statusKey = (statusText || '').toString().trim().toLowerCase();
            const dynamicStatus = getDynamicStatusColor?.(statusKey);
            const fallbackStatus = statusColors?.[statusKey];

            const statusPillBg = dynamicStatus?.backgroundColor || fallbackStatus?.backgroundColor || 'rgba(255,255,255,0.22)';
            const statusPillText = dynamicStatus?.color || fallbackStatus?.color || '#ffffff';

            const statusPillHtml = statusText
                ? `<span class="fc-event-status-pill" title="${statusText}" style="display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:2px 8px;border-radius:999px;background:${statusPillBg};color:${statusPillText};font-size:10px;line-height:1;font-weight:800;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${statusText}</span>`
                : '';

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
                                ${statusPillHtml}
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
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                            <div class="fc-event-time">${arg.timeText}</div>
                            ${statusPillHtml ? `<div style="flex-shrink:0;">${statusPillHtml}</div>` : ''}
                        </div>
                        <div class="fc-event-title-container">
                            <div class="fc-event-title fc-sticky">
                                 <span>${event.title || ''} ${estimateText}</span>
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
            // Prevent dropping on holidays
            if (isHolidayDate(dropInfo.start)) {
                return false;
            }
            return !draggedEvent.extendedProps?.isMeeting;
        },

        dateClick(info) {
            // Prevent SideDrawer from opening on empty date clicks.
            // We only want to handle clicks on existing events, which are handled by eventClick or other handlers.
            return;
        },

        selectAllow(selectInfo) {
            // Prevent selecting time slots on holidays
            const start = selectInfo.start;
            const end = selectInfo.end;

            // Check if any part of the selection includes a holiday
            const currentDate = new Date(start);
            while (currentDate < end) {
                if (isHolidayDate(currentDate)) {
                    return false;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return true;
        },

        eventClick({ event }) {
            // Prevent opening events on holidays
            if (isHolidayDate(event.start)) {
                toast.warning('Cannot edit events on holidays');
                return;
            }

            const eventDetails = mapEventDetails(event);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            setRootSubroot({ Task: "meeting" });
            setFormDrawerOpen(true);
        },

        eventDrop({ event, revert }) {
            if (event.extendedProps?.isMeeting) return;

            // Prevent dropping on holidays
            if (isHolidayDate(event.start)) {
                toast.warning('Cannot move events to holidays');
                revert();
                return;
            }

            // Create a unique key for this event
            const eventKey = `${event.id || event.extendedProps?.taskid}-${event.start?.getTime()}`;

            // Skip if this was just processed by eventReceive
            if (processingEventRef.current.has(eventKey)) {
                console.log('Skipping eventDrop - already processed by eventReceive:', eventKey);
                return;
            }

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

        eventResize({ event, revert }) {
            if (event.extendedProps?.isMeeting) return;

            // Prevent resizing into holidays
            if (isHolidayDate(event.end || event.start)) {
                toast.warning('Cannot resize events into holidays');
                revert();
                return;
            }

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
                                        estimate_hrs: formatEstimate(eventDetails.estimate_hrs),
                                        estimate1_hrs: formatEstimate(eventDetails.estimate1_hrs),
                                        estimate2_hrs: formatEstimate(eventDetails.estimate2_hrs),
                                        workinghr: formatEstimate(eventDetails.workinghr),
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

            // Create a unique key for this event to prevent duplicate processing
            const eventKey = `${event.id || event.extendedProps?.taskid}-${event.start?.getTime()}`;

            // Check if we're already processing this event
            if (processingEventRef.current.has(eventKey)) {
                console.log('Skipping duplicate eventReceive for:', eventKey);
                return;
            }

            // Mark this event as being processed
            processingEventRef.current.add(eventKey);

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
            handleCaleFormSubmit(eventDetails, { skipRefresh: false });

            // Clear the processing flag after a short delay
            setTimeout(() => {
                processingEventRef.current.delete(eventKey);
            }, 1000);

        },
    };

    useEffect(() => {
        const button = document.querySelector('.fc-favoritesToggle-button');
        if (button) {
            button.setAttribute('data-active', showFavoritesOnly.toString());
        }
    }, [showFavoritesOnly]);

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

        // Get current date
        const now = new Date();

        const duplicatedEvent = {
            ...eventDetails,
            meetingid: "",
            title: eventDetails.title,
            entrydate: now.toISOString(),
            // start: mergeDateWithTime(eventDetails.start),
            // end: mergeDateWithTime(eventDetails.end),
            DeadLineDate: mergeDateWithTime(eventDetails.DeadLineDate || eventDetails.end),
            repeatflag: "repeat",
            statusid: "",
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
                                        estimate_hrs: formatEstimate(duplicatedEvent.estimate_hrs),
                                        estimate1_hrs: formatEstimate(duplicatedEvent.estimate1_hrs),
                                        estimate2_hrs: formatEstimate(duplicatedEvent.estimate2_hrs),
                                        workinghr: formatEstimate(duplicatedEvent.workinghr),
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

            <Dialog
                open={attendanceDialogOpen}
                onClose={() => {
                    setAttendanceDialogOpen(false);
                    setActiveAssignee(null);
                    setAttendanceDialogRows([]);
                }}
                maxWidth="sm"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: '8px' } }}
            >
                <DialogTitle>Daily Report Attendance</DialogTitle>
                <DialogContent>
                    <DailyReportAttendanceList
                        rows={attendanceDialogRows}
                        attendanceByDate={attendanceByDate}
                        loggedInUserId={getUserProfileData()?.id}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAttendanceDialogOpen(false);
                        setActiveAssignee(null);
                        setAttendanceDialogRows([]);
                    }} className='secondaryBtnClassname'>Close</Button>
                </DialogActions>
            </Dialog>

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

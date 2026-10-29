import React, { useEffect, useRef, useState } from 'react';
import "../../../Pages/Reports/CalendarReport/CalendarReport.scss";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Box, Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Avatar, Tooltip, Drawer, Chip, Divider, List as MuiList, ListItem, ListItemButton, InputAdornment } from '@mui/material';
import { Calendar as CalendarIcon, List, Plus, X, Search } from 'lucide-react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import TaskDetail from '../../Task/TaskDetails/TaskDetails';
import { useRecoilValue } from 'recoil';
import { FullSidebar } from '../../../Recoil/atom';
import { getDynamicStatusColor, getUserProfileData, statusColors, formatUTCDateTime, toAttendanceDateKey, sortAssigneesLoggedInFirst } from '../../../Utils/globalfun';
import { DailyReportSaveApi } from '../../../Api/TaskApi/DailyReportSaveApi';
import { GetDailyReportApi } from '../../../Api/TaskApi/GetDailyReportApi';
import DailyReportAttendance from './DailyReportAttendance';
import DailyReportAttendanceList from './DailyReportAttendanceList';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';

const ReadOnlyCalendar = ({ calendarEvents, calendarsColor, isLoading, selectedEmployee, setSideDrawer, onDailyReportRowsChange }) => {
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const lastScrollTime = useRef(0);
    const isFullSidebar = useRecoilValue(FullSidebar);
    const [taskDetailOpen, setTaskDetailOpen] = useState(false);
    const [selectedTaskData, setSelectedTaskData] = useState(null);

    const handleTaskDetailClose = () => {
        setTaskDetailOpen(false);
        setSelectedTaskData(null);
    };

    const hoverTooltipRef = useRef(null);
    const hoverTooltipHandlersRef = useRef(new Map());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [attendanceByDate, setAttendanceByDate] = useState({});
    const attendanceByDateRef = useRef(attendanceByDate);
    const isHydratingAttendanceRef = useRef(false);
    const [assigneesByDate, setAssigneesByDate] = useState({});
    const [dailyReportRows, setDailyReportRows] = useState([]);
    const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
    const [activeRemarkDateKey, setActiveRemarkDateKey] = useState(null);
    const [remarkDraft, setRemarkDraft] = useState('');
    const [includeTasksInRemark, setIncludeTasksInRemark] = useState(false);
    const [activeAssignee, setActiveAssignee] = useState(null);
    const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    const [attendanceDialogRows, setAttendanceDialogRows] = useState([]);
    const [uncheckDialogOpen, setUncheckDialogOpen] = useState(false);
    const [pendingUncheckDateKey, setPendingUncheckDateKey] = useState(null);
    const [holidayDates, setHolidayDates] = useState([]);
    const [holidayData, setHolidayData] = useState([]);
    const lastRequestIdRef = useRef(0);
    const [dayDetailOpen, setDayDetailOpen] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);
    const [calendarViewType, setCalendarViewType] = useState('timeGridWeek');
    const [visibleRange, setVisibleRange] = useState({ start: null, end: null });
    const [reportSearch, setReportSearch] = useState('');

    const closeDayDetail = () => {
        setDayDetailOpen(false);
        setSelectedDayDate(null);
        setReportSearch('');
    };

    const getEventsForDate = (dateKey) => {
        if (!dateKey) return [];
        const date = new Date(dateKey);
        const events = calendarEvents?.filter((event) => {
            const eventDate = new Date(event.StartDate).toDateString();
            const targetDate = date.toDateString();
            return eventDate === targetDate;
        }) || [];
        return events;
    };

    const formatTasksForRemark = (events) => {
        if (!events || events.length === 0) return '';
        const tasksText = events.map(event => {
            const title = event.meetingtitle || event.taskname || '';
            const estimateHrs = event.estimate_hrs || 0;
            const estimateText = estimateHrs > 0 ? ` (${estimateHrs}hrs)` : '';
            return `${title}${estimateText}`;
        }).join('\n');
        return tasksText + '\n----------------------------------------------';
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
            setHolidayDates(holidays.map(h => h.date));
            setHolidayData(holidays);
        } catch (error) {
            console.error('Error loading holiday dates:', error);
            setHolidayDates([]);
            setHolidayData([]);
        }
    }, []);

    const isHolidayDate = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const dateStr =
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0");
        return holidayDates.includes(dateStr);
    };

    const getHolidayLabel = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const dateStr =
            d.getFullYear() +
            "-" +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(d.getDate()).padStart(2, "0");
        const holiday = holidayData.find(h => h.date === dateStr);
        return holiday?.labelname || '';
    };

    const cancelRemarkFlow = () => {
        const dateKey = activeRemarkDateKey;
        if (dateKey) {
            updateAttendanceState((prev) => ({
                ...prev,
                [dateKey]: { ...(prev?.[dateKey] || {}), checked: false },
            }));
            const loggedInId = getUserProfileData()?.id;
            setAssigneesByDate((prev) => {
                const next = { ...(prev || {}) };
                const list = next?.[dateKey] || [];
                if (
                    list.length === 1 &&
                    loggedInId &&
                    String(list?.[0]?.id) === String(loggedInId)
                ) {
                    delete next[dateKey];
                }
                return next;
            });
        }

        setRemarkDialogOpen(false);
        setActiveRemarkDateKey(null);
        setRemarkDraft('');
    };

    const updateAttendanceState = (newAttendance) => {
        const next = typeof newAttendance === 'function' ? newAttendance(attendanceByDateRef.current) : newAttendance;
        attendanceByDateRef.current = next;
        setAttendanceByDate({ ...next });
    };

    const persistDailyReport = async ({ dateKey, isdone, remarks }) => {
        try {
            const userProfile = getUserProfileData();
            const takenByEmpId = userProfile?.id;
            const givenByEmpId = selectedEmployee?.id;

            if (!takenByEmpId || !givenByEmpId) return;

            // Format entrydate to match SideDrawer (ISO string without milliseconds)
            const entryDate = dateKey ? new Date(dateKey).toISOString().replace('Z', '') : new Date().toISOString().replace('Z', '');

            await DailyReportSaveApi({
                takenbyempid: takenByEmpId,
                givenbyempid: givenByEmpId,
                remarks: remarks ?? '',
                isdone: String(isdone ? 1 : 0),
                entrydate: entryDate
            });

            if (dateKey) {
                const checked = Boolean(isdone && (isdone === 1 || isdone === '1' || isdone === true));
                updateAttendanceState((prev) => ({
                    ...prev,
                    [dateKey]: {
                        ...(prev?.[dateKey] || {}),
                        checked,
                        remark: remarks ?? prev?.[dateKey]?.remark ?? '',
                    },
                }));
            }
        } catch (e) {
            console.error('Error saving daily report:', e);
        }
    };

    const hydrateAttendanceFromApi = async () => {
        try {
            const userProfile = getUserProfileData();
            const takenByEmpId = userProfile?.id;
            const givenByEmpId = selectedEmployee?.id;

            const requestId = Date.now();
            lastRequestIdRef.current = requestId;

            if (!takenByEmpId || !givenByEmpId) {
                setAttendanceByDate({});
                setAssigneesByDate({});
                setDailyReportRows([]);
                return;
            }

            isHydratingAttendanceRef.current = true;
            const res = await GetDailyReportApi();
            const rows = res?.rd || [];

            const assigneeMaster = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
            const activeMaster = assigneeMaster.filter((e) => e?.isactive === 1);
            const masterById = new Map(activeMaster.map((e) => [String(e?.id), e]));

            const byDateAssignees = new Map();
            rows
                .filter((r) => String(r?.GivenByEmpID) === String(givenByEmpId))
                .forEach((r) => {
                    const dk = toAttendanceDateKey(new Date(r?.entrydate));
                    if (!dk) return;
                    const idStr = String(r?.TakenByEmpID);
                    if (!idStr) return;
                    const emp = masterById.get(idStr);
                    if (!emp) return;
                    const list = byDateAssignees.get(dk) || [];
                    if (!list.some((x) => String(x?.id) === idStr)) {
                        list.push(emp);
                    }
                    byDateAssignees.set(dk, list);
                });

            if (lastRequestIdRef.current !== requestId) return;

            const nextAssigneesByDate = {};
            byDateAssignees.forEach((list, dk) => {
                nextAssigneesByDate[dk] = sortAssigneesLoggedInFirst(list);
            });
            setAssigneesByDate(nextAssigneesByDate);

            const nextDailyReportRows = rows
                .filter((r) => String(r?.GivenByEmpID) === String(givenByEmpId))
                .map((r) => {
                    const emp = masterById.get(String(r?.TakenByEmpID));
                    const dk = toAttendanceDateKey(new Date(r?.entrydate));
                    return {
                        ...r,
                        entrydate: formatUTCDateTime(r?.entrydate),
                        __dateKey: dk,
                        __employee: emp || null,
                    };
                })
                .sort((a, b) => {
                    const at = new Date(a?.entrydate || 0).getTime();
                    const bt = new Date(b?.entrydate || 0).getTime();
                    return bt - at;
                });
            setDailyReportRows(nextDailyReportRows);
            onDailyReportRowsChange?.(nextDailyReportRows);

            const filtered = rows.filter((r) => {
                return (
                    String(r?.TakenByEmpID) === String(takenByEmpId) &&
                    String(r?.GivenByEmpID) === String(givenByEmpId)
                );
            });

            const byDate = new Map();
            filtered.forEach((r) => {
                const dk = toAttendanceDateKey(new Date(r?.entrydate));
                if (!dk) return;
                const prev = byDate.get(dk);
                const currTime = new Date(r?.entrydate || 0).getTime();
                const prevTime = new Date(prev?.entrydate || 0).getTime();
                if (!prev || currTime >= prevTime) {
                    byDate.set(dk, r);
                }
            });

            const nextAttendance = {};
            byDate.forEach((r, dk) => {
                const isChecked = r?.isdone === 1 || String(r?.isdone) === '1' || r?.isdone === true;
                nextAttendance[dk] = {
                    checked: isChecked,
                    remark: r?.remarks || '',
                    serverId: r?.ID,
                };
            });

            updateAttendanceState(nextAttendance);
        } catch (e) {
            console.error('Error fetching daily reports:', e);
        } finally {
            isHydratingAttendanceRef.current = false;
        }
    };

    useEffect(() => {
        hydrateAttendanceFromApi();
    }, [selectedEmployee?.id]);

    // Month-view daily report: all report rows in the visible month, grouped by date (view only)
    const monthReportGroups = React.useMemo(() => {
        if (calendarViewType !== 'dayGridMonth' || !visibleRange?.start || !visibleRange?.end) return [];
        const start = dayjs(visibleRange.start);
        const end = dayjs(visibleRange.end);
        const map = new Map();
        (dailyReportRows || []).forEach((r) => {
            const dk = r?.__dateKey;
            if (!dk) return;
            const d = dayjs(dk);
            if (d.isBefore(start, 'day') || !d.isBefore(end, 'day')) return;
            const list = map.get(dk) || [];
            list.push(r);
            map.set(dk, list);
        });
        return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [calendarViewType, visibleRange, dailyReportRows]);

    // Search the monthly report — matches the date (any format) or remark/reporter name
    const filteredMonthReportGroups = React.useMemo(() => {
        const q = reportSearch.trim().toLowerCase();
        if (!q) return monthReportGroups;
        return monthReportGroups
            .map(([dk, rows]) => {
                const dateMatch =
                    dk.includes(q) ||
                    dayjs(dk).format('ddd, DD MMM YYYY').toLowerCase().includes(q) ||
                    dayjs(dk).format('DD-MM-YYYY').includes(q) ||
                    dayjs(dk).format('MMMM YYYY').toLowerCase().includes(q);
                if (dateMatch) return [dk, rows];
                const matchRows = rows.filter((r) => {
                    const emp = r?.__employee;
                    const empName = `${emp?.firstname || ''} ${emp?.lastname || ''}`.trim().toLowerCase();
                    return (r?.remarks || '').toLowerCase().includes(q) || empName.includes(q);
                });
                return matchRows.length ? [dk, matchRows] : null;
            })
            .filter(Boolean);
    }, [monthReportGroups, reportSearch]);

    const calendarOptions = React.useMemo(() => {
        const filteredEvents = calendarEvents?.filter(event => {
            if (!showFavoritesOnly) return true;
            return event?.isfavourite === 1 || event?.isfavourite === true;
        }) || [];

        return {
            firstDay: 1,
            events: filteredEvents.map((event) => ({
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
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
            initialView: 'timeGridWeek',
            scrollTime: '09:15:00',
            scrollTimeReset: false,
            slotMinTime: '07:00:00',
            slotMaxTime: '22:00:00',
            slotDuration: '00:15:00',
            slotLabelInterval: '00:15:00',
            headerToolbar: {
                start: 'employeeSidebarToggle,prev,next title',
                center: '',
                end: 'monthlyReport favoritesToggle | dayGridMonth,timeGridWeek,timeGridDay,listMonth',
            },
            customButtons: {
                employeeSidebarToggle: {
                    icon: 'bi bi-list',
                    click() {
                        setSideDrawer(prev => !prev);
                    }
                },
                monthlyReport: {
                    text: 'Monthly Report',
                    hint: 'Open month-wise daily report',
                    click() {
                        const api = calendarRef.current?.getApi?.();
                        if (api && api.view?.type !== 'dayGridMonth') {
                            api.changeView('dayGridMonth');
                        }
                        setSelectedDayDate(null);
                        setDayDetailOpen(true);
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
            views: {
                week: {
                    titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                },
            },
            // Make calendar read-only
            editable: false,
            droppable: false,
            eventResizableFromStart: false,
            resizable: false,
            dragScroll: false,
            selectable: false,
            selectMirror: false,
            dayMaxEvents: 4,
            moreLinkClick: 'popover',
            navLinks: false,
            weekNumbers: true,
            dayCellContent(arg) {
                const isMonthView = arg.view?.type === 'dayGridMonth';
                if (isMonthView) {
                    const dateKey = toAttendanceDateKey(arg.date, false);
                    const taskCount = filteredEvents.filter(
                        (ev) => new Date(ev.StartDate).toDateString() === arg.date.toDateString()
                    ).length;
                    const hasReport = (dailyReportRows || []).some((r) => r?.__dateKey === dateKey);
                    const reportDot = hasReport
                        ? '<span class="fc-day-report-dot" title="Daily report" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#7367f0;margin-left:4px;vertical-align:middle;"></span>'
                        : '';
                    if (taskCount > 0 || hasReport) {
                        return {
                            html: `
                            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
                                <span class="fc-daygrid-day-number">${arg.dayNumberText}${reportDot}</span>
                                ${taskCount > 0 ? `<span class="fc-day-task-count" title="${taskCount} tasks">${taskCount}</span>` : ''}
                            </div>
                        `,
                        };
                    }
                }
                return arg.dayNumberText;
            },
            dayCellClassNames: (arg) => {
                return isHolidayDate(arg.date) ? ['holiday-date'] : [];
            },
            slotLaneClassNames: (arg) => {
                const d = arg?.date;
                if (!d) return [];
                const classes = [];
                if (isHolidayDate(d)) {
                    classes.push('holiday-slot');
                }
                return classes;
            },
            datesSet(dateInfo) {
                setCalendarViewType(dateInfo?.view?.type || '');
                setVisibleRange({
                    start: dateInfo?.view?.currentStart || dateInfo?.start || null,
                    end: dateInfo?.view?.currentEnd || dateInfo?.end || null,
                });
                const btn = document.querySelector('.fc-favoritesToggle-button');
                if (btn) {
                    btn.setAttribute('data-active', showFavoritesOnly);
                }
            },
            eventClassNames({ event }) {
                const category = event.extendedProps.category || 'ETC';
                const colorClass = calendarsColor[category] || 'primary';
                const classes = [`bg-${colorClass}`];

                if (event.extendedProps?.ismilestone === 1) {
                    classes.push('milestone-event');
                }

                if (event.extendedProps?.isfavourite === 1 || event.extendedProps?.isfavourite === true) {
                    classes.push('favorite-event');
                    if (showFavoritesOnly) {
                        classes.push('favorite-highlighted');
                    }
                }

                return classes;
            },
            dayHeaderContent(arg) {
                const calendarApi = arg.view.calendar;
                const currentView = arg.view.type;
                const dateKey = toAttendanceDateKey(arg.date, false);

                if (currentView === 'dayGridMonth') {
                    const formattedDate = arg.date.toLocaleDateString('en-US', { weekday: 'long' });
                    return (
                        <div className="calendar-day-header">
                            <div className="date-text">{formattedDate}</div>
                        </div>
                    );
                }

                const dayEvents = calendarApi.getEvents().filter((event) => {
                    const eventDate = new Date(event.start).toDateString();
                    const headerDate = arg.date.toDateString();
                    return eventDate === headerDate;
                });

                const totalHours = dayEvents.reduce((sum, event) => sum + (event.extendedProps?.estimate_hrs || 0), 0);
                const hours = Number(totalHours);
                const totalText =
                    hours === 0
                        ? '0.00 hrs'
                        : `${hours.toFixed(2)} ${hours <= 1 ? 'hr' : 'hrs'}`;


                const dayName = arg.date.toLocaleDateString('en-US', { weekday: 'short' });
                const day = arg.date.getDate();
                const month = arg.date.toLocaleDateString('en-US', { month: 'short' });
                const formattedDate = `${dayName} ${day}-${month}`;

                const holidayLabel = getHolidayLabel(arg.date);

                const attendance = attendanceByDate[dateKey] || {};
                const checked = !!attendance.checked;
                const isToday = dateKey === toAttendanceDateKey(new Date());
                const isHoliday = isHolidayDate(arg.date);
                const assignees = sortAssigneesLoggedInFirst(assigneesByDate[dateKey] || []);

                return (
                    <div className="calendar-day-header">
                        <div className="date-text" style={{ position: 'relative' }}>
                            {formattedDate}
                            {holidayLabel && (
                                <div className="holiday-label-header" style={{
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
                                    zIndex: 1
                                }}>
                                    {holidayLabel}
                                </div>
                            )}
                        </div>
                        {!isHoliday && (
                            <div className="calendar-day-header-right-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="estimate-text">({totalText})</div>
                                <DailyReportAttendance
                                    checked={checked}
                                    isToday={isToday}
                                    disabled={isHydratingAttendanceRef.current}
                                    dateKey={dateKey}
                                    onCheckClick={(e) => {
                                        if (checked) {
                                            setPendingUncheckDateKey(dateKey);
                                            setUncheckDialogOpen(true);
                                        } else {
                                            updateAttendanceState((prev) => ({
                                                ...prev,
                                                [dateKey]: { ...(prev?.[dateKey] || {}), checked: true },
                                            }));
                                            setActiveRemarkDateKey(dateKey);
                                            setRemarkDraft(attendanceByDate[dateKey]?.remark || '');
                                            setIncludeTasksInRemark(false);
                                            setRemarkDialogOpen(true);
                                        }
                                    }}
                                    assignees={assignees}
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
            eventDidMount(arg) {
                try {
                    const props = arg.event.extendedProps;
                    const statusText = (props?.status || props?.statusid || '').toString();
                    const estimateHrs = Number(props?.estimate_hrs || 0);
                    const workingHr = Number(props?.workinghr ?? props?.workingHr ?? 0);
                    const diff = Number((estimateHrs - workingHr).toFixed(2));
                    const isCompleted = statusText.toLowerCase() === 'completed' || String(props?.statusid) === '3';
                    const endDateText = (arg.event.end || props?.EndDate) ? new Date(arg.event.end || props?.EndDate).toLocaleString() : '';

                    const ensureTooltip = () => {
                        if (hoverTooltipRef.current) return hoverTooltipRef.current;
                        const el = document.createElement('div');
                        el.className = 'optigo-calendar-hover-tooltip';
                        Object.assign(el.style, {
                            position: 'fixed',
                            zIndex: '99999',
                            display: 'none',
                            pointerEvents: 'none',
                            maxWidth: '280px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            background: 'rgba(17, 24, 39, 0.95)',
                            color: '#fff',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                            backdropFilter: 'blur(6px)',
                            fontSize: '12px',
                            lineHeight: '1.35',
                        });
                        document.body.appendChild(el);
                        hoverTooltipRef.current = el;
                        return el;
                    };

                    const renderTooltipHtml = () => {
                        const diffColor = diff < 0 ? '#f87171' : diff > 0 ? '#34d399' : '#e5e7eb';
                        const diffPrefix = diff > 0 ? '+' : '';
                        return [
                            statusText ? `<div style="display:flex;justify-content:space-between;gap:10px;"><div style="opacity:.8;">Status</div><div style="font-weight:700;">${statusText}</div></div>` : '',
                            `<div style="display:flex;justify-content:space-between;gap:10px;"><div style="opacity:.8;">Estimate</div><div style="font-weight:700;">${estimateHrs}</div></div>`,
                            `<div style="display:flex;justify-content:space-between;gap:10px;"><div style="opacity:.8;">WorkingHr</div><div style="font-weight:700;">${workingHr}</div></div>`,
                            `<div style="display:flex;justify-content:space-between;gap:10px;"><div style="opacity:.8;">Diff</div><div style="font-weight:800;color:${diffColor};">${diffPrefix}${diff}</div></div>`,
                            isCompleted && endDateText ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.15);display:flex;justify-content:space-between;gap:10px;"><div style="opacity:.8;">Completed</div><div style="font-weight:700;">${endDateText}</div></div>` : ''
                        ].filter(Boolean).join('');
                    };

                    const move = (e) => {
                        const tooltip = hoverTooltipRef.current;
                        if (!tooltip) return;
                        const offset = 14;
                        let x = e.clientX + offset;
                        let y = e.clientY + offset;
                        const rect = tooltip.getBoundingClientRect();
                        if (x + rect.width + 8 > window.innerWidth) x = window.innerWidth - rect.width - 8;
                        if (y + rect.height + 8 > window.innerHeight) y = window.innerHeight - rect.height - 8;
                        tooltip.style.left = `${Math.max(8, x)}px`;
                        tooltip.style.top = `${Math.max(8, y)}px`;
                    };

                    const show = (e) => {
                        const tooltip = ensureTooltip();
                        tooltip.innerHTML = renderTooltipHtml();
                        tooltip.style.display = 'block';
                        move(e);
                    };

                    const hide = () => {
                        if (hoverTooltipRef.current) hoverTooltipRef.current.style.display = 'none';
                    };

                    arg.el.style.cursor = 'default';
                    arg.el.addEventListener('mouseenter', show);
                    arg.el.addEventListener('mousemove', move);
                    arg.el.addEventListener('mouseleave', hide);

                    hoverTooltipHandlersRef.current.set(arg.el, { show, move, hide });
                } catch (e) {
                    console.error('eventDidMount error:', e);
                }
            },
            eventWillUnmount(arg) {
                try {
                    const handlers = hoverTooltipHandlersRef.current.get(arg.el);
                    if (handlers) {
                        arg.el.removeEventListener('mouseenter', handlers.show);
                        arg.el.removeEventListener('mousemove', handlers.move);
                        arg.el.removeEventListener('mouseleave', handlers.hide);
                        hoverTooltipHandlersRef.current.delete(arg.el);
                    }
                } catch (e) {
                    console.error('eventWillUnmount error:', e);
                }
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
                    return `(${parseFloat(hours)?.toFixed(2)} ${unit})`;
                };

                const estimateText = formatEstimate(estimateHrs);

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
                    `,
                    };
                }

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
                    </div>
                `,
                };
            },
            eventClick({ event }) {
                const props = event.extendedProps;
                const eventDetails = {
                    ...props,
                    meetingid: event.id,
                    title: event.title,
                    start: event.start.toISOString(),
                    end: event.end ? event.end.toISOString() : event.start.toISOString(),
                    isAllDay: event.allDay ? 1 : 0,
                    assignee: props.guests || []
                };
                setSelectedTaskData(eventDetails);
                setTaskDetailOpen(true);
            },
            dateClick(info) {
                if (info?.view?.type === 'dayGridMonth') {
                    setSelectedDayDate(new Date(info.date));
                    setDayDetailOpen(true);
                }
                return false;
            },
        };
    }, [calendarEvents, calendarsColor, attendanceByDate, assigneesByDate, showFavoritesOnly, dailyReportRows]);

    useEffect(() => {
        if (calendarRef?.current) {
            setCalendarApi(calendarRef?.current?.getApi());
        }
    }, []);

    // Smooth scroll to 9:15 AM
    const smoothScrollToTime = (timeString = '09:15:00') => {
        const now = Date.now();
        if (now - lastScrollTime.current < 1000) {
            return;
        }
        const api = calendarApi || (calendarRef?.current?.getApi?.());
        if (api) {
            lastScrollTime.current = now;
            setTimeout(() => {
                api.scrollToTime(timeString);
            }, 200);
        }
    };

    useEffect(() => {
        if (calendarApi) {
            smoothScrollToTime();
        }
    }, [calendarApi]);

    // Scroll to 9:15 AM when employee changes
    useEffect(() => {
        if (calendarApi && selectedEmployee) {
            smoothScrollToTime();
        }
    }, [calendarApi, selectedEmployee]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const btn = document.querySelector('.fc-favoritesToggle-button');
            if (btn) {
                btn.setAttribute('data-active', showFavoritesOnly);
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [showFavoritesOnly]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (calendarRef.current) {
                calendarRef.current.getApi().updateSize();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [isFullSidebar]);



    useEffect(() => {
        return () => {
            try {
                if (hoverTooltipRef.current) {
                    hoverTooltipRef.current.remove();
                    hoverTooltipRef.current = null;
                }
                hoverTooltipHandlersRef.current = new Map();
            } catch {
                // ignore
            }
        };
    }, []);

    if (!selectedEmployee) {
        return (
            <Box className="calendar-report-container" sx={{ height: '100%', position: 'relative' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        zIndex: 10,
                    }}
                    className="employee-toggle"
                >
                    <IconButton
                        onClick={() => setSideDrawer(prev => !prev)}
                        className="employee-toggle-btn"
                        sx={{
                            backgroundColor: 'transparent',
                            color: '#7367f0',
                            '&:hover': {
                                backgroundColor: 'rgba(115, 103, 240, 0.1)',
                                color: '#5a52d5',
                            },
                        }}
                    >
                        <List size={20} />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#7d7f85',
                    }}
                >
                    <CalendarIcon size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <Typography variant="h6" sx={{ mb: 1, color: '#444050' }}>
                        No Employee Selected
                    </Typography>
                    <Typography variant="body2">
                        Please select an employee from the list to view their calendar
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <CircularProgress size={48} sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                    Loading calendar data...
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="readOnlyCalendar">
            <FullCalendar ref={calendarRef} {...calendarOptions} />
            <TaskDetail
                open={taskDetailOpen}
                onClose={handleTaskDetailClose}
                taskData={selectedTaskData}
                handleTaskFavorite={() => { }} // Read-only view
            />
            <Box
                sx={{
                    display: 'none'
                }}
            >
                <div id="favoritesToggle-state" data-active={showFavoritesOnly}></div>
            </Box>


            <Dialog
                open={remarkDialogOpen}
                onClose={(event, reason) => {
                    if (reason === "backdropClick") {
                        return;
                    }
                    cancelRemarkFlow();
                }}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '8px',
                    },
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body" color="text.secondary">
                            Add Remark (Optional)
                        </Typography>
                        <Tooltip
                            arrow
                            placement="top"
                            title={includeTasksInRemark ? "Remove tasks from remark" : "Add tasks to remark"}
                        >
                            <IconButton
                                onClick={() => {
                                    const newValue = !includeTasksInRemark;
                                    setIncludeTasksInRemark(newValue);

                                    if (newValue) {
                                        const events = getEventsForDate(activeRemarkDateKey);
                                        const tasksText = formatTasksForRemark(events);
                                        setRemarkDraft(prev => prev ? prev + '\n' + tasksText : tasksText);
                                    } else {
                                        const events = getEventsForDate(activeRemarkDateKey);
                                        const tasksText = formatTasksForRemark(events);
                                        setRemarkDraft(prev => prev.replace(tasksText, '').trim());
                                    }
                                }}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: '4px',
                                    backgroundColor:
                                        includeTasksInRemark ? "#7367f0" : "white",
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                                    "&:hover": {
                                        backgroundColor: "#7367f0",
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                                    },
                                }}
                            >
                                <Plus
                                    size={20}
                                    color={includeTasksInRemark ? "#fff" : "#0000008a"}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DialogTitle>
                <DialogContent>

                    <TextField
                        value={remarkDraft}
                        onChange={(e) => setRemarkDraft(e.target.value)}
                        placeholder="Type remark (optional)"
                        fullWidth
                        multiline
                        minRows={2}
                        sx={{ mt: 1, '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            cancelRemarkFlow();
                        }}
                        className='secondaryBtnClassname'
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const dateKey = activeRemarkDateKey;

                            if (!dateKey) {
                                setRemarkDialogOpen(false);
                                setRemarkDraft('');
                                return;
                            }

                            const userProfile = getUserProfileData();
                            if (userProfile?.id) {
                                setAssigneesByDate((prevAssignees) => {
                                    const next = { ...(prevAssignees || {}) };
                                    const existing = next?.[dateKey] || [];
                                    const hasUser = existing.some((x) => String(x?.id) === String(userProfile?.id));
                                    next[dateKey] = hasUser ? existing : [userProfile, ...existing];
                                    return next;
                                });
                            }

                            updateAttendanceState((prev) => {
                                const existing = prev?.[dateKey] || {};
                                return {
                                    ...prev,
                                    [dateKey]: {
                                        ...existing,
                                        checked: true,
                                        remark: remarkDraft || '',
                                    },
                                };
                            });
                            persistDailyReport({
                                dateKey,
                                isdone: 1,
                                remarks: remarkDraft || '',
                            });
                            toast.success('Attendance saved for ' + dateKey);
                            setTimeout(() => {
                                hydrateAttendanceFromApi();
                            }, 1000);
                            setRemarkDialogOpen(false);
                            setActiveRemarkDateKey(null);
                            setRemarkDraft('');
                        }}
                        className='buttonClassname'
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={attendanceDialogOpen}
                onClose={() => {
                    setAttendanceDialogOpen(false);
                    setActiveAssignee(null);
                    setAttendanceDialogRows([]);
                }}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '8px',
                    },
                }}
            >
                <DialogTitle>
                    Daily Report Attendance
                </DialogTitle>
                <DialogContent>
                    <DailyReportAttendanceList
                        rows={attendanceDialogRows}
                        attendanceByDate={attendanceByDate}
                        loggedInUserId={getUserProfileData()?.id}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setAttendanceDialogOpen(false);
                            setActiveAssignee(null);
                            setAttendanceDialogRows([]);
                        }}
                        className='secondaryBtnClassname'
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Day Detail + Monthly Daily Report Drawer (month view) */}
            <Drawer
                anchor="right"
                open={dayDetailOpen}
                onClose={closeDayDetail}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, borderRadius: '12px 0 0 12px' } }}
            >
                {(() => {
                    const dayDateKey = selectedDayDate ? toAttendanceDateKey(selectedDayDate, false) : null;
                    const dayEvents = dayDateKey ? getEventsForDate(dayDateKey) : [];
                    const totalHours = dayEvents.reduce((sum, ev) => sum + (ev.estimate_hrs || 0), 0);
                    const formattedDate = selectedDayDate
                        ? selectedDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        : (visibleRange?.start ? dayjs(visibleRange.start).format('MMMM YYYY') : 'Monthly Report');
                    const employeeName = `${selectedEmployee?.firstname || ''} ${selectedEmployee?.lastname || ''}`.trim();
                    const categoryColors = {
                        primary: '#7367f0', success: '#28c76f', error: '#ea5455',
                        warning: '#ff9f43', info: '#00cfe8', secondary: '#a8aaae',
                        support: '#8c57ff', dark: '#4b4b4b', productive: '#26c6da',
                        'rnd-tech': '#5e72e4', creative: '#fb6340', 'sop-correction': '#f5365c',
                        leave: '#f7fafc', maintenance: '#11cdef', unplanned: '#172b4d'
                    };
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                        {formattedDate}
                                    </Typography>
                                    {employeeName && (
                                        <Typography sx={{ fontSize: '0.78rem', color: '#7367f0', fontWeight: 600, mt: 0.25 }}>
                                            {employeeName}
                                        </Typography>
                                    )}
                                    {selectedDayDate && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                            <Chip size="small" label={`${dayEvents.length} tasks`} sx={{ backgroundColor: 'rgba(115,103,240,0.12)', color: '#5a52d5', fontWeight: 600 }} />
                                            {totalHours > 0 && (
                                                <Chip size="small" icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />} label={`${parseFloat(totalHours).toFixed(2)} hrs`} sx={{ backgroundColor: 'rgba(40,199,111,0.12)', color: '#28a745', fontWeight: 600 }} />
                                            )}
                                        </Box>
                                    )}
                                </Box>
                                <IconButton size="small" onClick={closeDayDetail} sx={{ mt: 0.5 }}>
                                    <X size={18} />
                                </IconButton>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                                {selectedDayDate && dayEvents.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ py: 2, fontSize: '0.85rem' }}>
                                        No tasks for this day
                                    </Typography>
                                )}
                                <MuiList dense disablePadding>
                                    {dayEvents.map((ev, idx) => {
                                        const statusKey = (ev.status || ev.statusid || '').toString().trim().toLowerCase();
                                        const dynamicStatus = getDynamicStatusColor?.(statusKey);
                                        const fallbackStatus = statusColors?.[statusKey];
                                        const statusBg = dynamicStatus?.backgroundColor || fallbackStatus?.backgroundColor || 'rgba(0,0,0,0.08)';
                                        const statusColor = dynamicStatus?.color || fallbackStatus?.color || '#555';
                                        const catColor = calendarsColor[ev.category] || 'primary';
                                        const dotColor = categoryColors[catColor] || '#7367f0';
                                        return (
                                            <ListItem key={`${ev.meetingid}-${idx}`} disablePadding sx={{ mb: 0.75 }}>
                                                <ListItemButton
                                                    sx={{
                                                        borderRadius: 2,
                                                        border: '1px solid #e0e0e0',
                                                        py: 1,
                                                        px: 1.5,
                                                        alignItems: 'flex-start',
                                                        gap: 1
                                                    }}
                                                    onClick={() => {
                                                        setSelectedTaskData({
                                                            meetingid: ev.meetingid,
                                                            title: ev.meetingtitle || ev.taskname || '',
                                                            start: new Date(ev.StartDate).toISOString(),
                                                            end: new Date(ev.EndDate || ev.StartDate).toISOString(),
                                                            isAllDay: ev.isAllDay ? 1 : 0,
                                                            assignee: ev.guests || [],
                                                            taskid: ev.taskid,
                                                            parentid: ev.parentid,
                                                            projectid: ev.projectid,
                                                            workcategoryid: ev.workcategoryid,
                                                            category: ev.category || '',
                                                            statusid: ev.statusid,
                                                            status: ev.status,
                                                            priorityid: ev.priorityid,
                                                            priority: ev.priority,
                                                            estimate_hrs: ev.estimate_hrs || 0,
                                                            workinghr: ev.workinghr || 0,
                                                            DeadLineDate: ev.DeadLineDate,
                                                            descr: ev.Desc,
                                                            ismilestone: ev.ismilestone,
                                                        });
                                                        setTaskDetailOpen(true);
                                                        closeDayDetail();
                                                    }}
                                                >
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0, mt: 0.6 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography fontWeight={600} fontSize="0.9rem" noWrap title={ev.meetingtitle || ev.taskname || ''}>
                                                            {ev.meetingtitle || ev.taskname || ''}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.4 }}>
                                                            {ev.status && (
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 999, backgroundColor: statusBg, color: statusColor, whiteSpace: 'nowrap' }}>
                                                                    {ev.status}
                                                                </span>
                                                            )}
                                                            {ev.priority && (
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>
                                                                    {ev.priority}
                                                                </span>
                                                            )}
                                                            {ev.estimate_hrs > 0 && (
                                                                <span style={{ fontSize: '0.7rem', color: '#888', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <AccessTimeIcon sx={{ fontSize: '12px' }} />
                                                                    {parseFloat(ev.estimate_hrs).toFixed(2)} hrs
                                                                </span>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </MuiList>

                                {/* Month view — whole-month daily report grouped by date (view only) */}
                                {calendarViewType === 'dayGridMonth' && (
                                    <Box sx={{ mt: selectedDayDate ? 1.5 : 0 }}>
                                        {selectedDayDate && <Divider sx={{ mb: 1.5 }} />}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5, mb: 1 }}>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#444050', letterSpacing: 0.3 }}>
                                                DAILY REPORT{visibleRange?.start ? ` — ${dayjs(visibleRange.start).format('MMMM YYYY')}` : ''}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={`${filteredMonthReportGroups.length} ${filteredMonthReportGroups.length === 1 ? 'day' : 'days'}`}
                                                sx={{ backgroundColor: 'rgba(115,103,240,0.12)', color: '#5a52d5', fontWeight: 600, height: 22 }}
                                            />
                                        </Box>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Search date or remark..."
                                            value={reportSearch}
                                            onChange={(e) => setReportSearch(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search size={16} color="#7367f0" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 1.5,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                    fontSize: '0.85rem',
                                                    backgroundColor: '#fff',
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7367f0' },
                                                },
                                            }}
                                        />
                                        {filteredMonthReportGroups.length === 0 ? (
                                            <Typography color="text.secondary" align="center" sx={{ py: 3, fontSize: '0.85rem' }}>
                                                {reportSearch.trim() ? `No reports match "${reportSearch.trim()}"` : 'No daily reports for this month'}
                                            </Typography>
                                        ) : (
                                            filteredMonthReportGroups.map(([dk, rows]) => (
                                                <Box key={dk} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, mb: 0.75 }}>
                                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#7367f0', flexShrink: 0 }} />
                                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#7367f0' }}>
                                                            {dayjs(dk).format('ddd, DD MMM YYYY')}
                                                        </Typography>
                                                    </Box>
                                                    <DailyReportAttendanceList
                                                        rows={rows}
                                                        attendanceByDate={attendanceByDate}
                                                        loggedInUserId={getUserProfileData()?.id}
                                                        scrollable={false}
                                                    />
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                })()}
            </Drawer>
            <ConfirmationDialog
                open={uncheckDialogOpen}
                onClose={() => {
                    setUncheckDialogOpen(false);
                    setPendingUncheckDateKey(null);
                }}
                title="Uncheck Attendance"
                content="Are you sure you want to uncheck your attendance for today?"
                confirmLabel="Uncheck"
                cancelLabel="Cancel"
                onConfirm={() => {
                    const dateKey = pendingUncheckDateKey;
                    if (dateKey) {
                        const existingRemark = attendanceByDateRef.current?.[dateKey]?.remark || '';
                        updateAttendanceState((prev) => ({
                            ...prev,
                            [dateKey]: { ...(prev?.[dateKey] || {}), checked: false, remark: existingRemark },
                        }));
                        persistDailyReport({ dateKey, isdone: 0, remarks: existingRemark });
                        toast.info('Attendance unchecked for ' + dateKey);
                    }
                    setUncheckDialogOpen(false);
                    setPendingUncheckDateKey(null);
                }}
            />
        </Box>
    );

};

export default ReadOnlyCalendar;

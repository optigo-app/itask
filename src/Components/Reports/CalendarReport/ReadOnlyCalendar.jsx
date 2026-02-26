import React, { useEffect, useRef, useState } from 'react';
import "../../../Pages/Reports/CalendarReport/CalendarReport.scss";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import ReactDOM from 'react-dom/client';
import { Box, Typography, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Avatar } from '@mui/material';
import { Calendar as CalendarIcon, List, CheckCircle, Circle } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { FullSidebar } from '../../../Recoil/atom';
import { getDynamicStatusColor, getUserProfileData, statusColors, formatUTCDateTime } from '../../../Utils/globalfun';
import { DailyReportSaveApi } from '../../../Api/TaskApi/DailyReportSaveApi';
import { GetDailyReportApi } from '../../../Api/TaskApi/GetDailyReportApi';
import AssigneeAvatarGroup from '../../ShortcutsComponent/Assignee/AssigneeAvatarGroup';
import DailyReportAttendanceList from './DailyReportAttendanceList';
import { toast } from 'react-toastify';
import ConfirmationDialog from '../../../Utils/ConfirmationDialog/ConfirmationDialog';

const MuiAvatar = Avatar;

const ReadOnlyCalendar = ({ calendarEvents, calendarsColor, isLoading, selectedEmployee, setSideDrawer, onDailyReportRowsChange }) => {
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const lastScrollTime = useRef(0);
    const isFullSidebar = useRecoilValue(FullSidebar);

    const hoverTooltipRef = useRef(null);
    const hoverTooltipHandlersRef = useRef(new Map());
    console.log(calendarEvents, 'calendarEvents');

    const [attendanceByDate, setAttendanceByDate] = useState({});
    const attendanceByDateRef = useRef(attendanceByDate);
    const isHydratingAttendanceRef = useRef(false);
    const [assigneesByDate, setAssigneesByDate] = useState({});
    const assigneesByDateRef = useRef(assigneesByDate);
    const [dailyReportRows, setDailyReportRows] = useState([]);
    const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
    const [activeRemarkDateKey, setActiveRemarkDateKey] = useState(null);
    const [remarkDraft, setRemarkDraft] = useState('');
    const [activeAssignee, setActiveAssignee] = useState(null);
    const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    const [attendanceDialogRows, setAttendanceDialogRows] = useState([]);
    const [uncheckDialogOpen, setUncheckDialogOpen] = useState(false);
    const [pendingUncheckDateKey, setPendingUncheckDateKey] = useState(null);
    const lastRequestIdRef = useRef(0);

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

            await DailyReportSaveApi({
                takenbyempid: takenByEmpId,
                givenbyempid: givenByEmpId,
                remarks: remarks ?? '',
                isdone: String(isdone ? 1 : 0),
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
        debugger;
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

            const assigneeMaster = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
            const activeMaster = assigneeMaster.filter((e) => e?.isactive === 1);
            const masterById = new Map(activeMaster.map((e) => [String(e?.id), e]));

            const byDateAssignees = new Map();
            rows
                .filter((r) => String(r?.GivenByEmpID) === String(givenByEmpId))
                .forEach((r) => {
                    const dk = toDateKey(new Date(r?.entrydate));
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
                    const dk = toDateKey(new Date(r?.entrydate));
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
            console.log('nextDailyReportRows', nextDailyReportRows);
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
                const dk = toDateKey(new Date(r?.entrydate));
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

    function toDateKey(date, useUTC = true) {
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
    }

    useEffect(() => {
        hydrateAttendanceFromApi();
    }, [selectedEmployee?.id]);

    const calendarOptions = React.useMemo(() => ({
        firstDay: 1,
        events: calendarEvents?.map((event) => ({
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
            end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
        },
        customButtons: {
            employeeSidebarToggle: {
                text: '☰',
                click() {
                    setSideDrawer(prev => !prev);
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
        datesSet() {
            // state changes handle header updates automatically now
        },
        eventClassNames({ event }) {
            const category = event.extendedProps.category || 'ETC';
            const colorClass = calendarsColor[category] || 'primary';
            return [`bg-${colorClass}`];
        },
        dayHeaderContent(arg) {
            const calendarApi = arg.view.calendar;
            const currentView = arg.view.type;
            const dateKey = toDateKey(arg.date, false);

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
            const totalText = totalHours === 0 ? '0 hrs' : `${totalHours} ${totalHours <= 1 ? 'hr' : 'hrs'}`;

            const dayName = arg.date.toLocaleDateString('en-US', { weekday: 'short' });
            const day = arg.date.getDate();
            const month = arg.date.toLocaleDateString('en-US', { month: 'short' });
            const formattedDate = `${dayName} ${day}-${month}`;

            const attendance = attendanceByDate[dateKey] || {};
            const checked = !!attendance.checked;
            const isToday = dateKey === toDateKey(new Date());
            const assignees = sortAssigneesLoggedInFirst(assigneesByDate[dateKey] || []);
            console.log('assignees', assigneesByDate, dateKey);

            return (
                <div className="calendar-day-header">
                    <div className="date-text">{formattedDate}</div>
                    <div className="calendar-day-header-right">
                        <div className="calendar-day-header-right-left">
                            <div className="estimate-text">({totalText})</div>
                        </div>
                        <div className="calendar-day-header-right-center">
                            <IconButton
                                disabled={!isToday}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isToday || isHydratingAttendanceRef.current) return;
                                    const isAlreadyChecked = attendance.checked;
                                    if (isAlreadyChecked) {
                                        setPendingUncheckDateKey(dateKey);
                                        setUncheckDialogOpen(true);
                                    } else {
                                        updateAttendanceState((prev) => ({
                                            ...prev,
                                            [dateKey]: { ...(prev?.[dateKey] || {}), checked: true },
                                        }));

                                        setActiveRemarkDateKey(dateKey);
                                        setRemarkDraft(attendance.remark || '');
                                        setRemarkDialogOpen(true);
                                    }
                                }}
                                className={`attn-attendance-btn ${checked ? 'is-checked' : 'not-checked'}`}
                                sx={{
                                    padding: '4px',
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: checked ? '#7367f0 !important' : '#fff !important',
                                    color: checked ? '#fff !important' : '#9e9e9e !important',
                                    border: checked ? 'none !important' : '1px solid #e0e0e0 !important',
                                    '&:hover': {
                                        backgroundColor: checked ? '#5a52d5 !important' : 'rgba(115, 103, 240, 0.1) !important',
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.5,
                                    }
                                }}
                                title="Mark attendance (optional remark)"
                            >
                                {checked ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </IconButton>
                        </div>
                        <div className="calendar-day-header-right-right">
                            <AssigneeAvatarGroup
                                assignees={assignees}
                                task={{ parentid: 0 }}
                                maxVisible={1}
                                showAddButton={false}
                                onAvatarClick={(all, clickedId) => {
                                    const dateRows = dailyReportRows.filter(r => r.__dateKey === dateKey);
                                    const picked = (all || []).find((a) => String(a?.id) === String(clickedId));
                                    if (!picked) return;
                                    setActiveAssignee(picked);
                                    setAttendanceDialogRows(dateRows);
                                    setAttendanceDialogOpen(true);
                                }}
                                size={26}
                                spacing={0.25}
                            />
                        </div>
                    </div>
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
                return `(${hours} ${unit})`;
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
        eventClick() {
            return false;
        },
        dateClick() {
            return false;
        },
    }), [calendarEvents, calendarsColor, attendanceByDate, assigneesByDate]);

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
                    <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
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


            <Dialog
                open={remarkDialogOpen}
                onClose={cancelRemarkFlow}
                maxWidth="xs"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '8px',
                    },
                }}
            >
                <DialogTitle>Add Remark (Optional)</DialogTitle>
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

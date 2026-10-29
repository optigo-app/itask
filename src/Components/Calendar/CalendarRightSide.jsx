import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarData, calendarM, calendarSideBarOpen, CalEventsFilter, CalformData, FullSidebar, rootSubrootflag, TaskData, fetchlistApiCall } from '../../Recoil/atom';
import {
    Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider,
    Drawer, Chip, IconButton, Typography, List, ListItem, ListItemButton,
    Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress,
    TextField, InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Trash2, Pencil, Trash, CalendarClock, X, ChevronDown, RefreshCw, Repeat, Search } from 'lucide-react';
import DepartmentAssigneeAutocomplete from '../ShortcutsComponent/Assignee/DepartmentAssigneeAutocomplete';
import { PERMISSIONS } from '../Auth/Role/permissions';
import { toast } from 'react-toastify';
import { getDynamicStatusColor, statusColors, getUserProfileData, formatUTCDateTime, toAttendanceDateKey, mergeDateWithTime } from '../../Utils/globalfun';
import DailyReportAttendance from '../Reports/CalendarReport/DailyReportAttendance';
import { GetDailyReportApi } from '../../Api/TaskApi/GetDailyReportApi';
import DailyReportAttendanceList from '../Reports/CalendarReport/DailyReportAttendanceList';
import EventContextMenu from './EventContextMenu';
import CommentMenuPopup from '../ShortcutsComponent/Comment/CommentMenuPopup';
import dayjs from 'dayjs';
import CustomDateTimePicker from '../../Utils/DateComponent/CustomDateTimePicker';

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
    onCalendarRangeChange,
    handleRemoveEvent,
    handlePermanentDelete,
    handleBulkDelete,
    handleBulkPermanentDelete,
    handleBulkMoveNextWeek,
    handleIndividualMove,
    onRefreshEvents,
}) => {
    const isFullSidebar = useRecoilValue(FullSidebar);
    const setSidebarToggle = useSetRecoilState(calendarSideBarOpen);
    const calendarRef = useRef();
    const [calendarApi, setCalendarApi] = useState(null);
    const lastScrollTime = useRef(0);
    const date = useRecoilValue(calendarM);
    const setCalFormData = useSetRecoilState(CalformData);
    const selectedEventfilter = useRecoilValue(CalEventsFilter)
    const setSelectedEventfilter = useSetRecoilState(CalEventsFilter);
    const [calEvData, setCalEvData] = useRecoilState(calendarData);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const setRootSubroot = useSetRecoilState(rootSubrootflag);
    const setOpenChildTask = useSetRecoilState(fetchlistApiCall);
    const actualTaskDataValue = useRecoilValue(TaskData);
    const [attendanceByDate, setAttendanceByDate] = useState({});
    const [assigneesByDate, setAssigneesByDate] = useState({});
    const [dailyReportRows, setDailyReportRows] = useState([]);
    const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
    const [attendanceDialogRows, setAttendanceDialogRows] = useState([]);
    const [activeAssignee, setActiveAssignee] = useState(null);
    const [duplicateDialog, setDuplicateDialog] = useState({ open: false, event: null, bulk: false, dateStep: false });
    const [repeatDate, setRepeatDate] = useState(null);
    const [dayDetailOpen, setDayDetailOpen] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState(null);
    const [calendarViewType, setCalendarViewType] = useState('timeGridWeek');
    const [visibleRange, setVisibleRange] = useState({ start: null, end: null });
    const [reportSearch, setReportSearch] = useState('');
    const [contextMenu, setContextMenu] = useState({ mouseX: null, mouseY: null, event: null });
    const [selectedEventIds, setSelectedEventIds] = useState(new Set());
    const [bulkDeleteMenuAnchor, setBulkDeleteMenuAnchor] = useState(null);
    const [repeatLoading, setRepeatLoading] = useState(false);
    const [bulkRepeating, setBulkRepeating] = useState(false);

    // Initialize category filter with all categories so events are visible by default
    useEffect(() => {
        const keys = Object.keys(calendarsColor || {});
        if (keys.length > 0) {
            setSelectedEventfilter((prev) =>
                prev.length === 0 ? keys : prev
            );
        }
    }, [calendarsColor, setSelectedEventfilter]);

    const getEventsForDate = (targetDate) => {
        const d = new Date(targetDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${day}`;
        return filteredEvents.filter(ev => {
            const s = new Date(ev.StartDate);
            const sy = s.getFullYear();
            const sm = String(s.getMonth() + 1).padStart(2, '0');
            const sd = String(s.getDate()).padStart(2, '0');
            return `${sy}-${sm}-${sd}` === dateStr;
        });
    };

    const openDayDetail = (date) => {
        setSelectedDayDate(new Date(date));
        setDayDetailOpen(true);
    };

    const closeDayDetail = () => {
        setDayDetailOpen(false);
        setSelectedDayDate(null);
        setReportSearch('');
    };

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
            const assigneeMaster = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
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
            if (String(t.taskid) === String(targetId)) return t.RootTaskId || t.projectid;
            if (t.subtasks?.length > 0) {
                const res = findModuleRecursively(t.subtasks, targetId);
                if (res) return res;
            }
        }
        return null;
    };

    // Load holiday dates from session storage
    useEffect(() => {
        const loadHolidays = () => {
            try {
                const holidayDataRaw = JSON.parse(sessionStorage.getItem('taskholidayData') || '[]');

                const holidays = holidayDataRaw
                    .filter(holiday => holiday.isdelete !== 1 && holiday.holidaydate)
                    .map(holiday => ({
                        date: holiday.holidaydate.split('T')[0],
                        labelname: holiday.labelname || 'Holiday'
                    }));

                const dates = holidays.map(h => h.date);
                setHolidayDates((prev) =>
                    prev.length === dates.length && prev.every((d, i) => d === dates[i]) ? prev : dates
                );
                setHolidayData((prev) =>
                    prev.length === holidays.length &&
                    prev.every((h, i) => h.date === holidays[i].date && h.labelname === holidays[i].labelname)
                        ? prev
                        : holidays
                );
                return holidays.length > 0;
            } catch (error) {
                console.error('Error loading holiday dates:', error);
                setHolidayDates([]);
                setHolidayData([]);
                return false;
            }
        };

        const hasData = loadHolidays();

        // Master data may still be loading async — retry briefly until it arrives
        let tries = 0;
        const interval = !hasData ? setInterval(() => {
            tries += 1;
            if (loadHolidays() || tries >= 30) {
                clearInterval(interval);
            }
        }, 1000) : null;

        // Re-read on focus/visibility — a holiday may have been added via masters
        const handleFocus = () => loadHolidays();
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') loadHolidays();
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            if (interval) clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
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
                // Defer gotoDate to avoid flushSync warning during lifecycle
                setTimeout(() => {
                    calendarApi.gotoDate(validDate);
                    setTimeout(() => {
                        smoothScrollToTime();
                    }, 300);
                }, 0);
            } else {
                console.error('Invalid date:', date);
            }
        }
    }, [date, calendarApi]);


    const openDuplicateDialog = (event) => {
        // Open straight into the date step — the context menu already offers
        // Edit/Repeat as separate actions, so the Edit-vs-Repeat choice step
        // was just an extra click.
        const evStart = event?.start ?? event?.StartDate;
        setRepeatDate(evStart ? dayjs(evStart) : dayjs());
        setDuplicateDialog({ open: true, event, bulk: false, dateStep: true });
    };

    const closeDuplicateDialog = () => {
        setDuplicateDialog({ open: false, event: null, bulk: false, dateStep: false });
        setRepeatDate(null);
    };

    const handleDuplicate = (event) => {
        openDuplicateDialog(event);
    };

    // Event comments popup - bound to the event's linked taskid
    const [commentAnchorPos, setCommentAnchorPos] = useState(null);
    const [commentEvent, setCommentEvent] = useState(null);

    const openEventComments = (event, mouseEvent) => {
        const details = mapEventDetails(event);
        setCommentEvent({ ...details, taskname: details?.title });
        setCommentAnchorPos({ top: mouseEvent.clientY, left: mouseEvent.clientX });
    };

    const handleCloseCommentMenu = () => {
        setCommentAnchorPos(null);
        setCommentEvent(null);
    };

    const handleViewAllComments = (task) => {
        handleCloseCommentMenu();
        setCalFormData(commentEvent);
        setFormDataValue(commentEvent);
        setRootSubroot({ Task: "meeting" });
        setFormDrawerOpen(true);
    };

    const filterEvents = (events, selectedCalendars) => {
        const hasFilters = Array.isArray(selectedCalendars) && selectedCalendars.length > 0;
        return events?.filter(event => {
            const categoryMatch = !event?.category || !hasFilters || selectedCalendars?.includes(event.category);
            const favoriteMatch = showFavoritesOnly ? Number(event?.isfavourite) === 1 : true;
            return categoryMatch && favoriteMatch;
        }) || [];
    };

    const filteredEvents = filterEvents(calEvData, selectedEventfilter);
    // const filteredEvents = calEvData

    // Month-view daily report: all report rows in the visible month, grouped by date (view only)
    const monthReportGroups = useMemo(() => {
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
    const filteredMonthReportGroups = useMemo(() => {
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
            ismilestone: event?.extendedProps?.ismilestone ?? event?.ismilestone ?? 0,
            isblocker: event?.extendedProps?.isblocker ?? event?.isblocker ?? 0,
            isfavourite: event?.extendedProps?.isfavourite ?? event?.isfavourite ?? 0,
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
            moduleid: event?.extendedProps?.RootTaskId ?? event?.RootTaskId,
            prModule: event?.extendedProps?.prModule ?? {
                taskid: event?.taskid,
                parentid: event?.parentid,
                projectid: event?.projectid,
                taskname: event?.taskname,
                projectname: event?.ProjectName,
                taskPr: event?.ProjectName
            },
            guests: event?.extendedProps?.guests ?? event?.guests ?? [],
            assigneids: (event?.extendedProps?.assigneids ?? event?.assigneids)?.toString()
                ?? event?.extendedProps?.guests?.map(u => u.id)?.join(',')
                ?? '',
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
            isblocker: event?.isblocker,
            isfavourite: event?.isfavourite,
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
            assigneids: event?.assigneids,
            extendedProps: {
                guests: event?.guests,
                assigneids: event?.assigneids,
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
                moduleid: event?.RootTaskId,
                workcategoryid: event?.workcategoryid,
                category: event?.category || '',
                statusid: event?.statusid,
                status: event?.status,
                priorityid: event?.priorityid,
                priority: event?.priority,
                estimate_hrs: event?.estimate_hrs || 0,
                estimate1_hrs: event?.estimate1_hrs || 0,
                estimate2_hrs: event?.estimate2_hrs || 0,
                workinghr: event?.workinghr || 0,
                DeadLineDate: event?.DeadLineDate,
                descr: event?.Desc,
                ismilestone: event?.ismilestone,
                isblocker: event?.isblocker,
                isfavourite: event?.isfavourite,
            },
        })),
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin, bootstrap5Plugin],
        initialView: 'timeGridWeek',
        datesSet: (dateInfo) => {
            setCalendarViewType(dateInfo?.view?.type || '');
            setVisibleRange({
                start: dateInfo?.view?.currentStart || dateInfo?.start || null,
                end: dateInfo?.view?.currentEnd || dateInfo?.end || null,
            });
            if (typeof onCalendarRangeChange !== 'function') return;
            onCalendarRangeChange({
                viewType: dateInfo?.view?.type || '',
                startDate: dateInfo?.view?.currentStart || dateInfo?.start || null,
                endDate: dateInfo?.view?.currentEnd || dateInfo?.end || null,
            });
        },
        scrollTime: '09:15:00',
        scrollTimeReset: false,
        slotMinTime: "07:00:00",
        slotMaxTime: "22:00:00",
        slotDuration: "00:15:00",
        slotLabelInterval: "00:15:00",
        dayCellContent(arg) {
            const holidayLabel = getHolidayLabel(arg.date);
            const isMonthView = arg.view?.type === 'dayGridMonth';
            const dayEvents = isMonthView ? getEventsForDate(arg.date) : [];
            const taskCount = dayEvents.length;

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

            if (isMonthView) {
                const reportKey = toAttendanceDateKey(arg.date, false);
                const report = attendanceByDate[reportKey] || {};
                const hasReport = !!report.checked || !!(report.remark || '').trim();
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
                    `
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
        dayMaxEvents: true,
        moreLinkClick: (info) => {
            openDayDetail(info.date);
            return false;
        },
        moreLinkContent: (arg) => {
            return `+${arg.num} more`;
        },
        navLinks: false,
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
            const isSelected = selectedEventIds.has(String(event.id));
            return [`bg-${colorClass}`, isSelected ? 'fc-event-multi-selected' : ''];
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
                return `(${parseFloat(hours)?.toFixed(2)} ${unit})`;
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
                        <button class="comment-btn" data-event-id="${event.id}" title="Comments">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
                            .comment-btn {
                                position: absolute;
                                top: 2px;
                                right: 40px;
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
                            .calendar-event-container:hover .comment-btn {
                                display: flex;
                            }
                            .comment-btn:hover {
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
            const commentBtn = info.el.querySelector('.comment-btn');
            if (commentBtn) {
                commentBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEventComments(info.event, e);
                });
            }
            info.el.addEventListener('contextmenu', (e) => {
                // Prevent native text selection / overlay on the event element
                e.preventDefault();
                e.stopPropagation();
                // Clear any active browser selection caused by right-click
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                // Remove FullCalendar selection state if present
                info.el.classList.remove('fc-event-selected');
                if (document.activeElement && document.activeElement.blur) {
                    document.activeElement.blur();
                }
                handleContextMenu(e, info.event);
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
            if (info.view.type === 'dayGridMonth') {
                openDayDetail(info.date);
            }
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

        eventClick({ event, jsEvent }) {
            // Prevent opening events on holidays
            if (isHolidayDate(event.start)) {
                toast.warning('Cannot edit events on holidays');
                return;
            }

            // Ctrl/Cmd+Click toggles multi-select
            if (jsEvent?.ctrlKey || jsEvent?.metaKey) {
                jsEvent.preventDefault();
                setSelectedEventIds(prev => {
                    const next = new Set(prev);
                    const eid = event.id;
                    if (next.has(eid)) {
                        next.delete(eid);
                    } else {
                        next.add(eid);
                    }
                    return next;
                });
                return;
            }

            // Normal click: clear multi-select and open edit
            if (selectedEventIds.size > 0) {
                setSelectedEventIds(new Set());
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

            console.log('updatedData',updatedData)

            setCalEvData(updatedData);
            setCalFormData(eventDetails);
            setFormDataValue(eventDetails);
            handleCaleFormSubmit(eventDetails, { skipRefresh: true, context: { end: eventDetails.end } });

            // Trigger UI refresh
            setOpenChildTask(Date.now());
        },

        eventReceive({ event }) {
            if (!event) return;

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

    const handleContextMenu = (e, fcEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const eventDetails = mapEventDetails(fcEvent);
        setContextMenu({
            mouseX: e.clientX,
            mouseY: e.clientY,
            event: eventDetails,
        });
    };

    const handleContextMenuClose = () => {
        setContextMenu({ mouseX: null, mouseY: null, event: null });
        // Clear any lingering browser selection / overlay after menu closes
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    };

    const handleContextEdit = (event) => {
        handleContextMenuClose();
        if (!event) return;
        setCalFormData(event);
        setFormDataValue(event);
        setRootSubroot({ Task: "meeting" });
        setFormDrawerOpen(true);
    };

    const handleContextDelete = (event) => {
        handleContextMenuClose();
        if (!event) return;
        if (handleRemoveEvent) {
            handleRemoveEvent(event);
        }
    };

    const handleContextPermanentDelete = (event) => {
        handleContextMenuClose();
        if (!event) return;
        if (handlePermanentDelete) {
            handlePermanentDelete(event);
        }
    };

    const handleContextMoveToDate = (event) => {
        handleContextMenuClose();
        if (!event) return;
        if (handleIndividualMove) {
            handleIndividualMove(event);
        }
    };

    const handleContextRepeat = (event) => {
        handleContextMenuClose();
        if (!event) return;
        openDuplicateDialog(event);
    };

    // --- Multi-select bulk actions ---
    const selectedEventsData = useMemo(() => {
        if (selectedEventIds.size === 0) return [];
        return calEvData.filter(ev => selectedEventIds.has(String(ev?.meetingid)));
    }, [selectedEventIds, calEvData]);

    const handleClearSelection = () => {
        setSelectedEventIds(new Set());
    };

    const handleBulkDeleteClick = () => {
        if (handleBulkDelete) {
            handleBulkDelete(selectedEventsData);
        }
        handleClearSelection();
    };

    const handleBulkPermanentDeleteClick = () => {
        if (handleBulkPermanentDelete) {
            handleBulkPermanentDelete(selectedEventsData);
        }
        handleClearSelection();
    };

    const handleBulkMoveClick = () => {
        if (handleBulkMoveNextWeek) {
            handleBulkMoveNextWeek(selectedEventsData);
        }
        // Clear selection after passing events to parent
        setSelectedEventIds(new Set());
    };

    const buildDuplicatedEvent = (event, targetDate) => {
        const eventDetails = mapEventDetails(event);
        const now = new Date();
        const parentId = eventDetails?.parentid || eventDetails?.taskid || eventDetails?.meetingid;
        let moduleid = eventDetails?.RootTaskId;
        if (parentId && String(parentId) !== '0') {
            const foundModuleId = findModuleRecursively(actualTaskDataValue, parentId);
            moduleid = foundModuleId || eventDetails?.RootTaskId || eventDetails?.projectid || parentId;
        }

        // When a target date is picked, shift start/end to it while preserving duration
        const duration = Math.max(new Date(eventDetails.end) - new Date(eventDetails.start), 0);
        const newStart = targetDate ? dayjs(targetDate).toISOString() : eventDetails.start;
        const newEnd = targetDate ? dayjs(targetDate).add(duration, 'ms').toISOString() : eventDetails.end;

        // Repeated events always start as Pending — resolve the id from status master data
        const statusData = JSON.parse(
            sessionStorage.getItem('taskstatusData') || localStorage.getItem('taskstatusData') || '[]'
        );
        const pendingStatus = statusData.find(
            (s) => (s?.labelname ?? '').toLowerCase() === 'pending'
        );

        return {
            ...eventDetails,
            meetingid: "",
            // Must NOT carry the source taskid — taskmeetingsave treats a non-zero
            // taskid as an UPDATE, which would wipe the parent's workinghr/status.
            // 0 = insert a fresh task copy (already Pending + workinghr 0 below).
            taskid: 0,
            title: eventDetails.title,
            start: newStart,
            end: newEnd,
            StartDate: newStart,
            EndDate: newEnd,
            entrydate: now.toISOString(),
            DeadLineDate: mergeDateWithTime(eventDetails.DeadLineDate || newEnd),
            repeatflag: "repeat",
            statusid: pendingStatus?.id ?? "",
            status: pendingStatus ? 'Pending' : eventDetails?.status,
            workinghr: 0,
            duplicated: true,
            moduleid: moduleid,
        };
    };

    // Pick a date for all selected events
    const handleBulkRepeatStepClick = () => {
        if (selectedEventsData.length === 0) return;
        setRepeatDate(dayjs().add(7, 'day'));
        setDuplicateDialog({ open: true, event: null, bulk: true, dateStep: true });
    };

    const handleDuplicateRepeat = async () => {
        if (repeatLoading) return;
        const { event } = duplicateDialog;
        if (!repeatDate) {
            toast.error("Please select a date and time");
            return;
        }
        setRepeatLoading(true);
        try {
            const apiRes = await handleCaleFormSubmit(buildDuplicatedEvent(event, repeatDate));
            if (apiRes && apiRes?.rd[0]?.stat == 1) {
                closeDuplicateDialog();
                toast.success("Event repeated successfully");

                // Trigger UI refresh
                setOpenChildTask(Date.now());
            } else {
                toast.error("Error repeating event");
            }
        } finally {
            setRepeatLoading(false);
        }
    };

    // Repeat all multi-selected events — sequential submits, one refresh + toast at the end
    const handleBulkRepeatClick = async () => {
        if (bulkRepeating || selectedEventsData.length === 0) return;
        if (!repeatDate) {
            toast.error("Please select a date and time");
            return;
        }
        setBulkRepeating(true);
        try {
            let successCount = 0;
            for (const ev of selectedEventsData) {
                // Keep each event's own time-of-day on the picked day
                const src = dayjs(ev?.StartDate ?? ev?.start);
                const target = dayjs(repeatDate).hour(src.hour()).minute(src.minute()).second(0).millisecond(0);
                const res = await handleCaleFormSubmit(
                    buildDuplicatedEvent(ev, target),
                    { skipRefresh: true, suppressToast: true }
                );
                if (res?.rd?.[0]?.stat == 1) successCount++;
            }
            if (successCount > 0) {
                onRefreshEvents?.();
                toast.success(`${successCount} event(s) repeated successfully`);
                setOpenChildTask(Date.now());
            }
            if (successCount < selectedEventsData.length) {
                toast.error(`${selectedEventsData.length - successCount} event(s) failed to repeat`);
            }
            closeDuplicateDialog();
            handleClearSelection();
        } finally {
            setBulkRepeating(false);
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

            {/* Duplicate / Repeat Dialog */}
            <Dialog
                open={duplicateDialog.open}
                onClose={() => !(repeatLoading || bulkRepeating) && closeDuplicateDialog()}
                aria-labelledby="duplicate-dialog-title"
                aria-describedby="duplicate-dialog-description"
                className='DRM'
                maxWidth="xs"
                fullWidth
            >
                <div className="dialogIconWrap" style={{ background: 'rgba(115, 103, 240, 0.1)' }}>
                    <span style={{ color: '#7367f0', display: 'flex' }}>
                        <CalendarClock size={28} />
                    </span>
                </div>
                <DialogTitle id="duplicate-dialog-title" className='alert-TitleCl' sx={{ color: '#7367f0', pt: 0 }}>
                    {duplicateDialog.bulk ? 'Repeat Events' : 'Repeat Event'}
                </DialogTitle>
                <DialogContent sx={{ pb: 3 }}>
                    <DialogContentText id="duplicate-dialog-description" className='alert-titleContent' sx={{ mb: 2 }}>
                        {duplicateDialog.bulk
                            ? `Pick a date for ${selectedEventsData.length} selected event(s)`
                            : 'Pick a new date & time for this event'}
                    </DialogContentText>
                    <CustomDateTimePicker
                        name="repeatDate"
                        value={repeatDate}
                        width="100%"
                        textFieldProps={{
                            label: 'New Date & Time',
                            InputLabelProps: { shrink: true },
                            sx: {
                                width: '100%',
                                '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' },
                            },
                        }}
                        onChange={setRepeatDate}
                    />
                </DialogContent>
                <Divider />
                <DialogActions sx={{ px: 2.5, pb: 2, pt: 1.5, gap: 1.5 }}>
                    <Button
                        className='for_DialogBtn cancelDialogBtn'
                        onClick={closeDuplicateDialog}
                        fullWidth
                        disabled={repeatLoading || bulkRepeating}
                    >
                        Cancel
                    </Button>
                    <Button
                        className='for_DialogBtn confirmBtnInfo'
                        onClick={duplicateDialog.bulk ? handleBulkRepeatClick : handleDuplicateRepeat}
                        autoFocus
                        fullWidth
                        disabled={!repeatDate || repeatLoading || bulkRepeating}
                        startIcon={(repeatLoading || bulkRepeating) ? <CircularProgress size={16} /> : null}
                    >
                        {(repeatLoading || bulkRepeating) ? 'Repeating...' : 'Repeat'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Event Comments Popup */}
            <CommentMenuPopup
                anchorPosition={commentAnchorPos}
                open={Boolean(commentAnchorPos)}
                onClose={handleCloseCommentMenu}
                selectedTask={commentEvent}
                onCommentAdded={() => { }}
                onViewAllComments={handleViewAllComments}
            />

            {/* Day Detail Drawer */}
            <Drawer
                anchor="right"
                open={dayDetailOpen}
                onClose={closeDayDetail}
                PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, borderRadius: '12px 0 0 12px' } }}
            >
                {(() => {
                    const dayEvents = selectedDayDate ? getEventsForDate(selectedDayDate) : [];
                    const totalHours = dayEvents.reduce((sum, ev) => sum + (ev.estimate_hrs || 0), 0);
                    const formattedDate = selectedDayDate
                        ? selectedDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                        : '';
                    return (
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700} fontSize="1.1rem">
                                        {formattedDate}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                                        <Chip size="small" label={`${dayEvents.length} tasks`} sx={{ backgroundColor: 'rgba(115,103,240,0.12)', color: '#5a52d5', fontWeight: 600 }} />
                                        {totalHours > 0 && (
                                            <Chip size="small" icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />} label={`${parseFloat(totalHours).toFixed(2)} hrs`} sx={{ backgroundColor: 'rgba(40,199,111,0.12)', color: '#28a745', fontWeight: 600 }} />
                                        )}
                                    </Box>
                                </Box>
                                <IconButton size="small" onClick={closeDayDetail} sx={{ mt: 0.5 }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                                {dayEvents.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                                        No tasks for this day
                                    </Typography>
                                )}
                                <List dense disablePadding>
                                    {dayEvents.map((ev, idx) => {
                                        const statusKey = (ev.status || ev.statusid || '').toString().trim().toLowerCase();
                                        const dynamicStatus = getDynamicStatusColor?.(statusKey);
                                        const fallbackStatus = statusColors?.[statusKey];
                                        const statusBg = dynamicStatus?.backgroundColor || fallbackStatus?.backgroundColor || 'rgba(0,0,0,0.08)';
                                        const statusColor = dynamicStatus?.color || fallbackStatus?.color || '#555';
                                        const catColor = calendarsColor[ev.category] || 'primary';
                                        const categoryColors = {
                                            primary: '#7367f0', success: '#28c76f', error: '#ea5455',
                                            warning: '#ff9f43', info: '#00cfe8', secondary: '#a8aaae',
                                            support: '#8c57ff', dark: '#4b4b4b', productive: '#26c6da',
                                            'rnd-tech': '#5e72e4', creative: '#fb6340', 'sop-correction': '#f5365c',
                                            leave: '#f7fafc', maintenance: '#11cdef', unplanned: '#172b4d',
                                            'customer-maintenance': '#009688', challenges: '#5e72e4', reporting: '#00BCD4',
                                            meeting: '#EC407A', training: '#8C57FF'
                                        };
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
                                                        const eventDetails = {
                                                            meetingid: ev.meetingid,
                                                            title: ev.meetingtitle || ev.title || '',
                                                            start: new Date(ev.StartDate).toISOString(),
                                                            end: new Date(ev.EndDate || ev.StartDate).toISOString(),
                                                            isAllDay: ev.isAllDay ? 1 : 0,
                                                            ismilestone: ev.ismilestone,
                                                            isblocker: ev.isblocker,
                                                            isfavourite: ev.isfavourite,
                                                            descr: ev.Desc || '',
                                                            category: ev.category || '',
                                                            workcategoryid: ev.workcategoryid,
                                                            statusid: ev.statusid,
                                                            status: ev.status,
                                                            priorityid: ev.priorityid,
                                                            priority: ev.priority,
                                                            estimate_hrs: ev.estimate_hrs || 0,
                                                            estimate1_hrs: ev.estimate1_hrs || 0,
                                                            estimate2_hrs: ev.estimate2_hrs || 0,
                                                            workinghr: ev.workinghr || 0,
                                                            DeadLineDate: ev.DeadLineDate,
                                                            taskid: ev.taskid,
                                                            parentid: ev.parentid,
                                                            projectid: ev.projectid,
                                                            moduleid: ev.RootTaskId,
                                                            prModule: {
                                                                taskid: ev.taskid,
                                                                parentid: ev.parentid,
                                                                projectid: ev.projectid,
                                                                taskname: ev.taskname,
                                                                projectname: ev.ProjectName,
                                                                taskPr: ev.ProjectName,
                                                            },
                                                            guests: ev.guests || [],
                                                            assigneids: ev.assigneids ?? (ev.guests || []).map(u => u.id).join(','),
                                                            estimate: ev.estimate || ev.estimate_hrs || 1,
                                                            description: ev.Desc || '',
                                                        };
                                                        setCalFormData(eventDetails);
                                                        setFormDataValue(eventDetails);
                                                        setRootSubroot({ Task: 'meeting' });
                                                        setFormDrawerOpen(true);
                                                        closeDayDetail();
                                                    }}
                                                >
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0, mt: 0.6 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography fontWeight={600} fontSize="0.9rem" noWrap title={ev.meetingtitle || ev.title || ''}>
                                                            {ev.meetingtitle || ev.title || ''}
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
                                </List>

                                {/* Month view — whole-month daily report grouped by date (view only) */}
                                {calendarViewType === 'dayGridMonth' && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Divider sx={{ mb: 1.5 }} />
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
            {/* Floating bulk action bar when multiple events are selected */}
            {selectedEventIds.size > 0 && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1300,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        background: '#fff',
                        borderRadius: '14px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                        padding: '10px 16px',
                    }}
                >
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>
                        {selectedEventIds.size} selected
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <Button
                        size="small"
                        onClick={(e) => setBulkDeleteMenuAnchor(e.currentTarget)}
                        sx={{
                            textTransform: 'capitalize',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#d90429',
                            borderRadius: '10px',
                            padding: '6px 14px',
                            gap: 1,
                            '&:hover': { background: 'rgba(217, 4, 41, 0.08)' },
                        }}
                        startIcon={<Trash2 size={16} />}
                        endIcon={<ChevronDown size={14} />}
                    >
                        Delete
                    </Button>
                    <Menu
                        anchorEl={bulkDeleteMenuAnchor}
                        open={Boolean(bulkDeleteMenuAnchor)}
                        onClose={() => setBulkDeleteMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                minWidth: 240,
                                borderRadius: '12px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                                py: 1,
                                px: 0.5,
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                setBulkDeleteMenuAnchor(null);
                                handleBulkDeleteClick();
                            }}
                            sx={{
                                py: 1.25,
                                px: 1.5,
                                borderRadius: '8px',
                                mx: 0.5,
                                mb: 0.5,
                                '&:hover': { backgroundColor: 'rgba(115, 103, 240, 0.08)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: '#7367f0' }}>
                                <Trash size={18} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Delete All"
                                secondary="Remove from calendar only"
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                                secondaryTypographyProps={{ fontSize: 11, color: '#888' }}
                            />
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setBulkDeleteMenuAnchor(null);
                                handleBulkPermanentDeleteClick();
                            }}
                            sx={{
                                py: 1.25,
                                px: 1.5,
                                borderRadius: '8px',
                                mx: 0.5,
                                color: '#d90429',
                                '&:hover': { backgroundColor: 'rgba(217, 4, 41, 0.08)' },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: '#d90429' }}>
                                <Trash2 size={18} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Permanent Delete"
                                secondary="Delete calendar + task permanently"
                                primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
                                secondaryTypographyProps={{ fontSize: 11, color: '#a3021f' }}
                            />
                        </MenuItem>
                    </Menu>
                    <Button
                        size="small"
                        onClick={handleBulkMoveClick}
                        disabled={bulkRepeating}
                        sx={{
                            textTransform: 'capitalize',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#7367f0',
                            borderRadius: '10px',
                            padding: '6px 14px',
                            gap: 1,
                            '&:hover': { background: 'rgba(115, 103, 240, 0.08)' },
                        }}
                        startIcon={<CalendarClock size={16} />}
                    >
                        Move To
                    </Button>
                    <Button
                        size="small"
                        onClick={handleBulkRepeatStepClick}
                        disabled={bulkRepeating}
                        sx={{
                            textTransform: 'capitalize',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#7367f0',
                            borderRadius: '10px',
                            padding: '6px 14px',
                            gap: 1,
                            '&:hover': { background: 'rgba(115, 103, 240, 0.08)' },
                        }}
                        startIcon={bulkRepeating ? <CircularProgress size={14} /> : <Repeat size={16} />}
                    >
                        {bulkRepeating ? 'Repeating...' : 'Repeat'}
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                    <IconButton size="small" onClick={handleClearSelection} sx={{ color: '#888' }}>
                        <X size={18} />
                    </IconButton>
                </Box>
            )}
            <EventContextMenu
                contextMenu={contextMenu}
                onClose={handleContextMenuClose}
                onEdit={handleContextEdit}
                onDelete={handleContextDelete}
                onPermanentDelete={handleContextPermanentDelete}
                onMoveToDate={handleContextMoveToDate}
                onRepeat={handleContextRepeat}
                showMove={!!handleIndividualMove}
                showPermanentDelete={!!contextMenu?.event?.taskid && !!handlePermanentDelete}
            />
        </>
    );
};

export default Calendar;

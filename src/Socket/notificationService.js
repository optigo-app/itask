import { formatTimeAgo } from '../Utils/globalfun';
import { PMS_EVENTS, emitNotificationSnooze } from './socket';

/**
 * Notification routing:
 *  - tab active  → in-page toast (rendered by SocketListener via react-toastify)
 *  - tab hidden/background → browser Notification API (OS-level popup)
 */

let inPageHandler = null;
let permissionRequested = false;

export const setInPageNotificationHandler = (handler) => {
    inPageHandler = handler;
    return () => {
        if (inPageHandler === handler) inPageHandler = null;
    };
};

export const isPageActive = () =>
    document.visibilityState === 'visible' && document.hasFocus();

export const requestNotificationPermission = () => {
    if (permissionRequested || typeof Notification === 'undefined') return;
    permissionRequested = true;
    if (Notification.permission === 'default') {
        try { Notification.requestPermission(); } catch { }
    }
};

const EVENT_META = {
    [PMS_EVENTS.TASK_ASSIGNED]: { tag: 'Task', eyebrow: 'New Task', color: '#7367f0' },
    [PMS_EVENTS.TASK_UPDATED]: { tag: 'Task', eyebrow: 'Task Updated', color: '#7367f0' },
    [PMS_EVENTS.TASK_DELETED]: { tag: 'Task', eyebrow: 'Task Deleted', color: '#d32f2f' },
    [PMS_EVENTS.TASK_STATUS_CHANGED]: { tag: 'Task', eyebrow: 'Status Changed', color: '#7367f0' },
    [PMS_EVENTS.TASK_COMPLETED]: { tag: 'Task', eyebrow: 'Task Completed', color: '#2e7d32' },
    [PMS_EVENTS.TASK_DUE_SOON]: { tag: 'Deadline', eyebrow: 'Due Soon', color: '#ed6c02' },
    [PMS_EVENTS.TASK_OVERDUE]: { tag: 'Deadline', eyebrow: 'Overdue', color: '#d32f2f' },
    [PMS_EVENTS.DEADLINE_REMINDER]: { tag: 'Deadline', eyebrow: 'Deadline Reminder', color: '#ed6c02' },
    [PMS_EVENTS.PENDING_ACCEPTANCE]: { tag: 'Approval', eyebrow: 'Pending Acceptance', color: '#ed6c02' },
    [PMS_EVENTS.COMMENT_ADDED]: { tag: 'Comment', eyebrow: 'New Comment', color: '#0288d1' },
    [PMS_EVENTS.COMMENT_REPLY]: { tag: 'Comment', eyebrow: 'Reply', color: '#0288d1' },
    [PMS_EVENTS.MENTION]: { tag: 'Mention', eyebrow: 'Mentioned You', color: '#0288d1' },
    [PMS_EVENTS.MEETING_INVITE]: { tag: 'Meeting', eyebrow: 'Meeting Invite', color: '#9c27b0' },
    [PMS_EVENTS.MEETING_UPDATED]: { tag: 'Meeting', eyebrow: 'Meeting Updated', color: '#9c27b0' },
    [PMS_EVENTS.MEETING_REMINDER]: { tag: 'Meeting', eyebrow: 'Meeting Reminder', color: '#9c27b0' },
    [PMS_EVENTS.MEETING_CANCELLED]: { tag: 'Meeting', eyebrow: 'Meeting Cancelled', color: '#d32f2f' },
    [PMS_EVENTS.ESTIMATE_REQUEST]: { tag: 'Estimate', eyebrow: 'Estimate Requested', color: '#ed6c02' },
    [PMS_EVENTS.ESTIMATE_APPROVED]: { tag: 'Estimate', eyebrow: 'Estimate Approved', color: '#2e7d32' },
    [PMS_EVENTS.ESTIMATE_REJECTED]: { tag: 'Estimate', eyebrow: 'Estimate Rejected', color: '#d32f2f' },
    [PMS_EVENTS.BUG_ASSIGNED]: { tag: 'Bug', eyebrow: 'Bug Assigned', color: '#d32f2f' },
    [PMS_EVENTS.BUG_STATUS_CHANGED]: { tag: 'Bug', eyebrow: 'Bug Updated', color: '#d32f2f' },
    [PMS_EVENTS.ANNOUNCEMENT]: { tag: 'Announcement', eyebrow: 'Announcement', color: '#7367f0' },
    [PMS_EVENTS.MODULE_ASSIGNED]: { tag: 'Module', eyebrow: 'Module Assigned', color: '#7367f0' },
    [PMS_EVENTS.DOCUMENT_UPLOADED]: { tag: 'Document', eyebrow: 'New Document', color: '#0288d1' },
    [PMS_EVENTS.DAILY_REPORT_REMINDER]: { tag: 'Report', eyebrow: 'Daily Report', color: '#ed6c02' },
    [PMS_EVENTS.NOTIFICATION]: { tag: 'Info', eyebrow: 'Notification', color: '#7367f0' },
};

const ACTIONABLE_EVENTS = new Set([
    PMS_EVENTS.TASK_ASSIGNED,
    PMS_EVENTS.PENDING_ACCEPTANCE,
    PMS_EVENTS.MEETING_INVITE,
    PMS_EVENTS.ESTIMATE_REQUEST,
]);

let seq = 0;

/**
 * Normalize any server payload into the app's notification shape:
 * { id, eyebrow, title, message, time, tag, color, avatar, hasActions, taskid, event, raw }
 */
export const normalizeNotification = (raw = {}, event) => {
    const meta = EVENT_META[event] || EVENT_META[PMS_EVENTS.NOTIFICATION];
    const title = raw.title || raw.taskname || raw.subject || '';
    return {
        id: raw.id || raw.notificationid || `ntf-${Date.now()}-${++seq}`,
        createdAt: raw.createdAt || Date.now(),
        event,
        eyebrow: raw.eyebrow || meta.eyebrow,
        tag: raw.tag || meta.tag,
        color: raw.color || meta.color,
        title,
        message: raw.message || raw.description || '',
        time: raw.time || (raw.entrydate ? formatTimeAgo(raw.entrydate) : 'Just now'),
        avatar: raw.avatar || raw.from?.avatar || raw.fromName || '',
        taskid: raw.taskid || raw.taskId,
        meetingid: raw.meetingid,
        link: raw.link || '',
        hasActions: raw.hasActions ?? ACTIONABLE_EVENTS.has(event),
        markAsUnread: true,
        raw,
    };
};

const showBrowserNotification = (n) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        // Permission not granted — fall back to in-page so nothing is lost
        inPageHandler?.(n);
        return;
    }
    try {
        const notif = new Notification(n.eyebrow ? `${n.eyebrow} • ${n.tag}` : n.tag, {
            body: [n.title, n.message].filter(Boolean).join('\n'),
            tag: `pms-${n.id}`,
            icon: n.avatar?.startsWith?.('http') ? n.avatar : undefined,
            silent: false,
        });
        notif.onclick = () => {
            window.focus();
            if (n.link) window.location.href = n.link;
            notif.close();
        };
    } catch (e) {
        inPageHandler?.(n);
    }
};

/**
 * Entry point for every incoming notification:
 * page active → in-page toast; hidden/background → OS notification.
 */
export const routeNotification = (raw, event) => {
    const n = normalizeNotification(raw, event);
    if (isPageActive() && inPageHandler) {
        inPageHandler(n);
    } else {
        showBrowserNotification(n);
    }
    return n;
};

export const snoozeNotification = (n, minutes = 30) =>
    emitNotificationSnooze({ id: n.id, taskid: n.taskid, minutes });

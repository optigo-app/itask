import { io } from 'socket.io-client';
import { getSessionToken, getAuthParams } from '../Utils/sessionKeys';
import { getUserProfileData } from '../Utils/globalfun';

const LOCAL_HOSTNAMES = (process.env.REACT_APP_LOCAL_HOSTNAMES || "localhost,nzen").split(',');
const API_ENVIRONMENT = process.env.REACT_APP_API_ENVIRONMENT || "testing";
const isLocal = LOCAL_HOSTNAMES.includes(window.location.hostname);

const DOMAINS = {
    local: process.env.REACT_APP_LOCAL_DOMAIN || "http://newnextjs.web",
    testing: process.env.REACT_APP_TESTING_DOMAIN || "https://nxt03.optigoapps.com",
    live: process.env.REACT_APP_LIVE_DOMAIN || "https://apilx.optigoapps.com",
};

const getSocketURL = () =>
    isLocal ? DOMAINS.local : (DOMAINS[API_ENVIRONMENT] || DOMAINS.testing);

/**
 * Server → client events this app listens for (pms: namespace).
 * Generic 'pms:notification' carries any notification; the specific events
 * below let the server send typed payloads for richer handling.
 */
export const PMS_EVENTS = {
    NOTIFICATION: 'pms:notification',
    TASK_ASSIGNED: 'pms:task_assigned',
    TASK_UPDATED: 'pms:task_updated',
    TASK_DELETED: 'pms:task_deleted',
    TASK_STATUS_CHANGED: 'pms:task_status_changed',
    TASK_COMPLETED: 'pms:task_completed',
    TASK_DUE_SOON: 'pms:task_due_soon',
    TASK_OVERDUE: 'pms:task_overdue',
    DEADLINE_REMINDER: 'pms:deadline_reminder',
    PENDING_ACCEPTANCE: 'pms:pending_acceptance',
    COMMENT_ADDED: 'pms:comment_added',
    COMMENT_REPLY: 'pms:comment_reply',
    MENTION: 'pms:mention',
    MEETING_INVITE: 'pms:meeting_invite',
    MEETING_UPDATED: 'pms:meeting_updated',
    MEETING_REMINDER: 'pms:meeting_reminder',
    MEETING_CANCELLED: 'pms:meeting_cancelled',
    ESTIMATE_REQUEST: 'pms:estimate_request',
    ESTIMATE_APPROVED: 'pms:estimate_approved',
    ESTIMATE_REJECTED: 'pms:estimate_rejected',
    BUG_ASSIGNED: 'pms:bug_assigned',
    BUG_STATUS_CHANGED: 'pms:bug_status_changed',
    ANNOUNCEMENT: 'pms:announcement',
    MODULE_ASSIGNED: 'pms:module_assigned',
    DOCUMENT_UPLOADED: 'pms:document_uploaded',
    DAILY_REPORT_REMINDER: 'pms:daily_report_reminder',
    SESSION_LOGOUT: 'sessionLogout',
    APP_VERSION_UPDATE: 'pms:app_version_update',
};

// Events routed to notification handlers (all except logout/version)
const NOTIFICATION_EVENTS = Object.values(PMS_EVENTS).filter(
    (e) => e !== PMS_EVENTS.SESSION_LOGOUT && e !== PMS_EVENTS.APP_VERSION_UPDATE
);

// Socket state
let socketInstance = null;
let isAuthenticated = false;
let notificationHandlers = new Set();
let sessionLogoutHandlers = new Set();
let appVersionUpdateHandlers = new Set();
let connectionHandlers = new Set();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const dispatchNotification = (event, data) => {
    notificationHandlers.forEach((handler) => {
        try {
            handler(data, event);
        } catch (error) {
            console.error('Error in notification handler:', error);
        }
    });
};

const dispatchAppVersionUpdate = (data) => {
    appVersionUpdateHandlers.forEach((handler) => {
        try {
            handler(data);
        } catch (error) {
            console.error('Error in app version update handler:', error);
        }
    });
};

const dispatchConnection = (connected) => {
    connectionHandlers.forEach((handler) => {
        try {
            handler(connected);
        } catch (error) {
            console.error('Error in connection handler:', error);
        }
    });
};

const buildAuthPayload = () => {
    let auth = {};
    try {
        auth = JSON.parse(getAuthParams() || '{}') || {};
    } catch { }
    const profile = getUserProfileData();
    return {
        token: getSessionToken() || '',
        uid: profile?.id ?? auth?.uid ?? '',
        yc: auth?.yc ?? '',
        sv: auth?.sv ?? '1',
        sp: auth?.sp ?? '6',
    };
};

// Restore connection state if available
const restoreConnection = () => {
    const savedState = sessionStorage.getItem('pmsSocketState');
    if (savedState) {
        try {
            const { token } = JSON.parse(savedState);
            if (token) {
                initializeSocket();
            }
        } catch (e) {
            console.error('Error restoring socket state:', e);
            sessionStorage.removeItem('pmsSocketState');
        }
    }
};

// Initialize on module load
restoreConnection();

/**
 * Initialize socket connection for the current session.
 * Reuses the existing connection when already authenticated.
 */
export function initializeSocket() {
    const authPayload = buildAuthPayload();
    if (authPayload.token) {
        sessionStorage.setItem('pmsSocketState', JSON.stringify({ token: authPayload.token }));
    }
    if (socketInstance?.connected && isAuthenticated) {
        return socketInstance;
    }

    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        isAuthenticated = false;
    }

    socketInstance = io(getSocketURL(), {
        auth: authPayload,
        reconnection: true,
    });

    socketInstance.on('connect', () => {
        isAuthenticated = true;
        reconnectAttempts = 0;
        // Let the server know which user room this socket belongs to
        socketInstance.emit('pms:register', {
            uid: authPayload.uid,
            yc: authPayload.yc,
            sv: authPayload.sv,
            sp: authPayload.sp,
            receiveEvent: 'pms:registered',
        });
        dispatchConnection(true);
    });

    socketInstance.on('disconnect', () => {
        isAuthenticated = false;
        dispatchConnection(false);
    });

    socketInstance.on('connect_error', () => {
        isAuthenticated = false;
    });

    socketInstance.on('reconnect', () => {
        isAuthenticated = true;
    });

    // session logout (server forces this tab to log out)
    socketInstance.on(PMS_EVENTS.SESSION_LOGOUT, (data) => {
        sessionLogoutHandlers.forEach((handler) => {
            try {
                handler(data);
            } catch (error) {
                console.error('Error in session logout handler:', error);
            }
        });
    });

    // Every pms:* notification event funnels into the notification handlers
    NOTIFICATION_EVENTS.forEach((event) => {
        socketInstance.on(event, (data) => dispatchNotification(event, data));
    });

    socketInstance.on(PMS_EVENTS.APP_VERSION_UPDATE, dispatchAppVersionUpdate);

    return socketInstance;
}

export const getSocket = () => socketInstance;

export const isSocketConnected = () => {
    const state = socketInstance?.connected && isAuthenticated;
    if (!state && !socketInstance) {
        const savedState = sessionStorage.getItem('pmsSocketState');
        if (savedState) {
            try {
                const { token } = JSON.parse(savedState);
                if (token && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts++;
                    initializeSocket();
                }
            } catch (e) {
                console.error('Error during reconnection attempt:', e);
            }
        }
    }
    return state;
};

export const isSocketAuthenticated = () => isAuthenticated;

/* ------------------------------- handlers ------------------------------- */

export const addNotificationHandler = (handler) => {
    if (typeof handler === 'function') {
        notificationHandlers.add(handler);
        return () => notificationHandlers.delete(handler);
    }
};

export const addSessionLogoutHandler = (handler) => {
    if (typeof handler === 'function') {
        sessionLogoutHandlers.add(handler);
        return () => sessionLogoutHandlers.delete(handler);
    }
};

export const addAppVersionUpdateHandler = (handler) => {
    if (typeof handler === 'function') {
        appVersionUpdateHandlers.add(handler);
        return () => appVersionUpdateHandlers.delete(handler);
    }
};

export const addConnectionHandler = (handler) => {
    if (typeof handler === 'function') {
        connectionHandlers.add(handler);
        return () => connectionHandlers.delete(handler);
    }
};

/* ------------------------- client → server emits ------------------------ */

export const emitNotificationRead = (payload) => {
    if (!socketInstance) return false;
    socketInstance.emit('pms:notification_read', {
        ...payload,
        receiveEvent: 'pms:notification_read',
    });
    return true;
};

export const emitNotificationReadAll = (payload = {}) => {
    if (!socketInstance) return false;
    socketInstance.emit('pms:notification_read_all', {
        ...payload,
        receiveEvent: 'pms:notification_read_all',
    });
    return true;
};

// "Remind Me Later" — server re-delivers the notification after `minutes`
export const emitNotificationSnooze = (payload) => {
    if (!socketInstance) return false;
    socketInstance.emit('pms:notification_snooze', {
        ...payload,
        receiveEvent: 'pms:notification_snoozed',
    });
    return true;
};

// Actionable notifications — e.g. Mark as Done / Accept / Reject
export const emitNotificationAction = (payload) => {
    if (!socketInstance) return false;
    socketInstance.emit('pms:notification_action', {
        ...payload,
        receiveEvent: 'pms:notification_action',
    });
    return true;
};

export const disconnectSocket = (permanent = false) => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        isAuthenticated = false;
    }
    sessionLogoutHandlers.clear();
    notificationHandlers.clear();
    appVersionUpdateHandlers.clear();
    connectionHandlers.clear();
    if (permanent) {
        sessionStorage.removeItem('pmsSocketState');
    }
};

import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { liveNotificationStack, notificationList, socketConnected } from '../../Recoil/atom';
import { isLoggedInSession, clearSession, getLoginUrl } from '../../Utils/sessionKeys';
import {
    initializeSocket,
    disconnectSocket,
    addNotificationHandler,
    addSessionLogoutHandler,
    addConnectionHandler,
} from '../../Socket/socket';
import {
    routeNotification,
    requestNotificationPermission,
    setInPageNotificationHandler,
} from '../../Socket/notificationService';

const TOAST_TTL_MS = 9000;
const LIST_TTL_MS = 24 * 60 * 60 * 1000; // auto-clear bell items older than 24h

/**
 * Bridges the socket layer into React:
 * - connects the socket while logged in
 * - adds every incoming notification to the bell list (persisted via atom)
 * - routes it: active tab → bottom-right toast, background tab → OS notification
 */
const SocketListener = () => {
    const setNotifications = useSetRecoilState(notificationList);
    const setLiveStack = useSetRecoilState(liveNotificationStack);
    const setConnected = useSetRecoilState(socketConnected);

    useEffect(() => {
        if (!isLoggedInSession()) return undefined;

        initializeSocket();
        requestNotificationPermission();

        const offConnection = addConnectionHandler(setConnected);

        const offInPage = setInPageNotificationHandler((n) => {
            setLiveStack((prev) =>
                [{ ...n, expiresAt: Date.now() + TOAST_TTL_MS }, ...prev].slice(0, 8)
            );
        });

        const offNotify = addNotificationHandler((data, event) => {
            const n = routeNotification(data, event);
            setNotifications((prev) => [n, ...prev].slice(0, 100));
        });

        // Auto-clear: prune bell notifications past their TTL (runs every minute)
        const pruneTimer = setInterval(() => {
            const cutoff = Date.now() - LIST_TTL_MS;
            setNotifications((prev) => {
                const next = prev.filter((n) => !n.createdAt || n.createdAt > cutoff);
                return next.length === prev.length ? prev : next;
            });
        }, 60 * 1000);

        const offLogout = addSessionLogoutHandler(() => {
            disconnectSocket(true);
            clearSession();
            window.location.href = getLoginUrl();
        });

        return () => {
            clearInterval(pruneTimer);
            offConnection();
            offInPage();
            offNotify();
            offLogout();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
};

export default SocketListener;

/**
 * Cross-tab sync via BroadcastChannel (+ storage-event fallback).
 * Used to propagate logout to every open tab of the app.
 */
import Cookies from 'js-cookie';

const CHANNEL_NAME = 'itask_tab_sync';
const LOGOUT_MARKER_KEY = '__itask_logout__';

let channel = null;
let handlingPeerLogout = false;

const getChannel = () => {
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      channel = null;
    }
  }
  return channel;
};

export const getLoginUrl = () =>
  (process.env.REACT_APP_LOCAL_HOSTNAMES || "").includes(window.location.hostname)
    ? "itaskweb/login"
    : "/login";

/** Call inside the logout flow — notifies all other open tabs. */
export const broadcastLogout = () => {
  try { getChannel()?.postMessage({ type: 'logout' }); } catch { }
  // Fallback for browsers without BroadcastChannel (storage events fire cross-tab)
  try { localStorage.setItem(LOGOUT_MARKER_KEY, String(Date.now())); } catch { }
};

const handlePeerLogout = () => {
  if (handlingPeerLogout) return;
  handlingPeerLogout = true;
  try { localStorage.clear(); } catch { }
  try { sessionStorage.clear(); } catch { }
  try { Cookies.remove('isLoggedIn'); } catch { }
  try { Cookies.remove('skey'); } catch { }
  window.location.href = getLoginUrl();
};

/** Mount once at app root — listens for logout broadcast from other tabs. */
export const initTabSyncListener = () => {
  const ch = getChannel();
  if (ch) {
    ch.onmessage = (e) => {
      if (e?.data?.type === 'logout') handlePeerLogout();
    };
  }
  window.addEventListener('storage', (e) => {
    if (e.key === LOGOUT_MARKER_KEY && e.newValue) {
      handlePeerLogout();
    }
  });
};

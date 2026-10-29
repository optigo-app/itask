/**
 * Per-tab session helpers.
 *
 * The `skey` cookie is shared across every tab of the origin — the last login
 * wins for any tab that re-reads it (refresh, new init). To keep each tab's
 * session independent, the token is pinned into sessionStorage (which is
 * unique per tab) on first read. All session-scoped data uses sessionStorage
 * first; localStorage is only a remember-me seed.
 */
import Cookies from 'js-cookie';

export const SESSION_SKEY = 'skey';
export const SESSION_IS_LOGGED_IN = 'isLoggedIn';
export const AUTH_PARAMS_KEY = 'AuthqueryParams';

export const getLoginUrl = () =>
  (process.env.REACT_APP_LOCAL_HOSTNAMES || "").includes(window.location.hostname)
    ? "itaskweb/login"
    : "/login";

/** This tab's session token — pinned copy wins over the shared cookie. */
export const getSessionToken = () => {
  try {
    return sessionStorage.getItem(SESSION_SKEY) || Cookies.get(SESSION_SKEY);
  } catch {
    return Cookies.get(SESSION_SKEY);
  }
};

/** Pin the token into this tab's sessionStorage so other tabs can't change it. */
export const pinSessionToken = (token) => {
  try { sessionStorage.setItem(SESSION_SKEY, token); } catch { }
};

/**
 * Session-scoped auth payload — this tab's copy wins, remember-me seed second.
 * A localStorage seed is copied into sessionStorage on first read so this tab
 * stays pinned even if another tab's login overwrites the shared seed later.
 */
export const getAuthParams = () => {
  try {
    const sessionVal = sessionStorage.getItem(AUTH_PARAMS_KEY);
    if (sessionVal) return sessionVal;
    const localVal = localStorage.getItem(AUTH_PARAMS_KEY);
    if (localVal) sessionStorage.setItem(AUTH_PARAMS_KEY, localVal);
    return localVal;
  } catch {
    return localStorage.getItem(AUTH_PARAMS_KEY);
  }
};

export const setAuthParams = (json) => {
  try { sessionStorage.setItem(AUTH_PARAMS_KEY, json); } catch { }
};

export const isLoggedInSession = () => {
  try {
    return sessionStorage.getItem(SESSION_IS_LOGGED_IN) === 'true' ||
      Cookies.get(SESSION_IS_LOGGED_IN) === 'true';
  } catch {
    return Cookies.get(SESSION_IS_LOGGED_IN) === 'true';
  }
};

export const markLoggedIn = () => {
  try { sessionStorage.setItem(SESSION_IS_LOGGED_IN, 'true'); } catch { }
};

/** Clear this tab's session + the shared auth keys. */
export const clearSession = () => {
  try { sessionStorage.clear(); } catch { }
  try { localStorage.removeItem(AUTH_PARAMS_KEY); } catch { }
  try { localStorage.removeItem(SESSION_IS_LOGGED_IN); } catch { }
  try { Cookies.remove(SESSION_IS_LOGGED_IN); } catch { }
  try { Cookies.remove(SESSION_SKEY); } catch { }
};

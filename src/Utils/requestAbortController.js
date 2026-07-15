/**
 * Global AbortController for cancelling in-flight API requests.
 * Call abortAllRequests() before logout/redirect to prevent stale
 * responses from freezing the UI or updating unmounted components.
 */

let controller = new AbortController();
let isShuttingDown = false;
const timeoutIds = new Set();
const intervalIds = new Set();

// Track all setTimeout / setInterval so we can clear them on logout
const originalSetTimeout = window.setTimeout;
const originalSetInterval = window.setInterval;
const originalClearTimeout = window.clearTimeout;
const originalClearInterval = window.clearInterval;

window.setTimeout = (callback, delay, ...args) => {
  const id = originalSetTimeout.call(window, callback, delay, ...args);
  timeoutIds.add(id);
  return id;
};

window.setInterval = (callback, delay, ...args) => {
  const id = originalSetInterval.call(window, callback, delay, ...args);
  intervalIds.add(id);
  return id;
};

window.clearTimeout = (id) => {
  timeoutIds.delete(id);
  originalClearTimeout.call(window, id);
};

window.clearInterval = (id) => {
  intervalIds.delete(id);
  originalClearInterval.call(window, id);
};

export const getAbortSignal = () => controller.signal;

export const getIsShuttingDown = () => isShuttingDown;

export const abortAllRequests = () => {
  isShuttingDown = true;
  controller.abort();

  // Kill all pending timeouts and intervals
  timeoutIds.forEach((id) => originalClearTimeout.call(window, id));
  intervalIds.forEach((id) => originalClearInterval.call(window, id));
  timeoutIds.clear();
  intervalIds.clear();

  // Create a fresh controller for subsequent requests
  controller = new AbortController();
};

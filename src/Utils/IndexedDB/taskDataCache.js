/**
 * IndexedDB Cache for Large Task Datasets
 * Stores 10k-20k+ records per tab without sessionStorage quota limits.
 * Uses native IndexedDB with promise-based API.
 */

const DB_NAME = 'ITaskDataCache';
const DB_VERSION = 1;
const STORE_NAME = 'tabTaskData';

let dbPromise = null;

const openDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'cacheKey' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('tabId', 'tabId', { unique: false });
      }
    };
  });

  return dbPromise;
};

/**
 * Generate a deterministic cache key from query parameters.
 * This ensures the same project/filter combination always maps to the same cache entry.
 */
export const generateCacheKey = (queryData, archivedFlag, completedFlag) => {
  const payload = {
    project: queryData?.project || null,
    projectid: queryData?.projectid || null,
    moduleid: queryData?.moduleid || null,
    maingroupids: queryData?.maingroupids || null,
    isLimited: queryData?.isLimited || false,
    isreadonly: queryData?.isreadonly || null,
    archivedFlag: !!archivedFlag,
    completedFlag: !!completedFlag,
  };
  return `taskdata_${btoa(JSON.stringify(payload)).replace(/[^a-zA-Z0-9]/g, '')}`;
};

/**
 * Store formatted task data for a specific tab/query combination.
 * @param {string} tabId - The tab identifier
 * @param {string} cacheKey - Deterministic cache key
 * @param {Object} data - { taskFinalData, categorySummary, archiveTasks, actualData, masterData }
 */
export const setTabDataCache = async (tabId, cacheKey, data) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const entry = {
      cacheKey,
      tabId,
      timestamp: Date.now(),
      data,
    };

    await new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Cleanup old entries (keep last 50 per tab to prevent unbounded growth)
    await cleanupOldEntries(tabId, 50);

    return true;
  } catch (err) {
    console.error('[IndexedDB] Failed to store tab data:', err);
    return false;
  }
};

/**
 * Retrieve cached task data by cache key.
 * @param {string} cacheKey
 * @returns {Object|null} Cached data or null
 */
export const getTabDataCache = async (cacheKey) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const entry = await new Promise((resolve, reject) => {
      const request = store.get(cacheKey);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!entry) return null;

    // Check if cache is older than 24 hours (stale)
    const maxAge = 24 * 60 * 60 * 1000;
    const isStale = Date.now() - entry.timestamp > maxAge;

    return {
      data: entry.data,
      isStale,
      cachedAt: entry.timestamp,
    };
  } catch (err) {
    console.error('[IndexedDB] Failed to retrieve tab data:', err);
    return null;
  }
};

/**
 * Remove cache entries for a specific tab (e.g., on tab close).
 */
export const removeTabDataCache = async (tabId) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('tabId');

    const entries = await new Promise((resolve, reject) => {
      const request = index.getAll(tabId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await Promise.all(
      entries.map((entry) =>
        new Promise((resolve, reject) => {
          const req = store.delete(entry.cacheKey);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        })
      )
    );

    return true;
  } catch (err) {
    console.error('[IndexedDB] Failed to remove tab data:', err);
    return false;
  }
};

/**
 * Clear all cached task data.
 */
export const clearAllTabDataCache = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    return true;
  } catch (err) {
    console.error('[IndexedDB] Failed to clear cache:', err);
    return false;
  }
};

/**
 * Cleanup old entries for a tab, keeping only the N most recent.
 */
const cleanupOldEntries = async (tabId, keepCount) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('tabId');

    const entries = await new Promise((resolve, reject) => {
      const request = index.getAll(tabId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (entries.length <= keepCount) return;

    // Sort by timestamp descending, delete older ones
    const sorted = entries.sort((a, b) => b.timestamp - a.timestamp);
    const toDelete = sorted.slice(keepCount);

    await Promise.all(
      toDelete.map((entry) =>
        new Promise((resolve, reject) => {
          const req = store.delete(entry.cacheKey);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        })
      )
    );
  } catch (err) {
    console.error('[IndexedDB] Cleanup failed:', err);
  }
};

/**
 * Get cache stats for debugging.
 */
export const getCacheStats = async () => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const count = await new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const entries = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const totalSize = entries.reduce((sum, entry) => {
      return sum + JSON.stringify(entry.data).length * 2; // rough bytes estimate
    }, 0);

    return { count, totalSize, entries: entries.map((e) => e.cacheKey) };
  } catch (err) {
    return { count: 0, totalSize: 0, entries: [] };
  }
};

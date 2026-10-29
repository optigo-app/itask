import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

const generateTabId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const defaultTaskTabState = {
  // mirrors Advfilters shape
  filters: {
    category: [],
    searchTerm: '',
    status: '',
    priority: '',
    department: '',
    assignee: '',
    project: '',
    dueDate: null,
    startDate: null,
  },
  viewMode: 'me',
  activeButton: 'table',
  page: 1,
  rowsPerPage: 100,
  order: 'desc',
  orderBy: 'entrydate',
  showFavoritesOnly: false,
  showMilestonesOnly: false,
  completedFlag: false,
  archivedFlag: false,
  // cached data
  tasks: [],
  categorySummary: [],
  archiveTasks: [],
  actualData: [],
  taskFinalData: null,
  dataLoaded: false,
  // UI
  localTaskEdits: {},
  selectedRow: null,
  scrollTop: 0,
};

export const useTabStore = create(
  devtools(
    persist(
      (set, get) => ({
        // registry
      tabs: [],
      activeTabId: null,
      maxTabs: 10,

      // tab limit dialog
      tabLimitDialogOpen: false,
      pendingTabPayload: null,

      // state buckets keyed by tabId
      tabState: {},

      // non-persisted refresh callback registered by Task.jsx
      _tabRefreshFn: null,
      setTabRefreshFn: (fn) => set({ _tabRefreshFn: fn }),
      triggerTabRefresh: () => {
        const fn = get()._tabRefreshFn;
        if (typeof fn === 'function') fn();
      },

      // ─── Actions ───

      openTaskTab: (payload) => {
        const { title, route = '/tasks', queryData = null, tabname = null } = payload;
        const tabs = get().tabs;
        const maxTabs = get().maxTabs;

        // If tabname is provided, deduplicate by tabname — only one tab
        // with that name can exist at a time (e.g. 'bugtrack').
        // Otherwise, fall back to comparing core IDs (taskid/moduleid/projectid).
        const existing = tabname
          ? tabs.find((t) => t.tabname === tabname)
          : tabs.find(
              (t) =>
                t.route === route &&
                t.queryData?.taskid === queryData?.taskid &&
                t.queryData?.moduleid === queryData?.moduleid &&
                t.queryData?.projectid === queryData?.projectid
            );

        if (existing) {
          // Re-open with a new deep-link search: merge queryData so the mounted
          // Task sees the new searchtask (existing filters are preserved).
          if (queryData?.searchtask && existing.queryData?.searchtask !== queryData.searchtask) {
            set((state) => ({
              tabs: state.tabs.map((t) =>
                t.id === existing.id ? { ...t, queryData: { ...t.queryData, ...queryData } } : t
              ),
            }));
          }
          set({ activeTabId: existing.id });
          return existing.id;
        }

        // if at max tabs, store payload and open dialog
        if (tabs.length >= maxTabs) {
          set({
            tabLimitDialogOpen: true,
            pendingTabPayload: payload,
          });
          return null;
        }

        const id = generateTabId();
        const newTab = { id, title, route, queryData, tabname, createdAt: Date.now() };

        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
          tabState: {
            ...state.tabState,
            [id]: {
              ...defaultTaskTabState,
              queryData,
            },
          },
        }));
        return id;
      },

      confirmReplaceTab: (tabIdsToClose) => {
        const state = get();
        const payload = state.pendingTabPayload;
        if (!payload) return;

        // close selected tab(s)
        const idsToClose = Array.isArray(tabIdsToClose) ? tabIdsToClose : [tabIdsToClose];
        const filtered = state.tabs.filter((t) => !idsToClose.includes(t.id));
        const nextTabState = { ...state.tabState };
        idsToClose.forEach((id) => delete nextTabState[id]);

        let nextActive = state.activeTabId;
        if (idsToClose.includes(state.activeTabId)) {
          nextActive = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
        }

        const id = generateTabId();
        const newTab = { id, title: payload.title, route: payload.route, queryData: payload.queryData, tabname: payload.tabname, createdAt: Date.now() };

        set({
          tabs: [...filtered, newTab],
          activeTabId: id,
          tabState: {
            ...nextTabState,
            [id]: {
              ...defaultTaskTabState,
              queryData: payload.queryData,
            },
          },
          tabLimitDialogOpen: false,
          pendingTabPayload: null,
        });
        return id;
      },

      cancelReplaceTab: () => {
        set({ tabLimitDialogOpen: false, pendingTabPayload: null });
      },

      setActiveTab: (id) => {
        set({ activeTabId: id });
      },

      closeTab: (id) => {
        const state = get();
        const filtered = state.tabs.filter((t) => t.id !== id);
        const nextTabState = { ...state.tabState };
        delete nextTabState[id];

        let nextActive = state.activeTabId;
        if (state.activeTabId === id) {
          nextActive = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
        }

        set({
          tabs: filtered,
          activeTabId: nextActive,
          tabState: nextTabState,
        });

        // If we freed up space and there's a pending tab, auto-open it
        if (state.pendingTabPayload && filtered.length < state.maxTabs) {
          get().openTaskTab(state.pendingTabPayload);
          set({ tabLimitDialogOpen: false, pendingTabPayload: null });
        }
      },

      closeTabsToLeft: (id) => {
        const state = get();
        const idx = state.tabs.findIndex((t) => t.id === id);
        if (idx === -1) return;
        const idsToClose = state.tabs.slice(0, idx).map((t) => t.id);
        if (idsToClose.length === 0) return;

        const filtered = state.tabs.filter((t) => !idsToClose.includes(t.id));
        const nextTabState = { ...state.tabState };
        idsToClose.forEach((tid) => delete nextTabState[tid]);

        let nextActive = state.activeTabId;
        if (idsToClose.includes(state.activeTabId)) {
          nextActive = id;
        }

        set({ tabs: filtered, activeTabId: nextActive, tabState: nextTabState });
      },

      closeTabsToRight: (id) => {
        const state = get();
        const idx = state.tabs.findIndex((t) => t.id === id);
        if (idx === -1) return;
        const idsToClose = state.tabs.slice(idx + 1).map((t) => t.id);
        if (idsToClose.length === 0) return;

        const filtered = state.tabs.filter((t) => !idsToClose.includes(t.id));
        const nextTabState = { ...state.tabState };
        idsToClose.forEach((tid) => delete nextTabState[tid]);

        let nextActive = state.activeTabId;
        if (idsToClose.includes(state.activeTabId)) {
          nextActive = id;
        }

        set({ tabs: filtered, activeTabId: nextActive, tabState: nextTabState });
      },

      closeOtherTabs: (id) => {
        const state = get();
        const idsToClose = state.tabs.filter((t) => t.id !== id).map((t) => t.id);
        if (idsToClose.length === 0) return;

        const filtered = state.tabs.filter((t) => t.id === id);
        const nextTabState = { ...state.tabState };
        idsToClose.forEach((tid) => delete nextTabState[tid]);

        set({ tabs: filtered, activeTabId: id, tabState: nextTabState });
      },

      closeAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
          tabState: {},
        });
      },

      // scoped update: only touches one tab's bucket
      updateTabState: (tabId, updater) => {
        set((state) => {
          const current = state.tabState[tabId] || defaultTaskTabState;
          const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
          return {
            tabState: {
              ...state.tabState,
              [tabId]: next,
            },
          };
        });
      },

      getTabState: (tabId) => {
        return get().tabState[tabId] || defaultTaskTabState;
      },

      // data cache helpers
      setTabDataLoaded: (tabId, data) => {
        get().updateTabState(tabId, {
          tasks: data.tasks ?? [],
          categorySummary: data.categorySummary ?? [],
          archiveTasks: data.archiveTasks ?? [],
          actualData: data.actualData ?? [],
          taskFinalData: data.taskFinalData ?? null,
          dataLoaded: true,
        });
      },

      setTabScroll: (tabId, scrollTop) => {
        get().updateTabState(tabId, { scrollTop });
      },

      clearAllTabs: () => {
        set({
          tabs: [],
          activeTabId: null,
          tabState: {},
          tabLimitDialogOpen: false,
          pendingTabPayload: null,
        });
      },
    }),
    {
      name: 'itask-tabs-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => {
        const prunedTabState = {};
        if (state.tabState) {
          Object.keys(state.tabState).forEach((tabId) => {
            const current = state.tabState[tabId];
            if (current) {
              prunedTabState[tabId] = {
                filters: current.filters,
                viewMode: current.viewMode,
                activeButton: current.activeButton,
                page: current.page,
                rowsPerPage: current.rowsPerPage,
                order: current.order,
                orderBy: current.orderBy,
                showFavoritesOnly: current.showFavoritesOnly,
                showMilestonesOnly: current.showMilestonesOnly,
                completedFlag: current.completedFlag,
                archivedFlag: current.archivedFlag,
                queryData: current.queryData,
                scrollTop: current.scrollTop,
                dataLoaded: current.dataLoaded,
              };
            }
          });
        }
        return {
          tabs: state.tabs.map((t) => ({ ...t, tabname: t.tabname || null })),
          activeTabId: state.activeTabId,
          tabState: prunedTabState,
        };
      },
    }
  ),
  { name: 'TaskTabStore' }
 )
);

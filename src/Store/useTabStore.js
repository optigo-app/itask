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
  order: 'asc',
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

      // ─── Actions ───

      openTaskTab: (payload) => {
        const { title, route = '/tasks', queryData = null } = payload;
        const tabs = get().tabs;
        const maxTabs = get().maxTabs;

        // check if same queryData already open
        const existing = tabs.find(
          (t) =>
            t.route === route &&
            JSON.stringify(t.queryData) === JSON.stringify(queryData)
        );

        if (existing) {
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
        const newTab = { id, title, route, queryData, createdAt: Date.now() };

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
        const newTab = { id, title: payload.title, route: payload.route, queryData: payload.queryData, createdAt: Date.now() };

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
          tabs: state.tabs,
          activeTabId: state.activeTabId,
          tabState: prunedTabState,
        };
      },
    }
  ),
  { name: 'TaskTabStore' }
 )
);

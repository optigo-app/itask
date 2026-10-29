import { atom } from "recoil";
import { getSessionToken } from "../Utils/sessionKeys";

export const FullSidebar = atom({
  key: 'FullSidebar',
  default: true
})

export const userRoleAtom = atom({
  key: "userRole",
  default: null, // e.g., 'admin', 'team_lead', 'user'
});

export const webReload = atom({
  key: "webReload",
  default: false,
});

export const viewMode = atom({
  key: 'viewMode',
  default: "me"
})

export const actualTaskData = atom({
  key: 'actualTaskData',
  default: []
})

export const TaskData = atom({
  key: 'TaskData',
  default: []
})

export const completedTask = atom({
  key: 'completedTask',
  default: false
})

export const archivedTask = atom({
  key: 'archivedTask',
  default: false
})

export const projectDatasRState = atom({
  key: 'projectDatasRState',
  default: []
})

export const taskLength = atom({
  key: 'taskLength',
  default: 0
})

export const Advfilters = atom({
  key: 'Advfilters',
  default: {
    category: [],
    searchTerm: '',
    status: '',
    priority: '',
    department: '',
    assignee: '',
    project: '',
    dueDate: null,
    startDate: null,
  }
})

export const openFormDrawer = atom({
  key: 'openFormDrawer',
  default: false
})

export const filterDrawer = atom({
  key: 'filterDrawer',
  default: false
})

// Inline filter-bar visibility — toggled by the funnel icon; independent of
// the right-side filter drawer (filterDrawer).
export const filterBarOpen = atom({
  key: 'filterBarOpen',
  default: false
})

export const exportDynamicFilterExcel = atom({
  key: 'exportDynamicFilterExcel',
  default: 0
})

export const exportDynamicFilterLoading = atom({
  key: 'exportDynamicFilterLoading',
  default: false
})

export const formData = atom({
  key: 'formData',
  default: {}
})

export const assigneeId = atom({
  key: 'assigneeId',
  default: ""
})

export const taskActionMode = atom({
  key: 'taskActionMode',
  default: ''
})

export const masterDataValue = atom({
  key: 'masterDataValue',
  default: []
})

export const rootSubrootflag = atom({
  key: 'rootSubrootflag',
  default: {}
})

export const calendarSideBarOpen = atom({
  key: 'calendarSideBarOpen',
  default: false
})

export const fetchlistApiCall = atom({
  key: 'fetchlistApiCall',
  default: null
})

export const selectedRowData = atom({
  key: 'selectedRowData',
  default: {}
})

export const copyRowData = atom({
  key: 'copyRowData',
  default: {}
})

export const selectedCategoryAtom = atom({
  key: 'selectedCategoryAtom',
  default: []
})

export const calendarData = atom({
  key: 'calendarData',
  default: []
})

export const calendarM = atom({
  key: 'calendarM',
  default: {}
})

export const CalformData = atom({
  key: 'CalformData',
  default: []
})

export const CalEventsFilter = atom({
  key: 'CalEventsFilter',
  default: []
})

export const Calevent = atom({
  key: 'Calevent',
  default: null
})

export const CaleContext = atom({
  key: 'CaleContext',
  default: null
})

export const timerCompOpen = atom({
  key: 'timerCompOpen',
  default: false
})

export const dynamicFilterDrawer = atom({
  key: 'dynamicFilterDrawer',
  default: false
})

// Real-time socket notifications — newest first.
// Persisted to localStorage (keyed per session token) so the bell list
// survives refresh until notifications are stored API-side.
const NOTIF_STORE_LIMIT = 100;
const notificationStoreKey = () =>
  `pms_notifications_${(getSessionToken() || 'anon').slice(0, 40)}`;

export const notificationList = atom({
  key: 'notificationList',
  default: [],
  effects: [
    ({ setSelf, onSet }) => {
      try {
        const stored = localStorage.getItem(notificationStoreKey());
        if (stored) setSelf(JSON.parse(stored));
      } catch { }
      onSet((newValue) => {
        try {
          localStorage.setItem(
            notificationStoreKey(),
            JSON.stringify((newValue || []).slice(0, NOTIF_STORE_LIMIT))
          );
        } catch { }
      });
    },
  ],
})

export const socketConnected = atom({
  key: 'socketConnected',
  default: false
})

// Ephemeral in-page toast stack — newest first, auto-expires, not persisted
export const liveNotificationStack = atom({
  key: 'liveNotificationStack',
  default: []
})









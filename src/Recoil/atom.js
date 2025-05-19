import { atom } from "recoil";

export const userRoleAtom = atom({
  key: "userRole",
  default: null, // e.g., 'admin', 'team_lead', 'user'
});

export const webReload = atom({
  key: "webReload",
  default: false,
});

export const TaskData = atom({
  key: 'TaskData',
  default: []
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

export const timerCompOpen = atom({
  key: 'timerCompOpen',
  default: false
})







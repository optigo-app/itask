import { atom } from "recoil";

export const openFormDrawer = atom({
  key: 'openFormDrawer',
  default: false
})

export const formData = atom({
  key: 'formData',
  default: {}
})

export const TaskData = atom({
  key: 'TaskData',
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
  default: true
})

export const selectedRowData = atom({
  key: 'selectedRowData',
  default: {}
})

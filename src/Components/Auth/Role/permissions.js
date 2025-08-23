// constants/permissions.js
export const ROLES = {
    ADMIN: "admin",
    TEAM_LEAD: "team_lead",
    USER: "user",
  };
  
  export const PERMISSIONS = {
    canAddPrModule: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canLockPrModule: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canPrModuleDelete: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canEdit: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canEditPrLock: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canChangeStatus: [ROLES.ADMIN],
    CALENDAR_A_DROPDOWN: [ROLES.ADMIN],
    CALENDAR_VIEW_ALL: [ROLES.ADMIN],
    MEETING_VIEW_ALL: [ROLES.ADMIN],
  };
  
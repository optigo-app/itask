// constants/permissions.js
export const ROLES = {
    ADMIN: "admin",
    TEAM_LEAD: "team_lead",
    USER: "user",
  };
  
  export const PERMISSIONS = {
    canEdit: [ROLES.ADMIN, ROLES.TEAM_LEAD],
    canChangeStatus: [ROLES.ADMIN],
    canDelete: [ROLES.ADMIN],
  };
  
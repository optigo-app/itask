// Environment variables
const LOCAL_HOSTNAMES = (process.env.REACT_APP_LOCAL_HOSTNAMES || "localhost,nzen").split(',');
const API_VERSION = process.env.REACT_APP_API_VERSION || "v4";
const API_ENVIRONMENT = process.env.REACT_APP_API_ENVIRONMENT || "testing";
const REPORT_ENDPOINT = process.env.REACT_APP_REPORT_ENDPOINT || "/api/report";
const UPLOAD_ENDPOINT = process.env.REACT_APP_UPLOAD_ENDPOINT || "/api/upload";
const REMOVE_FILE_ENDPOINT = process.env.REACT_APP_REMOVE_FILE_ENDPOINT || "/api/removefile";

// Domain configuration
const DOMAINS = {
  local: process.env.REACT_APP_LOCAL_DOMAIN || "http://newnextjs.web",
  testing: process.env.REACT_APP_TESTING_DOMAIN || "https://nxt03.optigoapps.com",
  live: process.env.REACT_APP_LIVE_DOMAIN || "https://apilx.optigoapps.com",
  backup_live: process.env.REACT_APP_BACKUP_LIVE_DOMAIN || "https://livenx.optigoapps.com"
};

const isLocal = LOCAL_HOSTNAMES.includes(window.location.hostname);

// Get current domain based on environment
const getCurrentDomain = () => {
  if (isLocal) {
    return DOMAINS.local;
  }
  return DOMAINS[API_ENVIRONMENT] || DOMAINS.testing;
};

// Build API URLs
const buildApiUrl = (endpoint) => {
  return getCurrentDomain() + endpoint;
};

export const APIURL = buildApiUrl(REPORT_ENDPOINT);
export const UPLOAD_URL = buildApiUrl(UPLOAD_ENDPOINT);
export const REMOVE_FILE_URL = buildApiUrl(REMOVE_FILE_ENDPOINT);

// Utility function to get AuthData from both localStorage and sessionStorage
const getAuthData = () => {
    try {
        const authData = localStorage.getItem("AuthqueryParams") || sessionStorage.getItem("AuthqueryParams");
        return authData ? JSON.parse(authData) : null;
    } catch (error) {
        console.error("Error parsing AuthData:", error);
        return null;
    }
};

export const getHeaders = (init = {}) => {
  const { version = API_VERSION, token = "" } = init;
  const AuthData = getAuthData();

  return {
    Authorization: `Bearer ${token}`,
    Yearcode: AuthData?.yc ?? "",
    Version: version,
    sv: AuthData?.sv ?? "1",
    sp: "6",
  };
};

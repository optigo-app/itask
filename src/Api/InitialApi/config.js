import { DeviceInfo } from "../../Utils/globalfun";
import Cookies from 'js-cookie';

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

let cachedDeviceInfoPromise = null;
let cachedDtHeader = "";
let cachedSessionDeviceToken = null;

const toBase64Utf8 = (value) => {
  try {
    return btoa(unescape(encodeURIComponent(value)));
  } catch (error) {
    console.error("Error encoding base64:", error);
    return "";
  }
};

export const getHeaders = async (init = {}, options = {}) => {
  const getsessiondt = sessionStorage.getItem("dt") || "";

  if (cachedSessionDeviceToken !== getsessiondt || !cachedDtHeader) {
    cachedSessionDeviceToken = getsessiondt;
    cachedDeviceInfoPromise = cachedDeviceInfoPromise || DeviceInfo();

    try {
      const deviceInfo = await cachedDeviceInfoPromise;
      cachedDtHeader = toBase64Utf8(
        JSON.stringify({ ...(deviceInfo || {}), DeviceToken: getsessiondt })
      );
    } catch (error) {
      console.error("Error building dt header:", error);
      cachedDtHeader = "";
    }
  }
  const auth = Cookies.get('auth');
  const authHeaderValue = auth
    ? (auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`)
    : '';

  const { includeSp = true } = options || {};
  const headers = {
    Authorization: authHeaderValue,
    dt: cachedDtHeader ?? "",
  };

  if (includeSp) {
    headers.sp = "itaskpro";
  }

  return headers;
};

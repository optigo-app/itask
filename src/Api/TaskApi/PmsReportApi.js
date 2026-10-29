import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

// Server-side PMS aggregation (mode=pmsreport).
// rd = employee-wise summary, rd1 = module-wise summary, rd2 = category counts per group.
// startdatefrom / startdateto are 'YYYY-MM-DD' bounds on DeadLineDate ('' = no filter).
export const PmsReportApi = async ({ startdatefrom = '', startdateto = '' } = {}) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({ startdatefrom, startdateto });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"pmsreport\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (tasklist)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        return response?.Data ?? {};
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
};

// Lazy drill-down for the detail modal - one group's tasks only.
// rd = task rows for the requested module OR assignee within the same date window.
export const PmsReportDetailApi = async ({ moduleid = 0, assigneeid = 0, startdatefrom = '', startdateto = '' } = {}) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({ moduleid, assigneeid, startdatefrom, startdateto });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"pmsreportdetail\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (tasklist)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        return response?.Data?.rd ?? [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

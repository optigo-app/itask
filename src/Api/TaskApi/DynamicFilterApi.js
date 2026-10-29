import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const DynamicFilterApi = async (parsedData) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        // Support both plain taskid and full parsedData object
        const data = (parsedData !== null && typeof parsedData === 'object')
            ? parsedData
            : { taskid: parsedData };

        const payload = {
            taskid: `${data?.taskid ?? ''}`,
            teamid: `${data?.teamid ?? '1'}`,
            isCompleted: `${data?.isCompleted ?? 0}`,
            isarchive: `${data?.isarchive ?? 0}`,
        };
        // entrydate range — only sent when set; SP expects YYYY-MM-DD (local date)
        const toSqlDate = (v) => {
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return '';
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        if (data?.fdate) payload.fdate = toSqlDate(data.fdate);
        if (data?.tdate) payload.tdate = toSqlDate(data.tdate);
        const combinedValue = JSON.stringify(payload);
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"QUICKLIST\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
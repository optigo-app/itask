import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const deleteTaskDataApi = async (selectedRow) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        // Support both single taskid and bulk (comma-separated) taskid
        const taskid = selectedRow?.taskid;
        const taskids = selectedRow?.taskids; // comma-separated string or array

        let combinedValue;
        if (taskids || (typeof taskid === 'string' && taskid.includes(',')) || Array.isArray(taskid)) {
            // Bulk mode: pass comma-separated IDs in taskid field
            const idList = Array.isArray(taskids)
                ? taskids.join(',')
                : (taskids || (Array.isArray(taskid) ? taskid.join(',') : taskid));
            combinedValue = JSON.stringify({
                taskid: idList,
            });
        } else {
            // Single mode: pass single taskid
            combinedValue = JSON.stringify({
                taskid: `${taskid ?? '0'}`,
            });
        }

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_trash\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (task_trash)",
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
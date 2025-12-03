import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const MoveTaskApi = async (taskId, parentId) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        let combinedValue = JSON.stringify({
            "taskid": taskId ?? 0,
            "toparentid": parentId ?? 0,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"movetask\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (tasklist)",
            "p": combinedValue,
        };

        const response = await CommonAPI(body);

        if (response?.Data) {
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const TaskSearchApi = async ({ search = '', taskno = '', top = 50 } = {}) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"tasksearch\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management Global Search (tasklist)",
            "p": JSON.stringify({
                search: `${search ?? ''}`,
                taskno: `${taskno ?? ''}`,
                top: `${top ?? 50}`,
            }),
        };
        const response = await CommonAPI(body);
        return response?.Data || [];
    } catch (error) {
        console.error('TaskSearchApi error:', error);
        return [];
    }
};

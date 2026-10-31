import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress, getUserProfileData } from "../../Utils/globalfun";

export const TaskSummaryApi = async () => {
    const AuthData = getAuthData();
    const profile = getUserProfileData();
    const ipAddress = await getClientIpAddress();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"tasksummary\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
            "p": JSON.stringify({ assigneeid: profile?.id ?? 0 }),
        };
        const response = await CommonAPI(body);
        return response?.Data ?? {};
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
};

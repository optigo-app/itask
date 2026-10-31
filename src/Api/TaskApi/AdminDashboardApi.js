import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const fetchAdminDashboardApi = async () => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"admindashboard\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (tasklist)",
            "p": JSON.stringify({}),
        };
        const response = await CommonAPI(body);
        return response?.Data ?? {};
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
};

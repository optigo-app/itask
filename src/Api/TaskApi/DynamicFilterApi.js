import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const DynamicFilterApi = async (taskid) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"QUICKLIST\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
            "p": `{\"taskid\":\"${taskid ?? ''}\"}`,
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
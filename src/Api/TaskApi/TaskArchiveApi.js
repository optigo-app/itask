import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const taskArchiveApi = async (selectedRow) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskarchive\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskarchive)",
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
import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const RestoreArchiveTaskApi = async (parsedData) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const restoreIds = parsedData?.restoreids ?? parsedData?.taskid ?? '';
        const combinedValue = JSON.stringify({
            restoreids: `${restoreIds}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"restoretask\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (restoretask)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response.Data;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};
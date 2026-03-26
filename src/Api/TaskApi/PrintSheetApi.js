import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const AddPrintSheetCountApi = async (selectedRow) => {
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const combinedValue = JSON.stringify({
            "taskid": selectedRow?.taskid ?? "",
            
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"print_count\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
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

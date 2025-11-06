import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const fetchTaskDataFullApi = async (parsedData) => {
    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            taskid: `${parsedData?.taskid ?? ''}`,
            teamid: `${parsedData?.teamid ?? '1'}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"treelist\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
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
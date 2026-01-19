import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchTaskDataFullApi = async (parsedData) => {
    try {
        const combinedValue = JSON.stringify({
            taskid: `${parsedData?.taskid ?? ''}`,
            teamid: `${parsedData?.teamid ?? '1'}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"treelist\"}`,
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
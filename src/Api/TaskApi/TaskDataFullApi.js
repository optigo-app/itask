import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchTaskDataFullApi = async (parsedData) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            taskid: `${parsedData?.taskid ?? ''}`,
            teamid: `${parsedData?.teamid ?? '1'}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"treelist\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
            "p": parsedData ? combinedValue : "",
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
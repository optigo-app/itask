import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchTaskDataFullApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"treelist\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
            "p": "",
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
import { CommonAPI } from "../InitialApi/CommonApi";

export const DynamicFilterMasterApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"quickreportmasters\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management Dynamic Filter master (tasklist)",
            "p": "{}",
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
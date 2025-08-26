import { CommonAPI } from "../InitialApi/CommonApi";

export const DynamicFilterApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"QUICKLIST\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
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
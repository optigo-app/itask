import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchLoginApi = async (data) => {
    try {
        const combinedValue = JSON.stringify({
            companycode: data?.companycode ?? '',
            psw: data?.psw ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"login\",\"appuserid\":\"${data?.userId ?? ''}\"}`,
            "f": "Task Management (login)",
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
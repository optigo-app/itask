import { CommonAPI } from "../InitialApi/CommonApi";

export const DynamicFilterMasterApi = async () => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"quickreportmasters\"}`,
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
import { CommonAPI } from "../InitialApi/CommonApi";

export const DynamicFilterApi = async (taskid) => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"QUICKLIST\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
            "p": `{\"taskid\":\"${taskid ?? ''}\"}`,
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
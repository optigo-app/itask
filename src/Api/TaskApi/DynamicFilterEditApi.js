import { CommonAPI } from "../InitialApi/CommonApi";

export const DynamicFilterEditApi = async (data, task) => {
    try {
        const combinedValue = JSON.stringify({
            "taskid": task?.id ?? "",
            ...data
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"Quicklist_edit\"}`,
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

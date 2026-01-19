import { CommonAPI } from "../InitialApi/CommonApi";

export const TaskFrezzeApi = async (formValues) => {
    try {
        const combinedValue = JSON.stringify({
            "taskid": formValues?.taskid ?? '',
            "isFreez": formValues?.isFreez ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_freez\"}`,
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

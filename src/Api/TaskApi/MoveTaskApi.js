import { CommonAPI } from "../InitialApi/CommonApi";

export const MoveTaskApi = async (taskId, parentId) => {
    try {
        let combinedValue = JSON.stringify({
            "taskid": taskId ?? 0,
            "toparentid": parentId ?? 0,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"movetask\"}`,
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

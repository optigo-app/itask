import { CommonAPI } from "../InitialApi/CommonApi";

export const taskCommentGetApi = async (selectedRow) => {
    try {
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_getcomment\"}`,
            "f": "Task Management (task_getcomment)",
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
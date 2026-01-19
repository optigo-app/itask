import { CommonAPI } from "../InitialApi/CommonApi";

export const taskDescAddApi = async (selectedRow, taskDesc) => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? '0'}`,
            descr: `${taskDesc ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_descr_save\"}`,
            "f": "Task Management (task_descr_save)",
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
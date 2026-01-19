import { CommonAPI } from "../InitialApi/CommonApi";

export const deleteMeetingApi = async (selectedRow) => {
    try {
        const combinedValue = JSON.stringify({
            meetingid: `${(selectedRow?.id || selectedRow?.meetingid) ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmeetingdel\"}`,
            "f": "Task Management (task_trash)",
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
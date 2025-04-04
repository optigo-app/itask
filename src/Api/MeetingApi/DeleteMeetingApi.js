import { CommonAPI } from "../InitialApi/CommonApi";

export const deleteMeetingApi = async (selectedRow) => {
    console.log('selectedRow: ', selectedRow);
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const combinedValue = JSON.stringify({
            meetingid: `${selectedRow?.id ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmeetingdel\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
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
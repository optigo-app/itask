import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchTaskDataApi = async (selectedRow) => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"tasklist\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
            "f": "Task Management (tasklist)",
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
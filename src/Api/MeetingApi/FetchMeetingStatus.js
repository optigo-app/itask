import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMettingDetailApi = async (selectedRow) => {
    try {
        const combinedValue = JSON.stringify({
            meetingid: `${selectedRow?.meetingid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetingdetails\"}`,
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
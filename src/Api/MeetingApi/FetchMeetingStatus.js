import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMettingDetailApi = async (selectedRow) => {
    console.log('selectedRow: ', selectedRow);
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams') ?? '');
    try {
        const combinedValue = JSON.stringify({
            meetingid: `${selectedRow?.meetingid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetingdetails\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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
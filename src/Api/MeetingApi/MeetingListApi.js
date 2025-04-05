import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMettingListApi = async (selectedRow) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglist\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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
import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const deleteMeetingApi = async (selectedRow) => {
    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            meetingid: `${(selectedRow?.id || selectedRow?.meetingid) ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmeetingdel\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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
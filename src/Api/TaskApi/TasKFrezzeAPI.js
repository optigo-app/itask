import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const TaskFrezzeApi = async (formValues) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        const combinedValue = JSON.stringify({
            "taskid": formValues?.taskid ?? '',
            "isFreez": formValues?.isFreez ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_freez\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
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

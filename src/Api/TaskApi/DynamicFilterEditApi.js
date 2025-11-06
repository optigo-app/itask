import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const DynamicFilterEditApi = async (data, task) => {

    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            "taskid": task?.id ?? "",
            ...data
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"Quicklist_edit\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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

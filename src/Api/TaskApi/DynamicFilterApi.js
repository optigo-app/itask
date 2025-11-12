import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const DynamicFilterApi = async (taskid) => {
    const AuthData = getAuthData();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"QUICKLIST\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management Dynamic Filter (tasklist)",
            "p": `{\"taskid\":\"${taskid ?? ''}\"}`,
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
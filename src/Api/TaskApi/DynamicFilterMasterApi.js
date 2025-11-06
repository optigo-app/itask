import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const DynamicFilterMasterApi = async () => {
    const AuthData = getAuthData();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"quickreportmasters\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management Dynamic Filter master (tasklist)",
            "p": "{}",
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
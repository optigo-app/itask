import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const EstimateCalApi = async (splitestimate) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        let combinedValue = JSON.stringify({
            "splitestimate": splitestimate ?? "",
        });
        const body = {
            "con": `{"id":"","mode":"estimateTaskSave","appuserid":"${AuthData?.uid ?? ''}","IPAddress":"${ipAddress}"}`,
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

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const AddPrTeamsApi = async (formattedTeamList, decodedData) => {
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const combinedValue = JSON.stringify({
            "taskid": decodedData?.taskid ?? "",
            "rolenamelist": formattedTeamList ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskteamrolesave\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
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

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const DelPrTeamsApi = async (selectedTeamMember, decodedData) => {
    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            "taskid": decodedData?.taskid ?? "",
            "assigneeid": selectedTeamMember?.assigneeid ?? "",
        });
        
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskteamroledel\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        if (response) {
            return response;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

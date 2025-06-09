import { CommonAPI } from "../InitialApi/CommonApi";

export const DelPrTeamsApi = async (selectedTeamMember, decodedData) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            "taskid": decodedData?.taskid ?? "",
            "assigneeid": selectedTeamMember?.assigneeid ?? "",
        });
        
        console.log('combinedValue: ', combinedValue);
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

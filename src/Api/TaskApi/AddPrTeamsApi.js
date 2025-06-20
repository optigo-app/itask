import { CommonAPI } from "../InitialApi/CommonApi";

export const AddPrTeamsApi = async (formattedTeamList, decodedData) => {
    console.log('formattedTeamList: ', formattedTeamList);
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            "taskid": decodedData?.taskid ?? "",
            "rolenamelist": formattedTeamList ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskteamrolesave\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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

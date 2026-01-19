import { CommonAPI } from "../InitialApi/CommonApi";

export const GetPrTeamsApi = async (decodedData, flag) => {
    try {
        const combinedValue = JSON.stringify({
            "taskid": (flag == "subroot" ? decodedData?.moduleid : decodedData?.moduleid ?? decodedData?.taskid) ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskteamlist\"}`,
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

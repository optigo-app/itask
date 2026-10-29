import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const ModuleMilestoneReportApi = async () => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({
            taskid: "",
            teamid: "1",
            isCompleted: 0,
            isarchive: 0,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"modulemilestonereport\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (tasklist)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        return response?.Data ?? {};
    } catch (error) {
        console.error('Error:', error);
        return {};
    }
};

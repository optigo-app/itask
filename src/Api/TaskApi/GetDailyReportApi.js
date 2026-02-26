import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const GetDailyReportApi = async () => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();

    try {
        const body = {
            con: `{"id":"","mode":"getdailyreport","appuserid":"${AuthData?.uid ?? ""}","IPAddress":"${ipAddress}"}`,
            f: "Task Management (tasklist)",
            p: "",
        };

        const response = await CommonAPI(body);

        if (response?.Data) {
            return response.Data;
        }

        return [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

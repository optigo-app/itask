import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const DailyReportSaveApi = async (payload) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();

    try {
        const combinedValue = JSON.stringify({
            takenbyempid: payload?.takenbyempid ?? "",
            givenbyempid: payload?.givenbyempid ?? "",
            remarks: payload?.remarks ?? "",
            isdone: payload?.isdone ?? "0",
        });

        const body = {
            con: `{"id":"","mode":"dailyreport_save","appuserid":"${AuthData?.uid ?? ""}","IPAddress":"${ipAddress}"}`,
            f: "Task Management (tasklist)",
            p: combinedValue,
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

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const AssigneeMaster = async () => {
    try {
        const ipAddress = await getClientIpAddress();
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskemployee\",\"appuserid\":\"${init?.userid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskmaster)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            const sortedData = response.Data.rd.sort((a, b) => {
                if (a?.firstname?.localeCompare(b?.firstname) === 0) {
                    return a?.lastname?.localeCompare(b?.lastname);
                }
                return a?.firstname?.localeCompare(b?.firstname);
            });
            sessionStorage.setItem('taskAssigneeData', JSON.stringify(sortedData));
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

export const getAdvancedtaseditApi = async (taskid) => {
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const body = {
            con: `{\"id\":\"\",\"mode\":\"Quicklist_filter\",\"appuserid\":\"${AuthData?.uid ?? ""}\",\"IPAddress\":\"${ipAddress}\"}`,
            f: "Task Management (Quicklist_filter)",
            p: JSON.stringify({
                taskid: taskid ?? ''
            }),
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};
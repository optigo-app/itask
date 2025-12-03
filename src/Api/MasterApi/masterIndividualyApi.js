import { CommonAPI } from "../InitialApi/CommonApi";
import { getClientIpAddress } from "../../Utils/globalfun";

export const fetchIndidualApiMaster = async ({ mode }) => {
    try {
        const ipAddress = await getClientIpAddress();
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const body = {
            con: JSON.stringify({
                id: "",
                mode: mode,
                appuserid: init?.userid ?? "",
                IPAddress: ipAddress
            }),
            f: "Task Management (taskmaster)",
            p: "",
        };

        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};



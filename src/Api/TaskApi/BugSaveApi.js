import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const AddBugDataApi = async (formValues) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({
            "taskid": formValues?.taskid ?? '',
            "taskno": formValues?.taskno ?? 0,
            "bugtitle": formValues?.bugtitle ?? "",
            "solvedbyid": formValues?.solvedbyid ?? '',
            "codeby": formValues?.codeby ?? '',
            "testbyid": formValues?.testbyid ?? '',
            "bugpriorityid": formValues?.bugpriorityid ?? '',
            "bugstatusid": formValues?.bugstatusid ?? '',
            "bugimagepath": formValues?.bugimagepath ?? '',
            "remarks": formValues?.remarks ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"bugsave\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (bugsave)",
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

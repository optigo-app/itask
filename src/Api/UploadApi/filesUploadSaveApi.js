import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const filesUploadSaveApi = async (attachments, taskid) => {
    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            taskid: taskid ?? 0,
            folders: attachments ?? [],
        });

        const body = {
            con: `{\"id\":\"\",\"mode\":\"save_attachment\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Save attachment (tasklist)",
            p: combinedValue,
        };

        const response = await CommonAPI(body);

        if (response?.Data) {
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

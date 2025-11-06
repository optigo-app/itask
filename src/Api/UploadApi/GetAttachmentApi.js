import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const getAttachmentApi = async (decodedData) => {
    const AuthData = getAuthData();
    try {
        const combinedValue = JSON.stringify({
            taskid: `${decodedData?.taskid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"get_attachment\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (Get Attachment)",
            "p": decodedData?.taskid ? combinedValue : "",
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
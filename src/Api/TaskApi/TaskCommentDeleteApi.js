import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const taskCommentDeleteApi = async (commentId) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({
            id: `${commentId ?? '0'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_comment_delete\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (task_comment_delete)",
            "p": combinedValue,
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

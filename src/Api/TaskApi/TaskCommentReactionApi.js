import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const taskCommentReactionApi = async (commentId, taskId, emoji = '👍') => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const combinedValue = JSON.stringify({
            commentid: `${commentId ?? '0'}`,
            taskid: `${taskId ?? '0'}`,
            emoji: `${emoji ?? '👍'}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_comment_reaction\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (task_comment_reaction)",
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

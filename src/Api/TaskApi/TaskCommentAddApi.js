import { CommonAPI } from "../InitialApi/CommonApi";

export const taskCommentAddApi = async (selectedRow, newCommentData) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? '0'}`,
            comment: `${newCommentData ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_comment_save\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (task_comment_save)",
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
import { CommonAPI } from "../../Utils/CommonApi";

export const taskCommentAddApi = async (selectedRow, newCommentData) => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? '0'}`,
            comment: `${newCommentData?.description ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_comment_save\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
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
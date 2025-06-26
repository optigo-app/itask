import { CommonAPI } from "../InitialApi/CommonApi";

export const MoveTaskApi = async (taskId, parentId) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        let combinedValue = JSON.stringify({
            "taskid": taskId ?? 0,
            "toparentid": parentId ?? 0,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"movetask\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
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

import { CommonAPI } from "../InitialApi/CommonApi";

export const AssigneeMaster = async () => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskemployee\",\"appuserid\":\"${init?.userid ?? ''}\"}`,
            "f": "Task Management (taskmaster)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            sessionStorage.setItem('taskAssigneeData', JSON.stringify(response?.Data?.rd));
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
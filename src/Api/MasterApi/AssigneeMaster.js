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
            const sortedData = response.Data.rd.sort((a, b) => {
                if (a?.firstname?.localeCompare(b?.firstname) === 0) {
                    return a?.lastname?.localeCompare(b?.lastname);
                }
                return a?.firstname?.localeCompare(b?.firstname);
            });
            sessionStorage.setItem('taskAssigneeData', JSON.stringify(sortedData));
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
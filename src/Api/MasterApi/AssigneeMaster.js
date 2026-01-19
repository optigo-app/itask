import { CommonAPI } from "../InitialApi/CommonApi";

export const AssigneeMaster = async () => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskemployee\"}`,
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

export const getAdvancedtaseditApi = async (taskid) => {
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"Quicklist_filter\"}`,
            f: "Task Management (Quicklist_filter)",
            p: JSON.stringify({
                taskid: taskid ?? ''
            }),
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};
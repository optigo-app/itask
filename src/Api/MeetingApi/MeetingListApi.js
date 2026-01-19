import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMettingListApi = async (selectedRow) => {
    try {
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? ''}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglist\"}`,
            "f": "Task Management (tasklist)",
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


export const fetchMettingListByLoginApi = async (selectedRow) => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglistbylogin\"}`,
            "f": "Task Management (tasklist)",
            "p": "",
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

export const fetchMettingFullDetailsListApi = async (selectedRow) => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetingdetailslist\"}`,
            "f": "Task Management (tasklist)",
            "p": "",
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
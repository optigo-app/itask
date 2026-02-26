import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getUserProfileData,getClientIpAddress } from "../../Utils/globalfun";

export const fetchMettingListApi = async (selectedRow) => {
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? ''}`,
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglist\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
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
    const UserProfileData = getUserProfileData()
    try {
        const ipAddress = await getClientIpAddress();
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglistbylogin\",\"appuserid\":\"${(selectedRow?.uid || selectedRow?.userid) ?? UserProfileData?.userid}\",\"IPAddress\":\"${ipAddress}\"}`,
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
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetingdetailslist\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
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
import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getUserProfileData,getClientIpAddress } from "../../Utils/globalfun";

export const fetchMettingListApi = async (selectedRow, dateRange) => {
    const AuthData = getAuthData();
    try {
        const ipAddress = await getClientIpAddress();
        const combinedValue = JSON.stringify({
            taskid: `${selectedRow?.taskid ?? ''}`,
            startdatefrom: dateRange?.startdatefrom ?? '',
            startdateto: dateRange?.startdateto ?? '',
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


export const fetchMettingListByLoginApi = async (selectedRow, dateRange) => {
    const UserProfileData = getUserProfileData()
    try {
        const ipAddress = await getClientIpAddress();
        const combinedValue = JSON.stringify({
            startdatefrom: dateRange?.startdatefrom ?? '',
            startdateto: dateRange?.startdateto ?? '',
        });
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meetinglistbylogin\",\"appuserid\":\"${(selectedRow?.uid || selectedRow?.userid) ?? UserProfileData?.userid}\",\"IPAddress\":\"${ipAddress}\"}`,
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
import { getClientIpAddress } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMaster = async () => {
    try {
        const ipAddress = await getClientIpAddress();
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmaster\",\"appuserid\":\"${init?.userid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskmaster)",
            "p": '',
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

export const addEditDelMaster = async (payload) => {
    try {
        const ipAddress = await getClientIpAddress();
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        let mode = payload?.mode;
        let masterName = payload?.tabData?.table_name;
        let editMode = payload?.id;

        const combinedValue = JSON.stringify({
            master_table: `${masterName ?? ''}`,
            master_mode: `${mode ?? ''}`,
            master_id: `${editMode ?? ''}`,
            master_labelvalue: `${payload?.name ?? ''}`,
            master_displayorder: `${payload?.displayorder ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"master_action\",\"appuserid\":\"${init.userid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskmaster)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        return response?.Data?.rd;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};


import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMaster = async () => {
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmaster\"}`,
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
            "con": `{\"id\":\"\",\"mode\":\"master_action\"}`,
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


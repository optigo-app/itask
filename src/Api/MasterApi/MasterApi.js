import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchMaster = async () => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmaster\",\"appuserid\":\"${init?.userid ?? ''}\"}`,
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

export const addEditDelMaster = async (mode, masterName, newRow, editMode) => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        const combinedValue = JSON.stringify({
            master_table: `${masterName ?? ''}`,
            master_mode: `${mode ?? ''}`,
            master_id: `${editMode ?? ''}`,
            master_labelvalue: `${newRow?.labelname ?? ''}`,
            master_displayorder: `${newRow?.masterDisplayOrder ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"master_action\",\"appuserid\":\"${init.userid ?? ''}\"}`,
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


import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchIndidualApiMaster = async ({ mode }) => {
    try {
        const body = {
            con: JSON.stringify({
                id: "",
                mode: mode,
            }),
            f: "Task Management (taskmaster)",
            p: "",
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



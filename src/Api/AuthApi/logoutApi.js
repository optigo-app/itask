import { CommonAPI } from "../InitialApi/CommonApi";

export const LogoutApi = async () => {
    try {
        const body = {
            "con": "{\"id\":\"\",\"mode\":\"Logout\"}",
            "f": "Task Management (logout)",
            "p": "",
        };
        const response = await CommonAPI(body, { includeSp: false, skipTokenUpdate: true });
        debugger;
        if (response?.Data?.rd?.[0]?.stat === 1) {
            return response?.Data;
        } else {
            console.warn("No `rd` data found in response:", response);
            return response?.Data;
        }

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
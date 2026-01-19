import { CommonAPI } from "../InitialApi/CommonApi";

export const getAttachmentApi = async (decodedData) => {
    try {
        const combinedValue = JSON.stringify({
            taskid: `${decodedData?.taskid ?? ''}`,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"get_attachment\"}`,
            "f": "Task Management (Get Attachment)",
            "p": decodedData?.taskid ? combinedValue : "",
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
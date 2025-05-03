import { CommonAPI } from "../InitialApi/CommonApi";

export const filesUploadSaveApi = async ({attachments}) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"save_attachment\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Save attachment (tasklist)",
            "p": attachments,
        };

        const response = await CommonAPI(body);

        if (response?.Data) {
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

import { CommonAPI } from "../InitialApi/CommonApi";

export const filesUploadSaveApi = async (attachments, taskid ) => {
    debugger
    console.log('taskid: ', taskid);
    console.log('attachments: ', attachments);
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {


        const combinedValue = JSON.stringify({
            "taskid": taskid ?? 0,
            "folders": attachments ?? [],
        });
        
        console.log('combinedValue: ', combinedValue);
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"save_attachment\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Save attachment (tasklist)",
            "p": combinedValue,
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

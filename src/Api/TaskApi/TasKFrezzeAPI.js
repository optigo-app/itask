import { CommonAPI } from "../InitialApi/CommonApi";

export const TaskFrezzeApi = async (formValues) => {
    console.log('formValues: ', formValues);
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));
        const combinedValue = JSON.stringify({
            "taskid": formValues?.taskid ?? '',
            "isFreez": formValues?.isFreez ?? "",
        });
        console.log('combinedValue: ', combinedValue);

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_freez\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
            "f": "Task Management (tasklist)",
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

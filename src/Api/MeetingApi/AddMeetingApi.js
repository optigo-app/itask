import { CommonAPI } from "../InitialApi/CommonApi";

export const AddMeetingApi = async (formValues) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const combinedValue = JSON.stringify({
            "meetingid": formValues?.id ?? 0,
            "taskid": formValues?.prModule?.taskid ?? 0,
            "projectid": formValues?.prModule?.projectid ?? 0,
            "meetingtitle": formValues?.title ?? "",
            "StartDate": formValues?.start ?? '',
            "EndDate": formValues?.end ?? '',
            "assigneids": formValues?.assigneids ?? "",
            "isAllDay": formValues?.allDay ? 1 : 0 ?? 0,
            "descr": formValues?.description ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmeetingsave\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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

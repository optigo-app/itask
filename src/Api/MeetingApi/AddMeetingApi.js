import { CommonAPI } from "../InitialApi/CommonApi";

export const AddMeetingApi = async (formValues) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            "meetingid": formValues?.id ?? 0,
            "taskid": formValues?.prModule?.taskid ?? 0,
            "projectid": formValues?.prModule?.projectid ?? 0,
            "meetingtitle": (formValues?.title || formValues?.meetingtitle) ?? "",
            "StartDate": (formValues?.start || formValues?.StartDate) ?? '',
            "EndDate": (formValues?.end || formValues?.EndDate) ?? '',
            "assigneids": formValues?.assigneids ?? "",
            "isAllDay": (formValues?.allDay || formValues?.isAllDay) ? 1 : 0 ?? 0,
            "descr": (formValues?.description || formValues?.Desc) ?? "",
            // "isMeetingFlag": formValues?.isMeetingFlag ?? '0'
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

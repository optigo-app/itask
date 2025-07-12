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
            "estimate": formValues?.estimate ?? 0,
            "createdbyid": AuthData?.uid ?? '',
            "assigneids": formValues?.assigneids ?? "",
            "estimate_hrs": formValues?.estimate_hrs ?? 0,
            "estimate1_hrs": formValues?.estimate1_hrs ?? 0,
            "estimate2_hrs": formValues?.estimate2_hrs ?? 0,
            "DeadLineDate": (formValues?.DeadLineDate) ?? '',
            "priorityid": formValues?.priorityid ?? 0,
            "statusid": formValues?.statusid ?? 0,
            "workinghr": formValues?.workinghr ?? 0,
            "isfavourite":formValues?.isfavourite ?? 0,
            "isFreez":formValues?.isFreez ?? 0,
            "ismilestone": formValues?.ismilestone ?? 0,
            "isAllDay": (formValues?.allDay || formValues?.isAllDay) ? 1 : 0 ?? 0,
            "descr": (formValues?.description || formValues?.Desc) ?? "",
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

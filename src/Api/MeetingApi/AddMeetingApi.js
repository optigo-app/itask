import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getUserProfileData } from "../../Utils/globalfun";

export const AddMeetingApi = async (formValues) => {
    const AuthData = getUserProfileData();
    try {
        const combinedValue = JSON.stringify({
            "meetingid": (formValues?.meetingid || formValues?.id) ?? 0,
            "taskid": formValues?.taskid ?? 0,
            "parentid": formValues?.parentid ?? 0,
            "moduleid": formValues?.moduleid ?? 0,
            "projectid": formValues?.projectid ?? 0,
            "createdbyid": AuthData?.id ?? '',
            "assigneids": formValues?.assigneids ?? "",
            "meetingtitle": (formValues?.title || formValues?.meetingtitle || formValues?.taskname) ?? "",
            "StartDate": (formValues?.start || formValues?.StartDate) ?? '',
            "EndDate": (formValues?.end || formValues?.EndDate) ?? '',
            "estimate_hrs": (formValues?.estimate_hrs || formValues?.estimate) ?? 0,
            "estimate1_hrs": formValues?.estimate1_hrs ?? 0,
            "estimate2_hrs": formValues?.estimate2_hrs ?? 0,
            "DeadLineDate": (formValues?.DeadLineDate) ?? '',
            "priorityid": formValues?.priorityid ?? 0,
            "workcategoryid": formValues?.workcategoryid ?? 0,
            "statusid": formValues?.statusid ?? 0,
            "workinghr": formValues?.workinghr ?? 0,
            "isfavourite": formValues?.isfavourite ?? 0,
            "isFreez": formValues?.isFreez ?? 0,
            "ismilestone": formValues?.ismilestone ?? 0,
            "isAllDay": (formValues?.isAllDay) ? 1 : 0 ?? 0,
            "descr": (formValues?.description || formValues?.descr) ?? "",
            "repeatflag": formValues?.repeatflag ?? ""
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

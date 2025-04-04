import { convertSpecialCharsToWords } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const AddMeetingApi = async (formValues) => {
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        const combinedValue = JSON.stringify({
            "meetingid": formValues?.id ?? 0,
            "taskid": formValues?.prModule?.taskid ?? 0,
            "projectid": formValues?.prModule?.projectid ?? 0,
            "meetingtitle": convertSpecialCharsToWords(formValues?.title) ?? "",
            "StartDate": formValues?.start ?? '',
            "EndDate": formValues?.end ?? '',
            "assigneids": formValues?.assigneids ?? "",
            "isAllDay": formValues?.allDay ? 1 : 0 ?? 0,
            "descr": convertSpecialCharsToWords(formValues?.description) ?? "",
        });


        console.log('combinedValue: ', combinedValue);

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"taskmeetingsave\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
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

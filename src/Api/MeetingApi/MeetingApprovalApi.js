import { CommonAPI } from "../InitialApi/CommonApi";

export const MeetingApprovalAPI = async (formValues) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            "meetingid": formValues?.id ?? 0,
            "isAccept": formValues?.isAccept ?? 0,       // isAccept 1 for accept and isAccept 2 for reject
            "comment": formValues?.comment ?? "",
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"meeting_approvalsave\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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

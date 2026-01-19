import { CommonAPI } from "../InitialApi/CommonApi";

export const MeetingAttendAPI = async (updatedMeetings) => {
    try {
        const combinedValue = JSON.stringify({
            "meetingid": updatedMeetings?.id ?? 0,
            "ismeeting_attnd": updatedMeetings?.ismeeting_attnd ?? 0,       // ismeeting_attnd 1 for Attend and ismeeting_attnd 0 for pending
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"task_meeting_attnd\"}`,
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

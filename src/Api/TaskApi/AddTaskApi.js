import { convertSpecialCharsToWords } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const AddTaskDataApi = async (formValues, rootSubrootflagval, module) => {
   const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        let taskid;
        let parentid;
        if (rootSubrootflagval?.Task == 'subroot') {
            taskid = '0';
            parentid = formValues?.taskid ?? '0';
        }
        else {
            parentid = '0';
            taskid = formValues?.taskid ?? '0';
        }
        let combinedValue;
        if (formValues?.bulkTask?.length > 0) {
            const formattedString = formValues?.bulkTask?.map(task => `${task.taskName}#${task.estimate}`).join(", ");
            console.log(formattedString);
            combinedValue = JSON.stringify({
                "ismodule": 2,
                "projectid": formValues?.projectid ?? 0,
                "taskname": formattedString ?? "",
                "parentid": formValues?.taskid ?? 0,
            });
        } else {
            combinedValue = JSON.stringify({
                "ismodule": module?.module ? 1 : 0,
                "taskid": taskid ?? 0,
                "projectid": formValues?.projectid ?? 0,
                "taskname": convertSpecialCharsToWords(formValues?.taskname) ?? "",
                "StartDate": formValues?.StartDate ?? '',
                "estimate_hrs": (formValues?.estimate_hrs != "" ? formValues?.estimate_hrs : 0) ?? 0,
                "estimate1_hrs": (formValues?.estimate1_hrs != "" ? formValues?.estimate1_hrs : 0) ?? 0,
                "estimate2_hrs": (formValues?.estimate2_hrs != "" ? formValues?.estimate2_hrs : 0) ?? 0,
                "DeadLineDate": formValues?.DeadLineDate ?? '',
                "priorityid": formValues?.priorityid ?? 0,
                "statusid": formValues?.statusid ?? 0,
                "workcategoryid": formValues?.workcategoryid ?? 0,
                "departmentid": formValues?.departmentid ?? 0,
                "parentid": parentid ?? 0,
                "descr": convertSpecialCharsToWords(formValues?.descr) ?? "",
                "ismilestone": formValues?.ismilestone ?? 0,
                "isfavourite": formValues?.isfavourite ?? 0,
                "assigneids": formValues?.assigneids ?? "",
            });
        }

        console.log('combinedValue: ', combinedValue);

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"tasksave\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
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

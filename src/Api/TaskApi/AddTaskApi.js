import { CommonAPI } from "../InitialApi/CommonApi";

export const AddTaskDataApi = async (formValues, formDataValue, rootSubrootflagval, mode) => {
    debugger
    console.log('mode: ', mode?.mode);
    try {
        const init = JSON.parse(sessionStorage.getItem('taskInit'));

        let taskid;
        let parentid;
        if (rootSubrootflagval?.Task == 'subroot') {
            taskid = '0';
            parentid = formDataValue?.taskid ?? '0';
        } else {
            parentid = '0';
            taskid = formDataValue?.taskid ?? '0';
        }

        const combinedValue = JSON.stringify({
            "taskid": taskid,
            "projectid": formValues?.project ?? "",
            "taskname": formValues?.taskName ?? "",
            "StartDate": formDataValue?.StartDate ?? '',
            "estimate_hrs": formDataValue?.estimate_hrs ?? "0.0",
            "DeadLineDate": formValues?.dueDate ?? '',
            "priorityid": formValues?.priority ?? "0",
            "statusid": formValues?.status ?? "0",
            "workcategoryid": formDataValue?.workcategoryid ?? "",
            "departmentid": formDataValue?.departmentid ?? "",
            "parentid": parentid
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"tasksave\",\"appuserid\":\"${init?.userid ?? 'amrut@eg.com'}\"}`,
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

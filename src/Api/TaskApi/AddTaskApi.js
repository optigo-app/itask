import { CommonAPI } from "../InitialApi/CommonApi";

export const AddTaskDataApi = async (formValues, rootSubrootflagval, module) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    const userProfile = JSON.parse(localStorage.getItem('UserProfileData'));
    try {
        let taskid;
        let parentid;
        if (rootSubrootflagval?.Task == 'subroot') {
            taskid = '0';
            parentid = formValues?.taskid ?? '0';
        } else if (rootSubrootflagval?.Task == 'splitroot') {
            taskid = '0';
            parentid = formValues?.parentid ?? '0';
        }
        else {
            parentid = '0';
            taskid = formValues?.taskid ?? '0';
        }
        let combinedValue;
        const dropdowns = {};
        Object.entries(formValues?.dynamicDropdowns ?? {}).forEach(([key, val]) => {
            dropdowns[key] = String(val);
        });
        if (formValues?.bulkTask?.length > 0) {
            const formattedString = formValues?.bulkTask?.map(task => `${task.taskName}#${task.estimate}#${formValues.deadLineDate ?? ''}`).join(", ");
            combinedValue = JSON.stringify({
                "ismodule": 2,
                "maintaskid": formValues?.moduleid ?? formValues?.taskid ?? '',
                "projectid": formValues?.projectid ?? 0,
                "taskname": formattedString ?? "",
                "parentid": formValues?.taskid ?? 0,
                "createdbyid": userProfile?.id ?? 0,
                "assigneids": userProfile?.id ?? "",
                ...dropdowns,
            });
        } else {
            combinedValue = JSON.stringify({
                "ismodule": module?.module ? 1 : 0,
                "maintaskid": formValues?.moduleid ?? formValues?.taskid ?? '',
                "taskid": taskid ?? '',
                "projectid": formValues?.projectid ?? 0,
                "taskname": formValues?.taskname ?? "",
                "StartDate": formValues?.StartDate ?? '',
                "EndDate": formValues?.EndDate ?? '',
                "estimate_hrs": (formValues?.estimate_hrs != "" ? formValues?.estimate_hrs : 0) ?? 0,
                "estimate1_hrs": (formValues?.estimate1_hrs != "" ? formValues?.estimate1_hrs : 0) ?? 0,
                "estimate2_hrs": (formValues?.estimate2_hrs != "" ? formValues?.estimate2_hrs : 0) ?? 0,
                "workinghr": formValues?.finalEstimate ?? 0,
                "DeadLineDate": formValues?.DeadLineDate ?? '',
                "priorityid": formValues?.priorityid ?? 0,
                "statusid": formValues?.statusid ?? 0,
                "secstatusid": formValues?.secstatusid ?? 0,
                "workcategoryid": formValues?.workcategoryid ?? 0,
                "departmentid": formValues?.departmentid ?? 0,
                "parentid": parentid ?? 0,
                "descr": formValues?.descr ?? "",
                "ismilestone": formValues?.ismilestone ?? 0,
                "isfavourite": formValues?.isfavourite ?? 0,
                "assigneids": formValues?.assigneids ?? "",
                "createdbyid": (Array.isArray(formValues?.createdBy) && formValues?.createdBy.length > 0 ? formValues?.createdBy[0]?.id : formValues?.createdbyid) ?? 0,
                "departmentAssigneelist": formValues?.departmentAssigneelist ?? "",
                "maingroupids": module?.module ? formValues?.maingroupids : '',
                ...dropdowns,
            });
        }

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

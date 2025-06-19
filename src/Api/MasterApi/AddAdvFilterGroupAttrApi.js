import { CommonAPI } from "../InitialApi/CommonApi";

export const AddAdvFilterGroupAttrApi = async (formValues) => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams'));
    try {
        const combinedValue = JSON.stringify({
            "filtergroup": formValues?.id ?? 0,
            "filterattr": formValues?.prModule?.taskid ?? 0,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"addfiltergroupattr\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (AddAdvFilterGroupAttrApi)",
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

// Master Name
export const AttrGroupApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams') ?? '');
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"filtergroup\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (AttrGroupApi)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

//  Master Option list api
export const AttrListApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams') ?? '');
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"filterattr\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (AttrListApi)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

// merge Group and Attr
export const BindAttrGroupApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem('AuthqueryParams') ?? '');
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"filter_group_attr_bind\",\"appuserid\":\"${AuthData?.uid ?? ''}\"}`,
            "f": "Task Management (tasklist)",
            "p": '',
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
import { CommonAPI } from "../InitialApi/CommonApi";

export const AddAdvFilterGroupAttrApi = async (payload) => {
    const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams"));
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"addfiltergroupattr\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (AddAdvFilterGroupAttrApi)",
            p: JSON.stringify(payload ?? []),
        };
        console.log("body-->>>: ", body);
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

// Main Master Name
export const AttrMasterNameApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams") ?? "");
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"filtermaingroup\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (filtermaingroup)",
            p: "",
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

// Group Name
export const AttrGroupApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams") ?? "");
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"filtergroup\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (AttrGroupApi)",
            p: "",
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

//  Master Option list api
export const AttrListApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams") ?? "");
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"filterattr\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (AttrListApi)",
            p: "",
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

// merge Group and Attr
export const BindAttrGroupApi = async () => {
    const AuthData = JSON.parse(localStorage.getItem("AuthqueryParams") ?? "");
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"filter_group_attr_bind\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (tasklist)",
            p: "",
        };
        const response = await CommonAPI(body);
        if (response?.Data) {
            return response?.Data;
        } else {
            return [];
        }
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData } from "../../Utils/globalfun";

export const AddAdvFilterGroupAttrApi = async (payload) => {
    const AuthData = getAuthData();
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"addfiltergroupattr\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (AddAdvFilterGroupAttrApi)",
            p: JSON.stringify(payload ?? []),
        };
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
    const AuthData = getAuthData();
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
    const AuthData = getAuthData();
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
    const AuthData = getAuthData();
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
    const AuthData = getAuthData();
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"filter_group_attr_bind\",\"appuserid\":\"${AuthData?.uid ?? ""
                }\"}`,
            f: "Task Management (BindAttrGroupApi)",
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

// delete master
export const deleteAdvancedMasterApi = async (formAdvData, bindType) => {
    console.log("deleteAdvancedMasterApi", formAdvData, bindType);
    const AuthData = getAuthData();
    const bindMode = bindType == "main group" ? "maingroup" : bindType == "group" ? "group" : "attr";
    const bindid = bindType == "main group" ? formAdvData?.id : bindType == "group" ? formAdvData?.subid : formAdvData?.itemid;
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"delfiltergroupattr\",\"appuserid\":\"${AuthData?.uid ?? ""}\"}`,
            f: "Task Management (deleteAdvancedMasterApi)",
            p: JSON.stringify({ bindtype: bindMode ?? "", bindid: bindid ?? "" }),
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

// Edit master
export const editAdvancedMasterApi = async (formAdvData, bindType) => {
    const AuthData = getAuthData();
    const bindMode = bindType == "main group" ? "maingroup" : bindType == "group" ? "group" : "attr";
    const bindid = bindType == "main group" ? formAdvData?.id : bindType == "group" ? formAdvData?.subid : formAdvData?.itemid;
    try {
        const body = {
            con: `{\"id\":\"\",\"mode\":\"editfiltergroupattr\",\"appuserid\":\"${AuthData?.uid ?? ""}\"}`,
            f: "Task Management (editfiltergroupattr)",
            p: JSON.stringify({
                bindid: bindid ?? '',
                bindtype: bindMode ?? '',
                bindname: formAdvData?.updatedValue ?? '',
            }),
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

import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress, getUserProfileData } from "../../Utils/globalfun";

export const bugApi = async (mode, params = {}) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const body = {
            "con": `{\"id\":\"\",\"mode\":\"${mode}\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Bug Management (bugmaster)",
            "p": JSON.stringify(params.p || params || {}),
        };
        const response = await CommonAPI(body, { version: "v1", sp: "146" });
        return response?.Data || {};
    } catch (error) {
        console.error(`Error in ${mode} API:`, error);
        return {};
    }
};

export const getBugDashboardApi = async (params = {}) => {
    const AuthData = getAuthData();
    const profile = getUserProfileData();
    const designation = (profile?.designation || '').toLowerCase();

    const p = { ...params };
    // Non-admin sees only own bugs: tester -> reported, others (developer) -> assigned
    if (designation !== 'admin') {
        p.filterType = 'me';
        p.userId = profile?.id ?? AuthData?.uid;
        p.filterBy = designation === 'tester' ? 'reporter' : 'assignee';
    }
    return bugApi('dashboard', { p });
};

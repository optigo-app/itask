import { getClientIpAddress } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const GetTokenByCompanyCodeApi = async (data) => {
    try {
        const ipAddress = await getClientIpAddress();

        const combinedValue = JSON.stringify({
            companycode: data?.companycode ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"gettokenbycompanycode\",\"appuserid\":\"${data?.userId ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (gettokenbycompanycode)",
            "p": combinedValue,
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
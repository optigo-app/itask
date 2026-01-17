import { getClientIpAddress } from "../../Utils/globalfun";
import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchLoginApi = async (data) => {
    try {
        const ipAddress = await getClientIpAddress();

        const combinedValue = JSON.stringify({
            companycode: data?.companycode ?? '',
            psw: data?.password ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"login\",\"appuserid\":\"${data?.userId ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (login)",
            "p": combinedValue,
        };
        const response = await CommonAPI(body);
        if (response?.Data?.rd?.[0]?.stat === 1) {
            sessionStorage.setItem("taskInit", JSON.stringify(response.Data.rd[0]));
            sessionStorage.setItem("pageAccess", JSON.stringify(response.Data.rd1));
            return response?.Data;
        } else {
            console.warn("No `rd` data found in response:", response);
            return response?.Data;
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
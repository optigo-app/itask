import { CommonAPI } from "../InitialApi/CommonApi";

export const fetchLoginApi = async (data) => {
    try {
        const combinedValue = JSON.stringify({
            companycode: data?.companycode ?? '',
            psw: data?.password ?? '',
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"login\",\"appuserid\":\"${data?.userId ?? ''}\"}`,
            "f": "Task Management (login)",
            "p": combinedValue,
        };
        debugger
        const response = await CommonAPI(body);
        console.log("loginData", response);
        if (response?.Data?.rd?.[0]?.stat === 1) {
            sessionStorage.setItem("taskInit", JSON.stringify(response.Data.rd[0]));
            sessionStorage.setItem("pageAccess", JSON.stringify(response.Data.rd1));
            return response?.Data;
        } else {
            console.warn("No `rd` data found in response:", response);
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};
import { CommonAPI } from "../InitialApi/CommonApi";
import { getAuthData, getClientIpAddress } from "../../Utils/globalfun";

export const fetchFullTaskReportApi = async (orderBy = "order by FullPath asc", pageSize = "100", currentPage = "1", filter = {}) => {
    const AuthData = getAuthData();
    const ipAddress = await getClientIpAddress();
    try {
        const {
            pageSize: _ignoredPageSize,
            currentPage: _ignoredCurrentPage,
            PageSize: _ignoredPageSizeCaps,
            CurrentPage: _ignoredCurrentPageCaps,
            ...flatFilterParams
        } = filter || {};

        const combinedValue = JSON.stringify({
            OrderBy: orderBy,
            PageSize: pageSize,
            CurrentPage: currentPage,
            ...flatFilterParams,
        });

        const body = {
            "con": `{\"id\":\"\",\"mode\":\"TREELIST_FULLPATH\",\"appuserid\":\"${AuthData?.uid ?? ''}\",\"IPAddress\":\"${ipAddress}\"}`,
            "f": "Task Management (taskmaster)",
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